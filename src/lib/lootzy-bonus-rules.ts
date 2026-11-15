export const BONUS_GAME_ID = "pink-2026-11-09";
export const BONUS_START = "2026-11-09T23:00:00+05:00";
export const BONUS_DATE_LABEL = "09.11.2026";
export const BONUS_TIME_LABEL = "23:00";
export const BONUS_PRIZES = [
  { rank: 1, color: "pink", quantity: 15 },
  { rank: 2, color: "pink", quantity: 10 },
  { rank: 3, color: "pink", quantity: 5 },
] as const;
export function canDrawBonus(now: Date, count: number, drawn: boolean) {
  return !drawn && count >= 3 && now.getTime() >= Date.parse(BONUS_START);
}
export function bonusCount(raw: string) {
  const count = Number(raw);
  if (!/^\d+$/.test(raw) || !Number.isSafeInteger(count) || count < 1 || count > 100000) throw new Error("Pink case soni 1 dan 100000 gacha bo‘lsin");
  return count;
}
export function pendingPayment(status: string) { return status === "pending"; }