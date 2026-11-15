// One shared campaign window: opening/reloading the page never restarts it.
export const PROMOTION_START = "2026-11-13T07:37:00Z";
export const PROMOTION_DURATION_HOURS = 15;
export const PROMOTION_END = "2026-11-13T22:37:00Z";
export const PROMOTION_OFFERS = [
  { amount: 100000, pink: 2, green: 0 },
  { amount: 50000, pink: 1, green: 2 },
] as const;
export function promotionActive(now: number) {
  return now >= Date.parse(PROMOTION_START) && now < Date.parse(PROMOTION_END);
}