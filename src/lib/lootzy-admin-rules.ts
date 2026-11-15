export const ADMIN_TELEGRAM_ID = 5326022510;
export function isLootzyAdmin(id: number) { return id === ADMIN_TELEGRAM_ID; }
export const STATUS_LABELS: Record<string, string> = { pending: "Kutilmoqda", approved: "Tasdiqlangan", rejected: "Rad etilgan", paid: "To‘langan" };
export function canTransition(from: string, to: string) {
  return (from === "pending" && ["approved", "rejected"].includes(to)) || (from === "approved" && ["paid", "rejected"].includes(to));
}
export function dollarsToCents(raw: string) {
  if (!/^\d+(\.\d{1,2})?$/.test(raw)) throw new Error("Miqdorni to‘g‘ri kiriting");
  const cents = Math.round(Number(raw) * 100);
  if (!Number.isSafeInteger(cents) || cents < 1) throw new Error("Miqdor noldan katta bo‘lsin");
  return cents;
}