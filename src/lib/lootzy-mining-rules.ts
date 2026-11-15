export const MINING_PLANS = [50000, 100000] as const;
export const MINING_HOURS = 48;
export const QUEUE_DAYS = 7;
export function miningPayout(principal: number, rate: number) {
  if (!MINING_PLANS.some(p => p === principal) || !Number.isInteger(rate) || rate < 1000 || rate > 1000000) throw new Error("Tarif yoki dollar kursi noto‘g‘ri");
  return Math.round(principal * 3 * 100 / rate);
}
export function openPayment(status: string) { return status === "pending" || status === "approved"; }
export function remainingTime(deadline: string, now = Date.now()) {
  const seconds = Math.max(0, Math.ceil((Date.parse(deadline) - now) / 1000));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor(seconds % 86400 / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  return `${days} kun ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}