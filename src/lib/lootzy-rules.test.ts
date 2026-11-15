import { describe, expect, it } from "vitest";
import { CASES, EMPTY_KEYS, completionReward, referralLink } from "./lootzy-rules";
describe("Lootzy requirements", () => {
  it("keeps exactly the four requested cases", () => expect(CASES.map((c) => c.c)).toEqual(["red", "purple", "green", "pink"]));
  it("grants exactly one red key on the tenth completed ad", () => expect(completionReward("ads", 9, 10)).toEqual({ color: "red", quantity: 1, progress: 0 }));
  it("does not grant on the ninth ad", () => expect(completionReward("ads", 8, 9).quantity).toBe(0));
  it("grants one purple key for every ten referrals", () => expect(completionReward("referrals", 19, 20)).toEqual({ color: "purple", quantity: 1, progress: 0 }));
  it("does not grant the same milestone again", () => expect(completionReward("referrals", 10, 10).quantity).toBe(0));
  it("never grants green or pink through ads or referrals", () => {
    for (const source of ["ads", "referrals"] as const) expect(["green", "pink"]).not.toContain(completionReward(source, 0, 100).color);
    expect(EMPTY_KEYS.green).toBe(0); expect(EMPTY_KEYS.pink).toBe(0);
  });
  it("referral link opens the bot /start, not the Mini App", () => expect(referralLink(12345)).toBe("https://t.me/Lootzy_enbot?start=ref_12345"));
});import { recordAd, tashkentDay, adsToday } from "./lootzy-rules";
describe("daily ad limit", () => {
  const t = new Date("2026-10-29T10:00:00Z");
  it("10th ad earns one red key and progress restarts", () => { const r = recordAd({ day: tashkentDay(t), ads: 9 }, t); expect(r.keyEarned).toBe(true); expect(r.state.ads % 10).toBe(0); });
  it("allows max 3 keys (30 ads) per day", () => { const r = recordAd({ day: tashkentDay(t), ads: 30 }, t); expect(r.keyEarned).toBe(false); expect(r.state.ads).toBe(30); expect(r.limitReached).toBe(true); });
  it("resets at 00:00 Tashkent (19:00 UTC)", () => {
    const s = { day: tashkentDay(new Date("2026-10-29T18:59:00Z")), ads: 30 };
    expect(adsToday(s, new Date("2026-10-29T18:59:59Z"))).toBe(30);
    expect(adsToday(s, new Date("2026-10-29T19:00:00Z"))).toBe(0);
  });
});

import { rollReward, WITHDRAW_METHODS } from "./lootzy-rules";
describe("case rewards", () => {
  it("red stays within $0.01-$0.07", () => { expect(rollReward("red", 0)).toBe(0.01); expect(rollReward("red", 0.9999)).toBe(0.07); });
  it("purple stays within $0.05-$0.20", () => { expect(rollReward("purple", 0)).toBe(0.05); expect(rollReward("purple", 0.9999)).toBe(0.2); });
  it("green stays within $1-$3", () => { expect(rollReward("green", 0)).toBe(1); expect(rollReward("green", 0.9999)).toBe(3); });
  it("pink stays within $5-$10", () => { expect(rollReward("pink", 0)).toBe(5); expect(rollReward("pink", 0.9999)).toBe(10); });
});
describe("withdraw", () => {
  it("no Payeer; crypto/Visa min $5, Uzcard/Humo min $2.5", () => {
    expect(WITHDRAW_METHODS.some((m) => (m.name as string) === "Payeer")).toBe(false);
    for (const m of WITHDRAW_METHODS) expect(m.min).toBe(["uzcard", "humo"].includes(m.id) ? 2.5 : 5);
  });
});
