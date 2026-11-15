import { describe, it, expect } from "vitest";
import { centsToSom, somToCents, UZS_PER_USD } from "./lootzy-currency";
describe("so'm conversion", () => {
  it("uses 1$ = 12 000 so'm", () => expect(UZS_PER_USD).toBe(12000));
  it("shows $1 as 12 000 so'm", () => expect(centsToSom(100)).toBe(12000));
  it("Uzcard minimum $2.5 is 30 000 so'm", () => expect(centsToSom(250)).toBe(30000));
  it("crypto/Visa minimum $5 is 60 000 so'm", () => expect(centsToSom(500)).toBe(60000));
  it("typed 60 000 so'm stores $5", () => expect(somToCents("60 000")).toBe(500));
  it("rejects decimals", () => expect(() => somToCents("12.5")).toThrow());
});
