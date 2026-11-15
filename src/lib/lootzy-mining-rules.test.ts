import { describe, it, expect } from "vitest";
import { MINING_HOURS, QUEUE_DAYS, miningPayout, openPayment, remainingTime } from "./lootzy-mining-rules";
describe("Mining and queue rules", () => {
  it("triples 50,000 UZS at the fixed start rate", () => expect(miningPayout(50000, 12500)).toBe(1200));
  it("triples 100,000 UZS at the fixed start rate", () => expect(miningPayout(100000, 12500)).toBe(2400));
  it("rejects an unlisted plan", () => expect(() => miningPayout(75000, 12500)).toThrow());
  it("rejects invalid exchange rates", () => expect(() => miningPayout(50000, 0)).toThrow());
  it("runs for exactly two days", () => expect(MINING_HOURS).toBe(48));
  it("queues both pending and approved requests only", () => expect(["pending", "approved", "paid", "rejected"].filter(openPayment)).toEqual(["pending", "approved"]));
  it("counts down seven days", () => { expect(QUEUE_DAYS).toBe(7); expect(remainingTime("2026-11-19T14:00:00Z", Date.parse("2026-11-12T14:00:00Z"))).toBe("7 kun 00:00:00"); });
  it("never shows negative remaining time", () => expect(remainingTime("2026-11-12T14:00:00Z", Date.parse("2026-11-13T14:00:00Z"))).toBe("0 kun 00:00:00"));
});