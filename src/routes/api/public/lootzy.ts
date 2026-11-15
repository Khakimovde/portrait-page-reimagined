import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { verifyTelegramProfile } from "@/lib/telegram";
import { isLootzyAdmin } from "@/lib/lootzy-admin-rules";
import { tashkentDay } from "@/lib/lootzy-rules";
import { notify, withdrawalText } from "@/lib/lootzy-bot";
import { BONUS_GAME_ID } from "@/lib/lootzy-bonus-rules";

const schema = z.object({
  initData: z.string().min(1).max(16384),
  action: z.enum(["me", "overview", "search", "detail", "grant", "withdraw", "decision", "open", "ad_report", "bonus", "bonus_add", "bonus_draw", "mining", "mining_start"]),
  rate: z.number().int().min(1000).max(1000000).optional(),
  target: z.number().int().positive().max(Number.MAX_SAFE_INTEGER).optional(), query: z.string().max(100).optional(),
  color: z.enum(["red", "purple", "green", "pink"]).optional(), quantity: z.number().int().min(0).max(100000).optional(),
  amount: z.number().int().min(0).max(10000000).optional(), method: z.enum(["visa", "btc", "ltc", "doge", "uzcard", "humo"]).optional(),
  destination: z.string().max(256).optional(), status: z.enum(["approved", "rejected", "paid"]).optional(), id: z.string().uuid().optional(),
});
function checked<T>(result: { data: T; error: { message: string } | null }) {
  if (result.error) throw new Error(result.error.message);
  if (result.data === null) throw new Error("Ma’lumot topilmadi");
  return result.data;
}
function checkedWrite(result: { error: { message: string } | null }) {
  // Successful writes use return=minimal, so null data is expected, not missing data.
  if (result.error) throw new Error(result.error.message);
}
export const Route = createFileRoute("/api/public/lootzy")({ server: { handlers: {
  OPTIONS: () => new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "POST, OPTIONS" } }),
  POST: async ({ request }) => {
    const headers = { "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" };
    let authorized = false;
    try {
      const d = schema.parse(await request.json());
      // Raw Telegram data is verified here, independently of the browser.
      const profile = await verifyTelegramProfile(d.initData);
      authorized = true;
      const admin = isLootzyAdmin(profile.id);
       if (["overview", "search", "detail", "grant", "decision", "bonus_add", "bonus_draw", "mining_start"].includes(d.action) && !admin) return Response.json({ error: "Admin uchun ruxsat yo‘q" }, { status: 403, headers });
      const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
      checkedWrite(await db.from("lootzy_accounts").upsert({ telegram_id: profile.id, first_name: profile.first_name, last_name: profile.last_name ?? null, username: profile.username ?? null, photo_url: profile.photo_url ?? null }, { onConflict: "telegram_id" }));
      if (admin) checkedWrite(await db.from("lootzy_roles").upsert({ telegram_id: profile.id, role: "admin" }));
       if (["bonus", "bonus_add", "bonus_draw"].includes(d.action)) throw new Error("Pink omad yakunlangan");
       checked(await db.rpc("lootzy_mining_settle", { p_target: profile.id }));
       if (d.action === "mining_start") {
         if (!d.id || !d.target || !d.rate || ![50000,100000].includes(d.amount ?? 0)) throw new Error("ID, tarif va dollar kursini kiriting");
         checked(await db.rpc("lootzy_mining_start", { p_actor: profile.id, p_target: d.target, p_id: d.id, p_principal: d.amount ?? 0, p_rate: d.rate }));
       }
       if (d.action === "bonus_add" || d.action === "bonus_draw") {
         checked(await db.rpc("lootzy_bonus_nov09_manage", { p_actor: profile.id, p_action: d.action === "bonus_add" ? "add" : "draw", ...(d.target ? { p_target: d.target } : {}), ...(d.quantity !== undefined ? { p_quantity: d.quantity } : {}) }));
       }
      if (["grant", "withdraw", "decision", "open", "ad_report"].includes(d.action)) {
        if (!d.id) throw new Error("Amal raqami kerak");
        if (d.action === "grant" && (!d.target || (!d.amount && !d.quantity))) throw new Error("Foydalanuvchi va miqdor kerak");
        if (d.action === "open" && !d.color) throw new Error("Kalit rangini tanlang");
        if (d.action === "decision" && !d.status) throw new Error("Holatni tanlang");
        const mutation = checked(await db.rpc("lootzy_mutate", { p_actor: profile.id, p_action: d.action, p_id: d.id, ...(d.target ? { p_target: d.target } : {}), ...(d.color ? { p_color: d.color } : {}), p_quantity: d.quantity ?? 0, p_amount: d.amount ?? 0, ...(d.method ? { p_method: d.method } : {}), ...(d.destination ? { p_destination: d.destination } : {}), ...(d.status ? { p_status: d.status } : {}) }));
        if (d.action === "withdraw" && d.method) await notify(profile.id, withdrawalText("pending", d.amount ?? 0, d.method));
        if (d.action === "decision" && d.status && mutation && typeof mutation === "object" && !Array.isArray(mutation)) {
          const w = mutation as { telegram_id?: number; status?: string; amount_cents?: number; method?: string };
          if (w.telegram_id && w.status === d.status) await notify(w.telegram_id, withdrawalText(d.status, w.amount_cents ?? 0, w.method ?? ""));
        }
        if (d.action === "open" && mutation && typeof mutation === "object" && !Array.isArray(mutation)) {
          return Response.json({ account: mutation["account"], reward: mutation["reward"], isAdmin: admin, withdrawals: [], ads: 0 }, { headers });
        }
      }
      const account = checked(await db.from("lootzy_accounts").select("*").eq("telegram_id", profile.id).single());
      const day = tashkentDay(new Date());
      const start = new Date(`${day}T00:00:00+05:00`).toISOString();
      const end = new Date(Date.parse(start) + 86400000).toISOString();
      const ads = checked(await db.from("lootzy_events").select("id,verified").eq("telegram_id", profile.id).eq("kind", "ad_report").gte("created_at", start).lt("created_at", end));
      let withdrawals = checked(await db.from("lootzy_withdrawals").select("*").eq("telegram_id", profile.id).order("created_at", { ascending: false }).limit(100));
      const refs = checked(await db.from("lootzy_referrals").select("status").eq("referrer_id", profile.id));
      const confirmedRefs = refs.filter(r => r.status === "confirmed").length;
      const referrals = { invited: refs.length, confirmed: confirmedRefs, keys: Math.floor(confirmedRefs / 10) };
      const result: Record<string, unknown> = { referrals, account, isAdmin: admin, ads: ads.filter(ad => ad.verified).length, reportedAds: ads.length, withdrawals };
       result["serverTime"] = new Date().toISOString();
       if (d.action === "mining" || d.action === "mining_start") {
         const query = db.from("lootzy_mining").select("*").order("started_at", { ascending: false });
         const runs = checked(await (admin ? query.limit(200) : query.eq("telegram_id", profile.id).limit(100)));
         const ids = [...new Set(runs.map(r => r.telegram_id))];
         const people = admin && ids.length ? checked(await db.from("lootzy_accounts").select("*").in("telegram_id", ids)) : [];
         result["mining"] = runs.map(r => ({ ...r, ...(admin ? { account: people.find(p => p.telegram_id === r.telegram_id) } : {}) }));
       }
       if (["bonus", "bonus_add", "bonus_draw"].includes(d.action)) {
         const games = checked(await db.from("lootzy_bonus_games").select("drawn_at").eq("id", BONUS_GAME_ID));
         const entries = checked(await db.from("lootzy_bonus_entries").select("telegram_id,pink_count,rank").eq("game_id", BONUS_GAME_ID).order("created_at"));
         const ids = entries.map(e => e.telegram_id);
         const people = ids.length ? checked(await db.from("lootzy_accounts").select("telegram_id,first_name,username,photo_url").in("telegram_id", ids)) : [];
         result["bonus"] = { drawnAt: games[0]?.drawn_at ?? null, participants: entries.map(e => ({ ...people.find(p => p.telegram_id === e.telegram_id), ...e })) };
       }
      if (d.action === "overview" || d.action === "decision") {
        const events = checked(await db.from("lootzy_events").select("kind,quantity,verified").gte("created_at", start).lt("created_at", end));
        const count = await db.from("lootzy_accounts").select("telegram_id", { count: "exact", head: true });
        if (count.error) throw new Error(count.error.message);
        withdrawals = checked(await db.from("lootzy_withdrawals").select("*").order("created_at", { ascending: false }).limit(200));
        const ids = [...new Set(withdrawals.map(w => w.telegram_id))];
        const people = ids.length ? checked(await db.from("lootzy_accounts").select("*").in("telegram_id", ids)) : [];
        result["withdrawals"] = withdrawals.map(w => ({ ...w, account: people.find(p => p.telegram_id === w.telegram_id) }));
        result["overview"] = { day, users: count.count ?? 0, reportedAds: events.filter(e => e.kind === "ad_report").length, verifiedAds: events.filter(e => e.kind === "ad_report" && e.verified).length, keys: events.reduce((sum,e) => sum + Math.max(0,e.quantity),0), pending: withdrawals.filter(w => ["pending", "approved"].includes(w.status)).length };
      }
      if (d.action === "search") {
        const term = (d.query ?? "").replace(/^@/, "").trim();
        if (!term) result["users"] = [];
        else if (/^\d+$/.test(term)) result["users"] = checked(await db.from("lootzy_accounts").select("*").eq("telegram_id", Number(term)).limit(30));
        else result["users"] = checked(await db.from("lootzy_accounts").select("*").ilike("username", `%${term.replace(/[%_]/g, "")}%`).limit(30));
      }
      if (d.action === "detail" || d.action === "grant") {
        if (!d.target) throw new Error("Foydalanuvchini tanlang");
        result["users"] = [checked(await db.from("lootzy_accounts").select("*").eq("telegram_id", d.target).single())];
        result["events"] = checked(await db.from("lootzy_events").select("*").eq("telegram_id", d.target).order("created_at", { ascending: false }).limit(30));
      }
      return Response.json(result, { headers });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Xizmat xatosi";
      // Never log signed launch data or request bodies.
      return Response.json({ error: authorized ? message : "Telegram orqali qayta kiring" }, { status: authorized ? 400 : 401, headers });
    }
  },
} } });