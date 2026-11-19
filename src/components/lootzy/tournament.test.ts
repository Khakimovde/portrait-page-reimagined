import { describe, expect, it } from "vitest";

import { TOURNAMENT_WINNERS } from "./tournament";

describe("completed tournament winners", () => {
  it.each([
    [1, "Nozanin Abdusattorova", 5837291046, 200_000],
    [2, "Doniyorbek", 9274618350, 100_000],
    [3, "Guli 🤍", 6148392751, 50_000],
  ])("records place %i with the supplied winner and prize", (place, name, telegramId, prizeSom) => {
    const winner = TOURNAMENT_WINNERS.find((entry) => entry.place === place);

    expect(winner).toMatchObject({ name, telegramId, prizeSom });
    expect(winner?.photo).toMatch(/\.jpeg$/);
  });

  it("keeps exactly three ranked winners", () => {
    expect(TOURNAMENT_WINNERS.map((winner) => winner.place)).toEqual([1, 2, 3]);
    expect(new Set(TOURNAMENT_WINNERS.map((winner) => winner.telegramId)).size).toBe(3);
  });
});
