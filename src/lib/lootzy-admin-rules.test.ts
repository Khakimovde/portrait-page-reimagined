import { describe, expect, it } from "vitest";
import { isLootzyAdmin, canTransition, dollarsToCents } from "./lootzy-admin-rules";
describe("admin requirements", () => {
  it("allows only Telegram ID 5326022510", () => { expect(isLootzyAdmin(5326022510)).toBe(true); expect(isLootzyAdmin(5326022511)).toBe(false); expect(isLootzyAdmin(1)).toBe(false); });
  it("approves pending withdrawal requests", () => { expect(canTransition("pending", "approved")).toBe(true); expect(canTransition("paid", "approved")).toBe(false); });
  it("rejects pending and approved but never paid withdrawals", () => { expect(canTransition("pending", "rejected")).toBe(true); expect(canTransition("approved", "rejected")).toBe(true); expect(canTransition("paid", "rejected")).toBe(false); });
  it("marks only approved withdrawals paid", () => { expect(canTransition("approved", "paid")).toBe(true); expect(canTransition("pending", "paid")).toBe(false); expect(canTransition("rejected", "paid")).toBe(false); });
  it("converts admin dollars into exact cents", () => { expect(dollarsToCents("5.25")).toBe(525); expect(dollarsToCents("0.01")).toBe(1); expect(() => dollarsToCents("-1")).toThrow(); expect(() => dollarsToCents("1.001")).toThrow(); });
});