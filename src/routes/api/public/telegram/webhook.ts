import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  CHECK_SUB, NOT_SUBSCRIBED, isChannelMember, menuKeyboard, menuText, notify, parseStartReferrer,
  referralConfirmedText, sendMessage, subscribeKeyboard, subscribeText, telegramCall, webhookSecret,
} from "@/lib/lootzy-bot";

const user = z.object({ id: z.number().int().positive(), is_bot: z.boolean().optional(), first_name: z.string().max(256), last_name: z.string().max(256).optional(), username: z.string().max(256).optional() });
const update = z.object({
  update_id: z.number(),
  message: z.object({ chat: z.object({ id: z.number(), type: z.string() }), from: user.optional(), text: z.string().max(4096).optional() }).passthrough().optional(),
  callback_query: z.object({ id: z.string(), from: user, data: z.string().max(64).optional(), message: z.object({ chat: z.object({ id: z.number() }), message_id: z.number() }).passthrough().optional() }).passthrough().optional(),
}).passthrough();

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function confirm(userId: number) {
  const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
  const { data, error } = await db.rpc("lootzy_confirm_subscription", { p_id: userId });
  if (error) throw new Error(error.message);
  const result = data as { referrer: number | null; confirmed_total: number; key_granted: boolean } | null;
  if (result?.referrer) await notify(result.referrer, referralConfirmedText(result.confirmed_total, result.key_granted));
}

export const Route = createFileRoute("/api/public/telegram/webhook")({ server: { handlers: {
  POST: async ({ request }) => {
    const key = process.env["TELEGRAM_API_KEY"];
    if (!key) return new Response("Not configured", { status: 500 });
    const actual = request.headers.get("X-Telegram-Bot-Api-Secret-Token") ?? "";
    if (!safeEqual(actual, await webhookSecret(key))) return new Response("Unauthorized", { status: 401 });

    const parsed = update.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return Response.json({ ok: true, ignored: true });
    const { message, callback_query: query } = parsed.data;
    try {
      if (message?.text?.startsWith("/start") && message.from && !message.from.is_bot && message.chat.type === "private") {
        const from = message.from;
        const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
        const referrer = parseStartReferrer(message.text);
        const { error } = await db.rpc("lootzy_bot_start", { p_id: from.id, p_first: from.first_name, p_last: from.last_name ?? "", p_username: from.username ?? "", ...(referrer ? { p_referrer: referrer } : {}) });
        if (error) throw new Error(error.message);
        if (await isChannelMember(from.id)) {
          await confirm(from.id);
          await sendMessage(message.chat.id, menuText(from.first_name), menuKeyboard);
        } else {
          await sendMessage(message.chat.id, subscribeText(from.first_name), subscribeKeyboard);
        }
      } else if (query?.data === CHECK_SUB) {
        if (await isChannelMember(query.from.id)) {
          await confirm(query.from.id);
          await telegramCall("answerCallbackQuery", { callback_query_id: query.id, text: "✅ Obuna tasdiqlandi!" });
          if (query.message) await telegramCall("deleteMessage", { chat_id: query.message.chat.id, message_id: query.message.message_id }).catch(() => undefined);
          await sendMessage(query.message?.chat.id ?? query.from.id, menuText(query.from.first_name), menuKeyboard);
        } else {
          await telegramCall("answerCallbackQuery", { callback_query_id: query.id, text: NOT_SUBSCRIBED, show_alert: true });
        }
      }
    } catch (error) {
      console.error("Telegram webhook error", error instanceof Error ? error.message : error);
    }
    // Always acknowledge so Telegram does not retry the same update forever.
    return Response.json({ ok: true });
  },
} } });
