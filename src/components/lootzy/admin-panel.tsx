import { useEffect, useState } from "react";
import { ArrowLeft, Search, RefreshCw, ShieldCheck, Copy, Check, X, CheckCheck, KeyRound, DollarSign, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import avatar from "@/assets/avatar.jpg";
import { cloudCall, type Account, type CloudResult, type Withdrawal } from "@/lib/lootzy-cloud";
import { CASES } from "@/lib/lootzy-rules";
import { STATUS_LABELS, dollarsToCents, canTransition } from "@/lib/lootzy-admin-rules";
import Mining from "./mining";
import Countdown from "./countdown";
import { openPayment } from "@/lib/lootzy-mining-rules";

function Person({ account }: { account: Account }) {
  return <div className="flex min-w-0 items-center gap-3"><img src={account.photo_url ?? avatar} onError={e => { e.currentTarget.src = avatar; }} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" /><div className="min-w-0"><b className="block break-words">{[account.first_name, account.last_name].filter(Boolean).join(" ")}</b><span className="block break-all text-xs text-muted-foreground">{account.username ? `@${account.username} · ` : ""}{account.telegram_id}</span></div></div>;
}
export default function AdminPanel({ initData, back, changed }: { initData: string; back: () => void; changed: () => void }) {
  const [data, setData] = useState<CloudResult>();
  const [tab, setTab] = useState("overview");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Account[]>([]);
  const [selected, setSelected] = useState<Account>();
  const [amount, setAmount] = useState("");
  const [quantity, setQuantity] = useState("");
  const [color, setColor] = useState("red");
  const [filter, setFilter] = useState("pending");
  const [confirm, setConfirm] = useState<{ w: Withdrawal; status: string }>();
  const [events, setEvents] = useState<CloudResult["events"]>([]);
  const run = async (fn: () => Promise<void>) => { setBusy(true); setError(""); setNotice(""); try { await fn(); } catch(e) { setError(e instanceof Error ? e.message : "Xatolik"); } finally { setBusy(false); } };
  const refresh = async () => { setData(await cloudCall(initData, { action: "overview" })); };
  useEffect(() => { void run(refresh); }, [initData]);
  const select = async (a: Account) => { const d = await cloudCall(initData, { action: "detail", target: a.telegram_id }); setSelected(d.users?.[0]); setEvents(d.events); setAmount(""); setQuantity(""); };
  const grant = () => run(async () => {
    if (!selected) return;
    const cents = amount ? dollarsToCents(amount) : 0;
    const n = quantity ? Number(quantity) : 0;
    if (!Number.isSafeInteger(n) || n < 0 || n > 100000 || (!cents && !n)) throw new Error("Pul yoki kalit miqdorini kiriting");
    const d = await cloudCall(initData, { action: "grant", target: selected.telegram_id, amount: cents, quantity: n, color, id: crypto.randomUUID() });
    setSelected(d.users?.[0]); setEvents(d.events); setAmount(""); setQuantity(""); setNotice("Qo‘shildi va saqlandi"); changed();
  });
  const decide = () => run(async () => {
    if (!confirm) return;
    const d = await cloudCall(initData, { action: "decision", id: confirm.w.id, status: confirm.status });
    setData(d); setConfirm(undefined); setNotice("So‘rov holati yangilandi"); changed();
  });
  return <div className="min-h-dvh bg-background px-4 pb-8 text-foreground">
    <header className="flex items-center gap-2 py-5"><Button variant="ghost" size="icon" aria-label="Orqaga" onClick={back}><ArrowLeft /></Button><ShieldCheck className="k-green" /><h1 className="flex-1 text-xl font-extrabold">Admin panel</h1><Button variant="ghost" size="icon" aria-label="Yangilash" disabled={busy} onClick={() => void run(refresh)}><RefreshCw className={busy ? "animate-spin" : ""} size={19} /></Button></header>
    <div className="mb-5 grid grid-cols-4 border-b">{([["overview","Statistika"],["users","Users"],["withdrawals","So‘rovlar"],["mining","Mining"]] as const).map(([id,label]) => <Button key={id} variant="ghost" onClick={() => { setTab(id); setSelected(undefined); }} className={`rounded-none border-b-2 px-1 text-xs ${tab === id ? "border-primary font-extrabold" : "border-transparent text-muted-foreground"}`}>{label}</Button>)}</div>
    {tab === "mining" && <Mining initData={initData} admin changed={changed} />}
    {error && <p role="alert" className="mb-4 rounded-lg border border-destructive p-3 text-sm text-destructive">{error}</p>}
    {notice && <p role="status" className="mb-4 text-sm k-green">{notice}</p>}
    {busy && !data && <Loader2 className="mx-auto animate-spin" />}
    {tab === "overview" && data?.overview && <><p className="mb-3 text-xs text-muted-foreground">{data.overview.day} · Toshkent vaqti</p><div className="grid grid-cols-2 gap-3">{[["Jami users",data.overview.users],["Reklama hisobotlari",data.overview.reportedAds],["Tasdiqlangan reklamalar",data.overview.verifiedAds],["Olingan kalitlar",data.overview.keys],["Ochiq so‘rovlar",data.overview.pending]].map(([l,v]) => <div key={l} className="rounded-lg border p-4"><span className="block min-h-8 text-xs text-muted-foreground">{l}</span><b className="text-3xl">{v}</b></div>)}</div><p className="mt-4 text-xs text-muted-foreground">Reklama hisobotlari tasdiqlanmagan. Kalitlar: bugungi tasdiqlangan grantlar.</p></>}
    {tab === "users" && <><form className="mb-4 flex gap-2" onSubmit={e => { e.preventDefault(); void run(async () => { const d = await cloudCall(initData,{ action:"search", query }); setResults(d.users ?? []); setSelected(undefined); if (!d.users?.length) setNotice("Foydalanuvchi topilmadi"); }); }}><Input aria-label="ID yoki username" placeholder="ID yoki @username" value={query} onChange={e => setQuery(e.target.value)} /><Button type="submit" size="icon" aria-label="Qidirish" disabled={busy}><Search size={18} /></Button></form>
      {!selected && results.map(a => <Button key={a.telegram_id} variant="ghost" className="mb-2 h-auto w-full justify-start whitespace-normal rounded-lg border p-3 text-left" onClick={() => void run(() => select(a))}><Person account={a} /></Button>)}
      {selected && <section><Person account={selected} /><div className="my-4 flex items-center justify-between border-y py-4"><span>Balans</span><b className="text-2xl">${(selected.balance_cents/100).toFixed(2)}</b></div><div className="mb-5 grid grid-cols-4 gap-2">{CASES.map(({c}) => <div key={c} className="rounded-lg border p-2 text-center"><KeyRound className={`k-${c} mx-auto`} size={22}/><b>{selected[c]}</b></div>)}</div><h2 className="mb-3 font-bold">Pul / kalit qo‘shish</h2><label className="block text-xs">Dollar miqdori<Input className="mt-1 mb-3" inputMode="decimal" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}/></label><div className="mb-3 grid grid-cols-4 gap-2">{CASES.map(({c}) => <Button key={c} variant="outline" aria-label={`${c} kalit`} onClick={() => setColor(c)} className={color===c ? "ring-2 ring-primary" : ""}><KeyRound className={`k-${c}`} size={22} /></Button>)}</div><label className="block text-xs">Kalit soni<Input className="mt-1 mb-3" type="number" min="0" step="1" placeholder="0" value={quantity} onChange={e => setQuantity(e.target.value)}/></label><Button className="w-full" disabled={busy} onClick={() => void grant()}><DollarSign size={16}/>{busy ? "Saqlanmoqda..." : "Qo‘shish"}</Button><h2 className="mt-6 mb-2 font-bold">Oxirgi amallar</h2>{events?.map(e => <div key={e.id} className="flex flex-wrap justify-between gap-2 border-b py-3 text-xs"><span>{e.kind === "grant" ? "Admin qo‘shdi" : e.kind === "open" ? "Sandiq ochildi" : "Reklama hisoboti"}<small className="block text-muted-foreground">{new Date(e.created_at).toLocaleString("uz",{timeZone:"Asia/Tashkent"})}</small></span><b>{e.quantity ? `${e.quantity > 0 ? "+" : ""}${e.quantity} ${e.color}` : ""} {e.amount_cents ? `$${(e.amount_cents/100).toFixed(2)}` : ""}</b></div>)}</section>}
    </>}
    {tab === "withdrawals" && <><div className="mb-3 grid grid-cols-2 gap-2">{Object.entries(STATUS_LABELS).map(([id,l]) => <Button key={id} variant={filter===id ? "default" : "outline"} className="text-xs" onClick={() => setFilter(id)}>{l}</Button>)}</div>{data?.withdrawals.filter(w => w.status===filter).map(w => <article key={w.id} className="mb-4 rounded-lg border p-4">{w.account && <Person account={w.account}/>}<p className="mt-3 text-sm font-bold">{w.queue_number ? `#${w.queue_number} navbat` : "Arxiv"}</p>{openPayment(w.status) && w.due_at && <p className="mt-1 text-xs"><Countdown deadline={w.due_at} offset={data?.serverTime ? Date.parse(data.serverTime)-Date.now() : 0} expired="Muddat tugadi — to‘lov kutilmoqda"/></p>}<div className="my-3 flex justify-between"><b className="text-2xl">${(w.amount_cents/100).toFixed(2)}</b><span className="uppercase">{w.method}</span></div><div className="flex items-center gap-2 rounded-md bg-muted p-2"><code className="min-w-0 flex-1 break-all text-xs">{w.destination}</code><Button variant="ghost" size="icon" aria-label="Karta yoki hamyonni nusxalash" onClick={() => void run(async () => { await navigator.clipboard.writeText(w.destination); setNotice("Nusxa olindi"); })}><Copy size={16}/></Button></div><p className="my-3 text-xs text-muted-foreground">{new Date(w.created_at).toLocaleString("uz", {timeZone:"Asia/Tashkent"})} · {STATUS_LABELS[w.status]}</p><div className="flex flex-wrap gap-2">{[["approved","Tasdiqlash",Check],["rejected","Rad etish",X],["paid","To‘landi",CheckCheck]].map(([id,label,Icon]) => { const I = Icon as typeof Check; return canTransition(w.status,id as string) && <Button key={id as string} size="sm" variant={id==="rejected" ? "destructive" : "default"} disabled={busy} onClick={() => setConfirm({w,status:id as string})}><I size={15}/>{label as string}</Button>; })}</div></article>)}{!data?.withdrawals.some(w => w.status===filter) && <p className="py-10 text-center text-sm text-muted-foreground">Bu holatda so‘rovlar yo‘q</p>}</>}
    {confirm && <div className="fixed inset-0 z-50 grid place-items-center bg-background/95 p-6"><div role="dialog" aria-modal="true" aria-label="So‘rov holatini tasdiqlash" className="w-full max-w-sm rounded-lg border bg-card p-5"><h2 className="font-bold">{STATUS_LABELS[confirm.status]}?</h2><p className="my-4 text-sm">${(confirm.w.amount_cents/100).toFixed(2)} · {confirm.w.method.toUpperCase()}{confirm.status==="rejected" ? " — mablag‘ balansga qaytariladi." : confirm.status==="paid" ? " — pulni yuborganingizdan keyin belgilang." : ""}</p><div className="flex gap-2"><Button variant="outline" onClick={() => setConfirm(undefined)} disabled={busy}>Bekor qilish</Button><Button disabled={busy} onClick={() => void decide()}>Tasdiqlash</Button></div></div></div>}
  </div>;
}