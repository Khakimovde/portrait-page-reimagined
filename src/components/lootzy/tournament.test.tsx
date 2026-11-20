// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import TournamentResults, { MEGA_TURNIR_DRAW_AT, MEGA_TURNIR_PRIZES } from "./tournament";
import { SUPPORT_URL } from "@/lib/lootzy-rules";

afterEach(cleanup);

describe("Mega Turnir prizes and schedule", () => {
  it.each([
    [1, 350_000],
    [2, 250_000],
    [3, 150_000],
  ])("sets place %i prize to %i so'm", (place, prizeSom) => {
    const entry = MEGA_TURNIR_PRIZES.find((item) => item.place === place);

    expect(entry?.prizeSom).toBe(prizeSom);
  });

  it("schedules the draw for 20 November 2026 at 21:00 Tashkent time", () => {
    expect(MEGA_TURNIR_DRAW_AT).toBe("2026-11-20T21:00:00+05:00");
  });
});

describe("Mega Turnir banner on the home screen", () => {
  it("stays collapsed until tapped, then shows prizes, rules and admin buy link", () => {
    render(<TournamentResults />);

    const button = screen.getByRole("button", { name: /Mega Turnir/i });
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(document.getElementById("mega-turnir-details")).toBe(null);
    expect(screen.queryByText(/Turnir yakunlandi/i)).toBe(null);

    fireEvent.click(button);

    expect(button.getAttribute("aria-expanded")).toBe("true");
    const panel = document.getElementById("mega-turnir-details");
    expect(panel).not.toBe(null);
    expect(panel?.textContent).toContain("350 000 so‘m");
    expect(panel?.textContent).toContain("250 000 so‘m");
    expect(panel?.textContent).toContain("150 000 so‘m");
    expect(panel?.textContent).toContain("20-noyabr 21:00");
    expect(panel?.textContent).toContain("22:00");
    expect(panel?.textContent).toContain("Pink case");

    const buyLink = screen.getByRole("link", { name: /Sotib olish/i });
    expect(buyLink.getAttribute("href")).toBe(SUPPORT_URL);
  });
});
