import type { Tables } from "@/integrations/supabase/types";

export type Account = Tables<"lootzy_accounts">;
export type MiningRun = Tables<"lootzy_mining"> & { account?: Account };
export type Withdrawal = Tables<"lootzy_withdrawals"> & { account?: Account };
export type Overview = { day: string; users: number; reportedAds: number; verifiedAds: number; keys: number; pending: number };
export type BonusParticipant = { telegram_id: number; first_name: string; username: string | null; photo_url: string | null; pink_count: number; rank: number | null };
export type BonusResult = { drawnAt: string | null; participants: BonusParticipant[] };
export type CloudResult = { mining?: MiningRun[]; serverTime?: string; account: Account; isAdmin: boolean; withdrawals: Withdrawal[]; ads: number; reportedAds?: number; referrals?: { invited: number; confirmed: number; keys: number }; reward?: number; overview?: Overview; users?: Account[]; events?: Tables<"lootzy_events">[] };
export type CloudRequest = { action: "me" | "overview" | "search" | "detail" | "grant" | "withdraw" | "decision" | "open" | "ad_report" | "bonus" | "bonus_add" | "bonus_draw" | "mining" | "mining_start"; rate?: number; target?: number; query?: string; color?: string; quantity?: number; amount?: number; method?: string; destination?: string; status?: string; id?: string };

export async function cloudCall(initData: string, input: CloudRequest): Promise<CloudResult & { bonus?: BonusResult }> {
  const base = import.meta.env["VITE_LOOTZY_API_URL"] ?? "";
  let lastError = "Xizmatga ulanib bo‘lmadi, birozdan keyin qayta urinib ko‘ring";
  // Temporary hosting errors (e.g. Cloudflare 1016) return plain text, not JSON: retry, then show a friendly message.
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt) await new Promise(r => setTimeout(r, 800 * attempt));
    let response: Response;
    try {
      response = await fetch(`${base}/api/public/lootzy`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...input, initData }) });
    } catch { continue; }
    let result: { error?: string } & Record<string, unknown>;
    try { result = await response.json(); } catch { continue; }
    if (!response.ok) {
      if (response.status >= 500) { lastError = result.error ?? lastError; continue; }
      throw new Error(result.error ?? lastError);
    }
    return result as unknown as CloudResult & { bonus?: BonusResult };
  }
  throw new Error(lastError);
}
