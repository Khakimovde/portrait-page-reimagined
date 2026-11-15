/** 1 USD = 12 000 so'm. Balances stay stored as USD cents; everything shown or typed is in so'm. */
export const UZS_PER_USD = 12000;
export const UZS_PER_CENT = UZS_PER_USD / 100;
export function centsToSom(cents: number) { return Math.round(cents * UZS_PER_CENT); }
export function formatSom(cents: number) { return `${String(centsToSom(cents)).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so‘m`; }
export function dollarsSom(dollars: number) { return formatSom(Math.round(dollars * 100)); }
export function somToCents(raw: string) {
  const clean = raw.replace(/[\s,]/g, "");
  if (!/^\d+$/.test(clean)) throw new Error("Miqdorni so‘mda butun son bilan kiriting");
  const cents = Math.round(Number(clean) / UZS_PER_CENT);
  if (!Number.isSafeInteger(cents) || cents < 1) throw new Error("Miqdor kamida 120 so‘m bo‘lsin");
  return cents;
}
