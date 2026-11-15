import { describe, expect, it } from "vitest";
import { isSubscribedStatus, menuKeyboard, parseStartReferrer, subscribeKeyboard, withdrawalText } from "./lootzy-bot";

describe("bot referral start", () => {
  it("reads the referrer from /start ref_<id>", () => expect(parseStartReferrer("/start ref_12345")).toBe(12345));
  it("ignores plain /start and malformed payloads", () => {
    expect(parseStartReferrer("/start")).toBeNull();
    expect(parseStartReferrer("/start ref_abc")).toBeNull();
  });
});

describe("channel subscription check", () => {
  it.each(["member", "administrator", "creator"])("%s counts as subscribed", status => expect(isSubscribedStatus({ status })).toBe(true));
  it.each(["left", "kicked"])("%s is not subscribed", status => expect(isSubscribedStatus({ status })).toBe(false));
  it("restricted user counts only while still a member", () => {
    expect(isSubscribedStatus({ status: "restricted", is_member: false })).toBe(false);
    expect(isSubscribedStatus({ status: "restricted", is_member: true })).toBe(true);
  });
});

describe("bot keyboards", () => {
  it("subscribe prompt links @Lootzy_en with a confirm button", () => {
    expect(subscribeKeyboard.inline_keyboard[0]?.[0]).toMatchObject({ url: "https://t.me/Lootzy_en" });
    expect(subscribeKeyboard.inline_keyboard[1]?.[0]).toMatchObject({ callback_data: "check_sub" });
  });
  it("main menu: Boshlash mini app, then Kanal + Support, then To'lovlar kanali", () => {
    const rows = menuKeyboard.inline_keyboard;
    expect(rows[0]?.[0]).toMatchObject({ web_app: { url: "https://6a7ab988cb4f5.xvest6.ru" } });
    expect(rows[1]?.map(b => "url" in b ? b.url : "")).toEqual(["https://t.me/Lootzy_en", "https://t.me/Lootzy_help"]);
    expect(rows[2]?.[0]).toMatchObject({ url: "https://t.me/Lootzy_Paid" });
  });
});

describe("withdrawal notices", () => {
  it.each(["pending", "approved", "paid", "rejected"])("has a message for %s", status => expect(withdrawalText(status, 500, "visa")).toContain("$5.00"));
});
