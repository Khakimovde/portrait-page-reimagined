import { describe, expect, it } from "vitest";
import { telegramCheckString, verifyTelegramProfile } from "./telegram";
describe("Telegram-only display identity", () => {
  it("binds the signed message to the user's bot ID", () => {
    const raw = new URLSearchParams({ auth_date: "1000", user: '{"id":1}', signature: "a", hash: "excluded" }).toString();
    expect(telegramCheckString(raw, 1000000).message).toBe('9261613826:WebAppData\nauth_date=1000\nuser={"id":1}');
  });
  it("rejects duplicate identity fields", () => expect(() => telegramCheckString("user=a&user=b")).toThrow("Duplicate"));
  it("rejects stale Telegram launches", () => expect(() => telegramCheckString("auth_date=1&signature=a", 86402000)).toThrow());
  it("rejects forged profile signatures", async () => {
    const raw = new URLSearchParams({ auth_date: String(Math.floor(Date.now() / 1000)), user: '{"id":1,"first_name":"Fake"}', signature: "a" }).toString();
    await expect(verifyTelegramProfile(raw)).rejects.toThrow();
  });
});