import { describe, expect, it, vi } from "vitest";
vi.mock("./telegram", () => ({ verifyTelegramProfile: vi.fn() }));
const database = vi.hoisted(() => ({ from: vi.fn(), rpc: vi.fn().mockResolvedValue({ data: 0, error: null }) }));
vi.mock("@/integrations/supabase/client.server", () => ({ supabaseAdmin: database }));
import { verifyTelegramProfile } from "./telegram";
import { Route } from "@/routes/api/public/lootzy";

// Invoke the real handler; no database is loaded before identity/role validation.
const handlers = Route.options.server?.handlers;
async function post(body: object) {
  const handler = handlers && typeof handlers !== "function" ? handlers.POST : undefined;
  if (typeof handler !== "function") throw new Error("POST handler missing");
  const response = await handler({ request: new Request("http://localhost/api/public/lootzy", { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }) } as Parameters<typeof handler>[0]);
  if (!(response instanceof Response)) throw new Error("Expected HTTP response");
  return response;
}
describe("admin API security", () => {
  it("rejects forged Telegram data even if body claims admin ID", async () => {
    vi.mocked(verifyTelegramProfile).mockRejectedValueOnce(new Error("Invalid signature"));
    const r = await post({ action: "grant", initData: "forged", target: 1, adminId: 5326022510, amount: 500 });
    expect(r.status).toBe(401);
  });
  it.each(["overview", "search", "detail", "grant", "decision", "bonus_add", "bonus_draw", "mining_start"])("blocks non-admin %s before accessing database", async action => {
    vi.mocked(verifyTelegramProfile).mockResolvedValueOnce({ id: 123, first_name: "User" });
    const r = await post({ action, initData: "valid-non-admin" });
    expect(r.status).toBe(403);
  });
});

describe("Telegram account initialization", () => {
  function mockDatabase(writeError: { message: string } | null = null, ads: { id: string; verified: boolean }[] = []) {
    const account = { telegram_id: 5326022510, first_name: "Admin", balance_cents: 0, red: 0, purple: 0, green: 0, pink: 0 };
    const upsert = vi.fn().mockResolvedValue({ data: null, error: writeError });
    database.from.mockImplementation((table: string) => {
      const result = { data: table === "lootzy_accounts" ? account : table === "lootzy_events" ? ads : [], error: null, count: 1 };
      const query = {
        eq: vi.fn().mockReturnThis(), gte: vi.fn().mockReturnThis(), lt: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(result),
        then: (resolve: (value: typeof result) => unknown) => Promise.resolve(result).then(resolve),
      };
      return { upsert, select: vi.fn().mockReturnValue(query) };
    });
    return { account, upsert };
  }

  it("loads admin profile and role when successful writes return no rows", async () => {
    const { account, upsert } = mockDatabase();
    vi.mocked(verifyTelegramProfile).mockResolvedValueOnce({ id: 5326022510, first_name: "Admin" });
    const response = await post({ action: "me", initData: "test-signed-launch" });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ account, isAdmin: true, ads: 0, reportedAds: 0, withdrawals: [], referrals: { invited: 0, confirmed: 0, keys: 0 } });
    expect(upsert).toHaveBeenCalledWith({ telegram_id: 5326022510, role: "admin" });
  });

  it("still rejects failed account writes", async () => {
    mockDatabase({ message: "Account write failed" });
    vi.mocked(verifyTelegramProfile).mockResolvedValueOnce({ id: 5326022510, first_name: "Admin" });
    const response = await post({ action: "me", initData: "test-signed-launch" });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Account write failed" });
  });

  it("blocks retired bonus mutations", async () => {
    mockDatabase();
    vi.mocked(verifyTelegramProfile).mockResolvedValueOnce({ id: 5326022510, first_name: "Admin" });
    const response = await post({ action: "bonus_draw", initData: "test-signed-launch" });
    expect(response.status).toBe(400);
    expect(database.rpc).not.toHaveBeenCalledWith("lootzy_bonus_nov09_manage", expect.anything());
  });

  it("never counts ten unverified reports toward a red key", async () => {
    mockDatabase(null, Array.from({ length: 10 }, (_, id) => ({ id: String(id), verified: false })));
    vi.mocked(verifyTelegramProfile).mockResolvedValueOnce({ id: 5326022510, first_name: "Admin" });
    const response = await post({ action: "me", initData: "test-signed-launch" });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ads: 0, reportedAds: 10, account: { red: 0 } });
  });

  it("counts only provider-verified ads in reward progress", async () => {
    mockDatabase(null, [{ id: "verified", verified: true }, { id: "reported", verified: false }]);
    vi.mocked(verifyTelegramProfile).mockResolvedValueOnce({ id: 5326022510, first_name: "Admin" });
    const response = await post({ action: "me", initData: "test-signed-launch" });
    expect(await response.json()).toMatchObject({ ads: 1, reportedAds: 2 });
  });
});