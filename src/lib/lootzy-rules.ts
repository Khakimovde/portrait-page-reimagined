export const CASES = [
  { c: "red", name: "Red Case" },
  { c: "purple", name: "Purple Case" },
  { c: "green", name: "Green Case" },
  { c: "pink", name: "Pink Case" },
] as const;
export type Color = (typeof CASES)[number]["c"];
export const EMPTY_KEYS: Record<Color, number> = { red: 0, purple: 0, green: 0, pink: 0 };
export const BOT_USERNAME = "Lootzy_enbot";
export const BOT_ID = "9261613826";
export const SUPPORT_URL = "https://t.me/Lootzy_help";

// Pure contract for a future trusted completion service. Never grants from UI clicks.
export function completionReward(source: "ads" | "referrals", previous: number, completed: number) {
  if (!Number.isSafeInteger(previous) || !Number.isSafeInteger(completed) || previous < 0 || completed < previous) {
    throw new Error("Invalid completion counts");
  }
  return {
    color: source === "ads" ? "red" as const : "purple" as const,
    quantity: Math.floor(completed / 10) - Math.floor(previous / 10),
    progress: completed % 10,
  };
}
export function referralLink(id: number) {
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Invalid Telegram ID");
  return `https://t.me/${BOT_USERNAME}?start=ref_${id}`;
}
export const ADS_PER_KEY = 10;
export const MAX_DAILY_KEYS = 3;
export const MAX_DAILY_ADS = ADS_PER_KEY * MAX_DAILY_KEYS;
/** Calendar day in Tashkent (UTC+5, no DST) — resets at 00:00 Tashkent time. */
export function tashkentDay(now: Date) {
  return new Date(now.getTime() + 5 * 3600_000).toISOString().slice(0, 10);
}
export type AdDay = { day: string; ads: number };
/** Records one completed ad; returns the new state and whether a red key was earned. */
export function recordAd(state: AdDay | undefined, now: Date) {
  const day = tashkentDay(now);
  const ads = state?.day === day ? state.ads : 0;
  if (ads >= MAX_DAILY_ADS) return { state: { day, ads }, keyEarned: false, limitReached: true };
  const next = ads + 1;
  return { state: { day, ads: next }, keyEarned: next % ADS_PER_KEY === 0, limitReached: next >= MAX_DAILY_ADS };
}
export function adsToday(state: AdDay | undefined, now: Date) {
  return state?.day === tashkentDay(now) ? state.ads : 0;
}

/** Reward range (USD) per case. */
export const CASE_RANGES: Record<Color, [number, number]> = {
  red: [0.01, 0.07], purple: [0.05, 0.2], green: [1, 3], pink: [5, 10],
};
/** Rolls a reward in cents inside the case range (inclusive). `rand` in [0,1). */
export function rollReward(c: Color, rand: number = Math.random()) {
  const [min, max] = CASE_RANGES[c];
  const lo = Math.round(min * 100), hi = Math.round(max * 100);
  const r = Math.min(Math.max(rand, 0), 0.999999);
  return (lo + Math.floor(r * (hi - lo + 1))) / 100;
}
export const WITHDRAW_METHODS = [
  { id: "visa", name: "Visa", sub: "Bank card", min: 5 },
  { id: "btc", name: "Bitcoin", sub: "BTC", min: 5 },
  { id: "ltc", name: "Litecoin", sub: "LTC", min: 5 },
  { id: "doge", name: "Dogecoin", sub: "DOGE", min: 5 },
  { id: "uzcard", name: "Uzcard", sub: "UZS card", min: 2.5 },
  { id: "humo", name: "Humo", sub: "UZS card", min: 2.5 },
] as const;
export const PAYOUT_DAYS = 7;
