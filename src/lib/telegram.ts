import { BOT_ID } from "./lootzy-rules";
import { z } from "zod";

export const telegramUserSchema = z.object({
  id: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  first_name: z.string().min(1).max(256),
  last_name: z.string().max(256).optional(),
  username: z.string().max(256).optional(),
  photo_url: z.string().url().refine((url) => url.startsWith("https://")).optional(),
});
export type TelegramProfile = z.infer<typeof telegramUserSchema>;
type TelegramWebApp = { initData: string; ready: () => void; expand: () => void; openTelegramLink: (url: string) => void };
declare global { interface Window { Telegram?: { WebApp?: TelegramWebApp } } }

// Third-party verification from core.telegram.org/bots/webapps.
// Display-only: a browser cannot authorize balances or persist a trusted account.
export function telegramCheckString(raw: string, now = Date.now()) {
  const params = new URLSearchParams(raw);
  if ([...params.keys()].some((key, index, all) => all.indexOf(key) !== index)) throw new Error("Duplicate Telegram fields");
  const authDate = Number(params.get("auth_date"));
  const age = now / 1000 - authDate;
  if (!Number.isSafeInteger(authDate) || age < -30 || age > 86400) throw new Error("Telegram sessiyasi eskirgan. Botdan qayta oching.");
  const signature = params.get("signature");
  if (!signature || !/^[A-Za-z0-9_-]+={0,2}$/.test(signature)) throw new Error("Telegram imzosi topilmadi.");
  const fields = [...params.entries()].filter(([key]) => key !== "hash" && key !== "signature").sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
  return { message: `${BOT_ID}:WebAppData\n${fields.map(([k, v]) => `${k}=${v}`).join("\n")}`, signature, params };
}

export async function verifyTelegramProfile(raw: string): Promise<TelegramProfile> {
  const { message, signature, params } = telegramCheckString(raw);
  const publicKey = Uint8Array.from("e7bf03a2fa4602af4580703d88dda5bb59f32ed8b02a56c187fe7d34caed242d".match(/.{2}/g) ?? [], (hex) => parseInt(hex, 16));
  const base64 = signature.replace(/-/g, "+").replace(/_/g, "/");
  const bytes = Uint8Array.from(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")), (c) => c.charCodeAt(0));
  const { ed25519 } = await import("@noble/curves/ed25519");
  if (bytes.length !== 64 || !ed25519.verify(bytes, new TextEncoder().encode(message), publicKey)) throw new Error("Telegram profili tasdiqlanmadi.");
  return telegramUserSchema.parse(JSON.parse(params.get("user") ?? "null"));
}

let sdkPromise: Promise<TelegramWebApp | undefined> | undefined;
export function loadTelegramSdk() {
  if (window.Telegram?.WebApp) return Promise.resolve(window.Telegram.WebApp);
  if (!sdkPromise) sdkPromise = new Promise<TelegramWebApp | undefined>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-web-app.js?62";
    script.onload = () => resolve(window.Telegram?.WebApp);
    script.onerror = () => { sdkPromise = undefined; reject(new Error("Telegram yuklanmadi. Qayta urinib ko‘ring.")); };
    document.head.appendChild(script);
  });
  return sdkPromise;
}