import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
vi.mock("@/lib/lootzy-cloud", () => ({ cloudCall: vi.fn() }));
import { cloudCall, type CloudResult, type Account } from "@/lib/lootzy-cloud";
import AdminPanel from "./admin-panel";
const account: Account = { telegram_id: 123, first_name: "Test User", last_name: null, username: "testuser", photo_url: null, balance_cents: 0, red: 0, purple: 0, green: 0, pink: 0, opened: 0, earned_cents: 0, created_at: "2026-10-29T10:00:00Z", updated_at: "2026-10-29T10:00:00Z", subscribed_at: null };
const base: CloudResult = { account, isAdmin: true, ads: 0, withdrawals: [], overview: { day: "2026-10-29", users: 1, reportedAds: 0, verifiedAds: 0, keys: 0, pending: 0 } };
describe("admin grant flow", () => {
  it("searches ID, adds exact dollars and pink keys and reads updated values", async () => {
    vi.mocked(cloudCall).mockResolvedValueOnce(base).mockResolvedValueOnce({ ...base, users: [account] }).mockResolvedValueOnce({ ...base, users: [account], events: [] }).mockResolvedValueOnce({ ...base, users: [{ ...account, balance_cents: 525, pink: 3 }], events: [] });
    render(<AdminPanel initData="test-only" back={() => {}} changed={() => {}} />);
    await screen.findByText("Jami users");
    fireEvent.click(screen.getByRole("button", { name: "Users" }));
    fireEvent.change(screen.getByLabelText("ID yoki username"), { target: { value: "123" } });
    fireEvent.click(screen.getByRole("button", { name: "Qidirish" }));
    fireEvent.click(await screen.findByRole("button", { name: /Test User/ }));
    fireEvent.change(await screen.findByLabelText("Dollar miqdori"), { target: { value: "5.25" } });
    fireEvent.change(screen.getByLabelText("Kalit soni"), { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: "pink kalit" }));
    fireEvent.click(screen.getByRole("button", { name: "Qo‘shish" }));
    await waitFor(() => expect(cloudCall).toHaveBeenLastCalledWith("test-only", expect.objectContaining({ action: "grant", target: 123, amount: 525, quantity: 3, color: "pink" })));
    expect(await screen.findByText("$5.25")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});