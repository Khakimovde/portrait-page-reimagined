import { describe, expect, it } from "vitest";
import { BONUS_GAME_ID, BONUS_PRIZES, BONUS_START, canDrawBonus } from "./lootzy-bonus-rules";

describe("November 9 Pink round", () => {
  it("uses an independent round instead of the finished November 8 game", () => {
    expect(BONUS_GAME_ID).toBe("pink-2026-11-09");
  });
  it.each([[1, 15], [2, 10], [3, 5]])("grants rank %i exactly %i Pink cases", (rank, quantity) => {
    expect(BONUS_PRIZES.find(p => p.rank === rank)).toEqual({ rank, color: "pink", quantity });
  });
  it("cannot draw before November 9 at 23:00 Tashkent", () => {
    expect(BONUS_START).toBe("2026-11-09T23:00:00+05:00");
    expect(canDrawBonus(new Date("2026-11-09T17:59:59Z"), 3, false)).toBe(false);
    expect(canDrawBonus(new Date("2026-11-09T18:00:00Z"), 3, false)).toBe(true);
  });
  it("requires three participants and cannot reroll completed results", () => {
    const now = new Date("2026-11-09T18:00:00Z");
    expect(canDrawBonus(now, 2, false)).toBe(false);
    expect(canDrawBonus(now, 3, true)).toBe(false);
  });
});