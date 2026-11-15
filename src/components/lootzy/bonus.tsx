import { useEffect, useState } from "react";
import { ArrowLeft, ChevronRight, Trophy, Users, RefreshCw, Loader2, Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import avatar from "@/assets/avatar.jpg";
import chest from "@/assets/chest.png";
import { cloudCall, type BonusResult } from "@/lib/lootzy-cloud";
import { BONUS_PRIZES, BONUS_DATE_LABEL, BONUS_TIME_LABEL, bonusCount, canDrawBonus } from "@/lib/lootzy-bonus-rules";
import { SUPPORT_URL } from "@/lib/lootzy-rules";

export function BonusBanner({ open }: { open: () => void }) {
  return <Button variant="ghost" onClick={open} className="bonus-round-banner h-auto w-full gap-3 whitespace-normal rounded-lg p-4 text-left">
    <img src={chest} className="c-pink h-20 w-20 shrink-0 object-contain" alt="Pink case" />
    <span className="min-w-0 flex-1"><span className="bonus-round-label block text-xs font-extrabold uppercase">Yangi bosqich · 09 noyabr</span><b className="mt-1 block text-xl">Pink omad ✨</b><span className="mt-1 block text-sm font-bold">15 · 10 · 5 Pink case</span><span className="mt-1 block text-xs">{BONUS_DATE_LABEL} · {BONUS_TIME_LABEL} · Toshkent</span><span className="bonus-round-cta mt-3 flex items-center justify-between gap-2 text-sm font-extrabold">Bonus Pink case olish<ChevronRight className="shrink-0" size={18} /></span></span>
  </Button>;
}

export default function Bonus({ initData, back, admin = false, changed }: { initData: string; back?: () => void; admin?: boolean; changed?: () => void }) {
  const [data, setData] = useState<BonusResult>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [target, setTarget] = useState("");
  const [quantity, setQuantity] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const refresh = async () => { const result = await cloudCall(initData, { action: "bonus" }); if (!result.bonus) throw new Error("O‘yin ma’lumotlari yuklanmadi"); setData(result.bonus); };
  const run = async (fn: () => Promise<void>) => { setBusy(true); setError(""); setNotice(""); try { await fn(); } catch (e) { setError(e instanceof Error ? e.message : "Xatolik"); } finally { setBusy(false); } };
  useEffect(() => { void run(refresh); const timer = setInterval(() => { setNow(new Date()); void refresh().catch(e => setError(e instanceof Error ? e.message : "Xatolik")); }, 30000); return () => clearInterval(timer); }, [initData]);
  const add = async () => {
    const id = Number(target);
    if (!/^\d+$/.test(target) || !Number.isSafeInteger(id) || id < 1) throw new Error("Telegram ID raqamini to‘g‘ri kiriting");
    const result = await cloudCall(initData, { action: "bonus_add", target: id, quantity: bonusCount(quantity) });
    if (!result.bonus) throw new Error("Ishtirokchi saqlanmadi");
    setData(result.bonus); setTarget(""); setQuantity(""); setNotice("✅ Ishtirokchi saqlandi");
  };
  const draw = async () => {
    const result = await cloudCall(initData, { action: "bonus_draw" });
    if (!result.bonus?.drawnAt) throw new Error("Natijalar yuklanmadi, yangilang");
    setData(result.bonus); setConfirm(false); setNotice("🏆 G‘oliblar aniqlandi, sovrinlar hisoblariga qo‘shildi"); changed?.();
  };
  const participants = data?.participants ?? [];
  const winners = participants.filter(p => p.rank !== null).sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
  return <section className={admin ? "" : "px-4 pb-8"}>
    <header className="flex items-center gap-2 py-4">{back && <Button size="icon" variant="ghost" aria-label="Orqaga" onClick={back}><ArrowLeft /></Button>}<h1 className="flex-1 text-xl font-extrabold">Pink omad ✨</h1><Button size="icon" variant="ghost" aria-label="Ishtirokchilarni yangilash" disabled={busy} onClick={() => void run(refresh)}><RefreshCw size={18} /></Button></header>
    <div className="flex items-center gap-4 border-b pb-4"><img src={chest} className="c-pink h-24 w-24 shrink-0 object-contain" alt="Pink case" /><div><span className="block text-xs font-bold k-pink">Yangi bosqich</span><b className="block text-lg">Bonus Pink case</b><p className="mt-1 text-sm">🗓 {BONUS_DATE_LABEL} · Dushanba<br />🕑 {BONUS_TIME_LABEL} · Toshkent vaqti</p><span className="mt-1 block text-xs font-bold k-pink">{data?.drawnAt ? "O‘yin yakunlandi" : "G‘oliblarni admin aniqlaydi"}</span></div></div>
    <div className="grid grid-cols-3 gap-2 py-4">{BONUS_PRIZES.map(p => <div key={p.rank} className="rounded-lg border p-2 text-center"><Trophy size={22} className="k-pink mx-auto" /><b className="mt-1 block text-sm">{p.rank}-o‘rin</b><span className="block text-xs">{p.quantity} ta Pink case</span></div>)}</div>
    <p className="text-sm">🍀 Ko‘proq pink case olgan odamning yutish ehtimoli yuqoriroq bo‘ladi. Har bir pink case — 1 ta imkoniyat.</p>
    {!data?.drawnAt && <><p className="mt-3 text-sm">Ishtirok etish uchun kamida 1 ta pink case oling.</p><Button asChild className="btn-blue mt-3 w-full"><a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer"><Send size={17} />Adminga bog‘lanish</a></Button></>}
    {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}{notice && <p role="status" className="mt-4 text-sm k-green">{notice}</p>}
    {admin && !data?.drawnAt && <form className="mt-5 space-y-3 border-y py-4" onSubmit={e => { e.preventDefault(); void run(add); }}><h2 className="font-bold">Ishtirokchi qo‘shish / yangilash</h2><label className="block text-sm">Telegram ID<Input required inputMode="numeric" value={target} onChange={e => setTarget(e.target.value)} /></label><label className="block text-sm">Olingan pink case soni<Input required type="number" min="1" max="100000" step="1" value={quantity} onChange={e => setQuantity(e.target.value)} /></label><Button type="submit" className="w-full" disabled={busy || !data}><Plus size={17} />{busy ? "Saqlanmoqda..." : "Ishtirokchini saqlash"}</Button><p className="text-xs text-muted-foreground">Bir xil ID qayta kiritilsa, jami pink case soni yangilanadi.</p><Button type="button" variant="outline" className="w-full" disabled={busy || !canDrawBonus(now, participants.length, Boolean(data?.drawnAt))} onClick={() => setConfirm(true)}><Trophy size={17} />G‘oliblarni aniqlash</Button><p className="text-xs text-muted-foreground">{BONUS_DATE_LABEL} soat {BONUS_TIME_LABEL} dan keyin · kamida 3 ishtirokchi</p></form>}
    {winners.length > 0 && <div className="mt-5"><h2 className="mb-2 font-extrabold">🏆 G‘oliblar</h2>{winners.map(p => <div key={p.telegram_id} className="bg-pink-soft mb-2 flex items-center gap-3 rounded-lg p-3"><b>{p.rank}-o‘rin</b><span className="min-w-0 flex-1 break-all">{p.username ? `@${p.username}` : p.first_name}<small className="block">ID: {p.telegram_id}</small></span><b className="text-xs">{BONUS_PRIZES.find(prize => prize.rank === p.rank)?.quantity} ta Pink</b></div>)}</div>}
    <h2 className="mt-6 mb-2 flex items-center gap-2 font-extrabold"><Users size={19} />Ishtirokchilar · {participants.length}</h2>
    {busy && !data && <Loader2 className="mx-auto my-6 animate-spin" />}
    {data && !participants.length && <p className="py-6 text-center text-sm text-muted-foreground">Hozircha ishtirokchilar yo‘q</p>}
    {participants.map(p => <div key={p.telegram_id} className="flex items-center gap-3 border-b py-3"><img src={p.photo_url ?? avatar} onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = avatar; }} className="h-11 w-11 shrink-0 rounded-full object-cover" alt="" /><div className="min-w-0 flex-1"><b className="block break-all text-sm">{p.username ? `@${p.username}` : p.first_name}</b><span className="block text-xs text-muted-foreground">ID: {p.telegram_id}</span></div><b className="shrink-0 text-xs k-pink">{p.pink_count} Pink</b></div>)}
    {confirm && <div className="fixed inset-0 z-50 grid place-items-center bg-background/95 p-6"><div role="dialog" aria-modal="true" aria-label="G‘oliblarni aniqlashni tasdiqlash" className="max-w-sm rounded-lg border bg-card p-5"><h2 className="font-bold">G‘oliblarni aniqlaysizmi?</h2><p className="my-4 text-sm">3 ta turli g‘olib tasodifiy aniqlanadi. Sovrinlar avtomatik qo‘shiladi. Natijani qayta o‘zgartirib bo‘lmaydi.</p><div className="flex gap-2"><Button disabled={busy} variant="outline" onClick={() => setConfirm(false)}>Bekor qilish</Button><Button disabled={busy} onClick={() => void run(draw)}>{busy ? "Aniqlanmoqda..." : "Boshlash"}</Button></div></div></div>}
  </section>;
}