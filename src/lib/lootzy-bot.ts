// Telegram bot texts, keyboards and gateway calls for @Lootzy_enbot.
// Gateway calls read secrets inside functions, so they only work server-side.

export const CHANNEL = "@Lootzy_en";
export const CHANNEL_URL = "https://t.me/Lootzy_en";
export const SUPPORT_LINK = "https://t.me/Lootzy_help";
export const PAYMENTS_URL = "https://t.me/Lootzy_Paid";
export const MINI_APP_URL = "https://6a7ab988cb4f5.xvest6.ru";
export const CHECK_SUB = "check_sub";

/** Reads `ref_<id>` from a /start command; anything else is ignored. */
export function parseStartReferrer(text: string): number | null {
  const match = /^\/start(?:@\w+)?\s+ref_(\d{1,16})$/.exec(text.trim());
  if (!match?.[1]) return null;
  const id = Number(match[1]);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

/** Only real members count; "left", "kicked" and pending join requests do not. */
export function isSubscribedStatus(member: { status?: string; is_member?: boolean } | undefined) {
  if (!member) return false;
  if (["creator", "administrator", "member"].includes(member.status ?? "")) return true;
  return member.status === "restricted" && member.is_member === true;
}

export function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function subscribeText(name: string) {
  return `👋 Salom, <b>${escapeHtml(name)}</b>!\n\n🎁 <b>Lootzy</b>ga xush kelibsiz — bu yerda kalitlar yig'ib, keyslarni ochib, haqiqiy pul yutasiz! 💰\n\n📢 Botdan to'liq foydalanish uchun avval <b>rasmiy kanalimizga obuna bo'ling</b>.\n\n👇 Obuna bo'lgach, <b>«✅ Tasdiqlash»</b> tugmasini bosing.`;
}
export const subscribeKeyboard = {
  inline_keyboard: [
    [{ text: "📢 Kanalga obuna bo'lish", url: CHANNEL_URL }],
    [{ text: "✅ Tasdiqlash", callback_data: CHECK_SUB }],
  ],
};
export const NOT_SUBSCRIBED = "❌ Siz hali kanalga obuna bo'lmagansiz!\n\nAvval @Lootzy_en kanaliga obuna bo'ling, keyin qayta tasdiqlang 🙏";

export function menuText(name: string) {
  return `🎉 Tabriklaymiz, <b>${escapeHtml(name)}</b>! Obuna tasdiqlandi ✅\n\n🔑 Kalitlar yig'ing\n🎁 Keyslarni oching\n💸 Yutuqlaringizni yeching\n\n🚀 Boshlash uchun pastdagi tugmani bosing!`;
}
export const menuKeyboard = {
  inline_keyboard: [
    [{ text: "🚀 Boshlash", web_app: { url: MINI_APP_URL } }],
    [{ text: "📢 Kanal", url: CHANNEL_URL }, { text: "🆘 Support", url: SUPPORT_LINK }],
    [{ text: "💳 To'lovlar kanali", url: PAYMENTS_URL }],
  ],
};

export function referralConfirmedText(total: number, keyGranted: boolean) {
  const progress = total % 10;
  return keyGranted
    ? `🎉 Yangi do'stingiz obunani tasdiqladi!\n\n🟣 Siz <b>1 ta Purple kalit</b> oldingiz! 🔑\n👥 Jami tasdiqlangan referallar: <b>${total}</b>`
    : `🤝 Yangi do'stingiz obunani tasdiqladi!\n\n👥 Jami tasdiqlangan referallar: <b>${total}</b>\n📈 Keyingi Purple kalitgacha: <b>${progress} / 10</b>`;
}

const METHOD_NAMES: Record<string, string> = { visa: "Visa", btc: "Bitcoin", ltc: "Litecoin", doge: "Dogecoin", uzcard: "Uzcard", humo: "Humo" };
export function withdrawalText(status: string, amountCents: number, method: string) {
  const amount = `<b>$${(amountCents / 100).toFixed(2)}</b>`;
  const via = escapeHtml(METHOD_NAMES[method] ?? method);
  switch (status) {
    case "pending": return `📝 <b>Pul yechish so'rovi qabul qilindi!</b>\n\n💵 Miqdor: ${amount}\n💳 Usul: ${via}\n\n⏳ So'rovingiz ko'rib chiqilmoqda. Odatda 2 kungacha vaqt oladi.`;
    case "approved": return `✅ <b>So'rovingiz tasdiqlandi!</b>\n\n💵 Miqdor: ${amount}\n💳 Usul: ${via}\n\n🚚 To'lov tez orada amalga oshiriladi.`;
    case "paid": return `🎉 <b>To'lov amalga oshirildi!</b> 💸\n\n💵 Miqdor: ${amount}\n💳 Usul: ${via}\n\n🙏 Lootzy bilan bo'lganingiz uchun rahmat! To'lovlar: @Lootzy_Paid`;
    case "rejected": return `❌ <b>So'rovingiz rad etildi.</b>\n\n💵 ${amount} balansingizga qaytarildi 🔄\n\n❓ Savollar bo'lsa: @Lootzy_help`;
    default: return "";
  }
}

export async function telegramCall<T = unknown>(method: string, body: object): Promise<T> {
  const lovable = process.env["LOVABLE_API_KEY"];
  const telegram = process.env["TELEGRAM_API_KEY"];
  if (!lovable || !telegram) throw new Error("Telegram bot is not configured");
  const response = await fetch(`https://connector-gateway.lovable.dev/telegram/${method}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${lovable}`, "X-Connection-Api-Key": telegram, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Telegram ${method} failed [${response.status}]: ${text}`);
  const data = JSON.parse(text) as { ok: boolean; result: T; description?: string };
  if (!data.ok) throw new Error(`Telegram ${method} failed: ${data.description ?? text}`);
  return data.result;
}

export function sendMessage(chatId: number, text: string, reply_markup?: object) {
  return telegramCall("sendMessage", { chat_id: chatId, text, parse_mode: "HTML", ...(reply_markup ? { reply_markup } : {}) });
}

/** Best-effort notice: a blocked bot must never fail the money operation. */
export async function notify(chatId: number, text: string) {
  try { if (text) await sendMessage(chatId, text); } catch (error) { console.error("Telegram notice failed", error instanceof Error ? error.message : error); }
}

export async function isChannelMember(userId: number) {
  const member = await telegramCall<{ status?: string; is_member?: boolean }>("getChatMember", { chat_id: CHANNEL, user_id: userId });
  return isSubscribedStatus(member);
}

export async function webhookSecret(telegramApiKey: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`telegram-webhook:${telegramApiKey}`));
  let binary = "";
  for (const byte of new Uint8Array(digest)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
