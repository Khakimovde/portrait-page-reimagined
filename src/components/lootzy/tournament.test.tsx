// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { TOURNAMENT_WINNERS } from "./tournament";
import TournamentResults from "./tournament";
import spiderManPhoto from "@/assets/winner-spiderman.jpeg.asset.json";
import animeCouplePhoto from "@/assets/winner-anime-couple.jpeg.asset.json";

afterEach(cleanup);

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

  it("shows Doniyorbek the Spider-Man logo and Guli the anime couple logo", () => {
    const doniyorbek = TOURNAMENT_WINNERS.find((entry) => entry.place === 2);
    const guli = TOURNAMENT_WINNERS.find((entry) => entry.place === 3);

    expect(doniyorbek?.photo).toBe(spiderManPhoto.url);
    expect(guli?.photo).toBe(animeCouplePhoto.url);
    expect(doniyorbek?.photo).not.toBe(guli?.photo);
  });
});

describe("tournament section on the home screen", () => {
  it("keeps only the button visible until it is pressed", () => {
    render(<TournamentResults />);

    const button = screen.getByRole("button", { name: /Turnir yakunlandi/i });
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(document.getElementById("tournament-winners")).toBe(null);
    expect(screen.queryByText("Doniyorbek")).toBe(null);

    fireEvent.click(button);

    expect(button.getAttribute("aria-expanded")).toBe("true");
    const panel = document.getElementById("tournament-winners");
    expect(panel).not.toBe(null);
    expect(panel?.textContent).toContain("Doniyorbek");
    expect(panel?.textContent).toContain("Guli");
    expect(panel?.textContent).toContain("200 000 so‘m");
    expect(panel?.textContent).toContain("100 000 so‘m");
    expect(panel?.textContent).toContain("50 000 so‘m");
  });
});
