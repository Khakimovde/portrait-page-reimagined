// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import TournamentResults, { MEGA_TURNIR_WINNERS } from "./tournament";

afterEach(cleanup);

describe("Mega Turnir final winners", () => {
  it.each([
    [1, "Рахимова", "483715926", 350_000, "mega-winner-rahimova.jpeg"],
    [2, "𓆩𝑵𝒊𝒈𝒊𝒏𝒂𓆪 🦋", "927461583", 250_000, "mega-winner-nigina.jpeg"],
    [3, "C💙", "619283745", 150_000, "mega-winner-c.jpeg"],
  ])("sets place %i to %s, Telegram ID %s and %i so'm", (place, name, telegramId, prizeSom, photo) => {
    const winner = MEGA_TURNIR_WINNERS.find((item) => item.place === place);

    expect(winner?.name).toBe(name);
    expect(winner?.telegramId).toBe(telegramId);
    expect(winner?.prizeSom).toBe(prizeSom);
    expect(winner?.photo).toContain(photo);
  });
});

describe("Mega Turnir completed section", () => {
  it("stays collapsed until tapped, then shows the winners, fair draw and distributed prizes", () => {
    render(<TournamentResults />);

    const button = screen.getByRole("button", { name: /Mega Turnir/i });
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(document.getElementById("mega-turnir-details")).toBe(null);

    fireEvent.click(button);

    expect(button.getAttribute("aria-expanded")).toBe("true");
    const panel = document.getElementById("mega-turnir-details");
    expect(panel?.textContent).toContain("haqqoniy va adolatli yakunlandi");
    expect(panel?.textContent).toContain("rasmiy kanalimizda tasodifiy tanlov — random orqali aniqlandi");
    expect(panel?.textContent).toContain("Barcha mukofotlar g‘oliblarga tarqatildi");
    expect(panel?.textContent).toContain("350 000 so‘m");
    expect(panel?.textContent).toContain("250 000 so‘m");
    expect(panel?.textContent).toContain("150 000 so‘m");
    expect(panel?.textContent).not.toContain("Sotib olish");

    for (const winner of MEGA_TURNIR_WINNERS) {
      expect(panel?.textContent).toContain(winner.name);
      expect(panel?.textContent).toContain(winner.telegramId);
      expect(screen.getByRole("img", { name: `${winner.name} profil rasmi` }).getAttribute("src")).toBe(winner.photo);
    }

    expect(screen.getByRole("link", { name: /Rasmiy kanalimiz/i }).getAttribute("href")).toBe("https://t.me/Lootzy_en");
  });
});
