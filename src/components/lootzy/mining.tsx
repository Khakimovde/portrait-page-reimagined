import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Cpu, ChevronRight, MessageCircle, Play, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cloudCall, type MiningRun } from "@/lib/lootzy-cloud";
import { MINING_PLANS, miningPayout } from "@/lib/lootzy-mining-rules";
import { SUPPORT_URL } from "@/lib/lootzy-rules";
import Countdown from "./countdown";
import coins from "@/assets/coins.png";

export function MiningBanner({ open }: { open: () => void }) {
  return <Button variant="ghost" onClick={open} className="mining-banner h-auto w-full justify-start gap-3 whitespace-normal rounded-lg p-4 text-left"><Cpu className="shrink-0" size={32}/><span className="min-w-0 flex-1"><b className="block text-xl">Mining</b><span className="block text-xs">50 000 / 100 000 so‘m · 48 soat</span></span><ChevronRight className="shrink-0"/></Button>;
}
export default function Mining({ initData, admin = false, back, changed }: { initData: string; admin?: boolean; back?: () => void; changed?: () => void }) {
  const [runs, setRuns] = useState<MiningRun[]>([]);
  const [target, setTarget] = useState("");
  const [plan, setPlan] = useState<number>(50000);
  const [rate, setRate] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [offset, setOffset] = useState(0);
  const requestId = useRef<string | undefined>(undefined);
  const refresh = async () => { const d = await cloudCall(initData, { action: "mining" }); setRuns(d.mining ?? []); if (d.serverTime) setOffset(Date.parse(d.serverTime)-Date.now()); changed?.(); };
  const run = async (fn: () => Promise<void>) => { setBusy(true); setError(""); try { await fn(); } catch(e) { setError(e instanceof Error ? e.message : "Xatolik"); } finally { setBusy(false); } };
  useEffect(() => { void run(refresh); const id = setInterval(() => void refresh().catch(() => {}), 30000); return () => clearInterval(id); }, [initData]);
  let payout = 0;
  try { payout = miningPayout(plan, Number(rate)); } catch { /* Invalid input disables confirmation. */ }
  const start = () => run(async () => {
    if (!requestId.current) requestId.current = crypto.randomUUID();
    const d = await cloudCall(initData, { action: "mining_start", target: Number(target), amount: plan, rate: Number(rate), id: requestId.current });
    setRuns(d.mining ?? []); requestId.current = undefined; setConfirm(false); setNotice("Mining boshlandi ✅"); setTarget(""); changed?.();
  });
  return <section className={admin ? "pb-6" : "px-4 pb-8"}>
    <header className="flex items-center gap-3 py-5">{back && <Button variant="ghost" size="icon" aria-label="Orqaga" onClick={back}><ArrowLeft/></Button>}<h1 className="flex-1 text-xl font-extrabold">Mining</h1><Button variant="ghost" size="icon" aria-label="Miningni yangilash" disabled={busy} onClick={() => void run(refresh)}><RefreshCw size={18}/></Button></header>
    {!admin && <><div className="mining-banner flex items-center gap-4 rounded-lg p-4"><img src={coins} alt="" className="h-20 w-20 object-contain"/><div><b className="text-2xl">48 soat</b><p className="text-sm">Yakuniy summa: kiritilgan pul × 3</p></div></div><p className="my-4 text-xs text-muted-foreground">Bu ilova ichidagi hisob-kitob, haqiqiy kripto mining emas. Pul kiritish xavfli; haqiqiy daromad kafolatlanmaydi.</p><div className="grid grid-cols-2 gap-3">{MINING_PLANS.map(p => <article className="rounded-lg border p-4" key={p}><b className="block">{p.toLocaleString("uz")} so‘m</b><span className="text-xs text-muted-foreground">Yakuniy: {(p*3).toLocaleString("uz")} so‘m</span></article>)}</div><Button asChild className="my-4 w-full"><a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer"><MessageCircle size={18}/>Pul kiritish — adminga bog‘laning</a></Button><p className="mb-5 text-xs text-muted-foreground">Dollar kursi admin boshlagan paytda belgilanadi va o‘zgarmaydi.</p></>}
    {admin && <form className="mb-6 space-y-3" onSubmit={e => { e.preventDefault(); requestId.current = undefined; setConfirm(true); }}><label className="block text-sm">Telegram ID<Input aria-label="Mining Telegram ID" inputMode="numeric" required pattern="[0-9]+" value={target} onChange={e => setTarget(e.target.value)}/></label><div className="grid grid-cols-2 gap-2">{MINING_PLANS.map(p => <Button key={p} type="button" variant={plan === p ? "default" : "outline"} onClick={() => setPlan(p)}>{p.toLocaleString("uz")} so‘m</Button>)}</div><label className="block text-sm">1 dollar uchun so‘m kursi<Input aria-label="Mining dollar kursi" type="number" min={1000} max={1000000} step={1} required value={rate} onChange={e => setRate(e.target.value)}/></label><p className="text-sm">48 soatdan keyin: <b>${(payout/100).toFixed(2)}</b></p><Button type="submit" className="w-full" disabled={busy || !payout || !Number.isSafeInteger(Number(target)) || Number(target)<=0}><Play size={16}/>Miningni boshlash</Button></form>}
    {error && <p role="alert" className="mb-4 text-sm text-destructive">{error}</p>}{notice && <p role="status" className="mb-4 text-sm k-green">{notice}</p>}
    <h2 className="mb-3 font-bold">{admin ? "Mining hisoblari" : "Mening miningim"}</h2>{!runs.length && <p className="py-6 text-center text-sm text-muted-foreground">Hozircha mining yo‘q</p>}
    {runs.map(m => <article key={m.id} className="mb-3 rounded-lg border p-4">{admin && <p className="mb-2 break-all text-sm font-bold">{m.account?.username ? `@${m.account.username}` : m.account?.first_name} · {m.telegram_id}</p>}<div className="flex justify-between gap-2"><b>{m.principal_uzs.toLocaleString("uz")} so‘m</b><b>${(m.payout_cents/100).toFixed(2)}</b></div><p className="mt-2 text-xs text-muted-foreground">Kurs: {m.rate_uzs.toLocaleString("uz")} so‘m / $1</p><p className="mt-3 text-sm font-bold">{m.paid_at ? "✅ Balansga qo‘shildi" : <Countdown deadline={m.ends_at} offset={offset} expired="Hisoblanmoqda…"/>}</p></article>)}
    {confirm && <div className="fixed inset-0 z-50 grid place-items-center bg-background/95 p-5"><div role="dialog" aria-modal="true" aria-label="Miningni tasdiqlash" className="w-full max-w-sm rounded-lg border bg-card p-5"><h2 className="font-bold">Pul kelib tushganini tasdiqlaysizmi?</h2><p className="my-4 text-sm">ID {target} · {plan.toLocaleString("uz")} so‘m<br/>48 soatdan keyin ${(payout/100).toFixed(2)} balansga qo‘shiladi.</p><div className="flex gap-2"><Button variant="outline" disabled={busy} onClick={() => setConfirm(false)}>Bekor qilish</Button><Button disabled={busy} onClick={() => void start()}>{busy ? "Boshlanmoqda…" : "Tasdiqlash"}</Button></div></div></div>}
  </section>;
}