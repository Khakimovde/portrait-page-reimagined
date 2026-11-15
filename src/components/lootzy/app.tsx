import { useEffect, useState } from "react";
import {
  Home, KeyRound, Wallet as WalletIcon, Users, User, ArrowLeft, X, Play, ChevronRight,
  Gift, Bell, Settings, Info, Copy, HelpCircle, Loader2, ShieldCheck,
} from "lucide-react";
import hero from "@/assets/hero.jpg";
import chest from "@/assets/chest.png";
import coins from "@/assets/coins.png";
import walletImg from "@/assets/wallet.png";
import avatar from "@/assets/avatar.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminPanel from "./admin-panel";
import Mining, { MiningBanner } from "./mining";
import MiningPromotion, { MiningPromotionBanner } from "./mining-promotion";
import Countdown from "./countdown";
import { openPayment } from "@/lib/lootzy-mining-rules";
import { cloudCall, type CloudResult, type Withdrawal } from "@/lib/lootzy-cloud";
import { dollarsToCents, STATUS_LABELS } from "@/lib/lootzy-admin-rules";

import { CASES, EMPTY_KEYS, BOT_USERNAME, SUPPORT_URL, referralLink, adsToday, ADS_PER_KEY, MAX_DAILY_ADS, type Color, type AdDay, CASE_RANGES, rollReward, WITHDRAW_METHODS, PAYOUT_DAYS } from "@/lib/lootzy-rules";
import { showNextAd, preloadAds } from "@/lib/ads";
import { loadTelegramSdk, verifyTelegramProfile, type TelegramProfile } from "@/lib/telegram";

export default function App() {
  const [profile, setProfile] = useState<TelegramProfile>();
  const [initData, setInitData] = useState("");
  const [status, setStatus] = useState("Telegram tekshirilmoqda...");
  const [loading, setLoading] = useState(true);
  const connect = async () => {
    setLoading(true);
    try {
      const app = await loadTelegramSdk();
      app?.ready(); app?.expand();
      if (!app?.initData) { setStatus("Ilovani Telegram orqali oching"); return; }
      setProfile(await verifyTelegramProfile(app.initData));
      setInitData(app.initData);
    } catch (error) { setStatus(error instanceof Error ? error.message : "Telegram profili tasdiqlanmadi."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void connect(); }, []);
  if (profile) return <LootzyApp profile={profile} initData={initData} />;
  return <div className="app-shell grid min-h-dvh place-items-center px-6"><div className="w-full max-w-sm text-center">
    <img src={hero} alt="Lootzy" className="mx-auto mb-6 aspect-[4/3] w-full rounded-lg object-cover" />
    <h1 className="mb-3 text-4xl font-extrabold">Lootzy</h1>
    <p className="mb-6 text-sm text-muted-foreground" role="status">{status}</p>
    {loading ? <Loader2 className="mx-auto animate-spin" /> : <><Button asChild className="btn-blue w-full"><a href={`https://t.me/${BOT_USERNAME}?startapp`}>Telegramda ochish <ChevronRight /></a></Button><Button variant="ghost" className="mt-3" onClick={() => void connect()}>Qayta tekshirish</Button></>}
  </div></div>;
}

type Screen = "home" | "keys" | "wallet" | "referral" | "profile" | "case" | "win" | "keydetail" | "admin" | "mining" | "promotion";

const Key = ({ c, size = 22 }: { c: Color; size?: number }) => (
  <KeyRound className={`k-${c}`} size={size} strokeWidth={2.6} />
);
const Chest = ({ c, className = "" }: { c: Color; className?: string }) => (
  <img src={chest} alt="" className={`c-${c} ${className}`} loading="lazy" />
);

function LootzyApp({ profile, initData }: { profile: TelegramProfile; initData: string }) {
  const [screen, setScreen] = useState<Screen>("home");
  const [balance, setBalance] = useState(0);
  const [stats, setStats] = useState({ opened: 0, earned: 0 });
  const [keys, setKeys] = useState<Record<Color, number>>(EMPTY_KEYS);
  const [adDay, setAdDay] = useState<AdDay>();
  const [reportedDay, setReportedDay] = useState<AdDay>();
  const [adBusy, setAdBusy] = useState(false);
  const [adMsg, setAdMsg] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [cloudError, setCloudError] = useState("");
  const [clockOffset, setClockOffset] = useState(0);
  const [refStats, setRefStats] = useState({ invited: 0, confirmed: 0, keys: 0 });
  const apply = (d: CloudResult) => {
    if (d.serverTime) setClockOffset(Date.parse(d.serverTime)-Date.now());
    if (d.referrals) setRefStats(d.referrals);
    setBalance(d.account.balance_cents / 100);
    setKeys({ red: d.account.red, purple: d.account.purple, green: d.account.green, pink: d.account.pink });
    setStats({ opened: d.account.opened, earned: d.account.earned_cents / 100 });
    setIsAdmin(d.isAdmin); setWithdrawals(d.withdrawals);
    if (d.reward === undefined) {
      const day = new Date(Date.now() + 5 * 3600000).toISOString().slice(0,10);
      setAdDay({ day, ads: d.ads });
      setReportedDay({ day, ads: d.reportedAds ?? d.ads });
    }
  };
  const sync = async () => { try { apply(await cloudCall(initData, { action: "me" })); setCloudError(""); } catch(e) { setCloudError(e instanceof Error ? e.message : "Xizmatga ulanib bo‘lmadi"); } };
  useEffect(() => {
    void sync(); preloadAds();
    const id = setInterval(() => void sync(), 30000);
    return () => clearInterval(id);
  }, [initData]);
  const [sel, setSel] = useState<Color>("red");
  const [won, setWon] = useState(0);
  const ads = adsToday(adDay, new Date());
  const reportedAds = adsToday(reportedDay, new Date());

  const go = (s: Screen) => setScreen(s);
  const tabs: [Screen, string, typeof Home][] = [
    ["home", "Home", Home], ["keys", "Keys", KeyRound], ["wallet", "Wallet", WalletIcon],
    ["referral", "Referral", Users], ["profile", "Profile", User],
  ];
  const showTabs = ["home", "keys", "wallet", "referral", "profile"].includes(screen);

  // Client completion reports never authorize spendable keys.
  const watchAd = async () => {
    if (adBusy || adsToday(reportedDay, new Date()) >= MAX_DAILY_ADS) return;
    setAdBusy(true); setAdMsg("");
    try {
      await showNextAd();
      apply(await cloudCall(initData, { action: "ad_report", id: crypto.randomUUID() }));
      setAdMsg("Reklama hisoboti saqlandi. Kalit uchun tasdiqlangan reklama kerak.");
    } catch { setAdMsg("Reklama yuklanmadi, qayta urinib ko‘ring."); }
    finally { setAdBusy(false); }
  };
  const openCase = async (): Promise<number | null> => {
    if (keys[sel] < 1) return null;
    const d = await cloudCall(initData, { action: "open", color: sel, id: crypto.randomUUID() });
    apply(d); const v = (d.reward ?? 0) / 100; setWon(v); return v;
  };
  const withdraw = async (method: string, amount: number, destination: string) => {
    apply(await cloudCall(initData, { action: "withdraw", method, amount, destination, id: crypto.randomUUID() }));
  };

  return (
    <div className="app-shell flex justify-center">
      <div className="relative w-full max-w-[430px] min-h-screen pb-20">
        {cloudError && <div role="alert" className="p-4 text-sm text-destructive">{cloudError}<Button variant="ghost" onClick={() => void sync()}>Qayta urinish</Button></div>}
        {screen === "admin" && isAdmin && <AdminPanel initData={initData} back={() => go("profile")} changed={() => void sync()} />}
        {screen === "home" && <HomeS promotion={() => go("promotion")} clockOffset={clockOffset} mining={() => go("mining")} balance={balance} ads={ads} reportedAds={reportedAds} busy={adBusy} msg={adMsg} onWatch={() => void watchAd()} />}
        {screen === "promotion" && <MiningPromotion back={() => go("home")} offset={clockOffset}/>}
        {screen === "mining" && <Mining initData={initData} back={() => go("home")} changed={() => void sync()} />}
        {screen === "keys" && <KeysS keys={keys} back={() => go("home")} pick={(c) => { setSel(c); go("case"); }} detail={(c) => { setSel(c); go("keydetail"); }} />}
        {screen === "case" && <CaseS c={sel} n={keys[sel]} close={() => go("keys")} open={openCase} done={() => go("win")} />}
        {screen === "win" && <WinS v={won} balance={balance} close={() => go("keys")} />}
        {screen === "wallet" && <WalletS clockOffset={clockOffset} balance={balance} back={() => go("home")} withdrawals={withdrawals} withdraw={withdraw} />}
        {screen === "referral" && <ReferralS back={() => go("home")} profile={profile} stats={refStats} />}
        {screen === "profile" && <ProfileS keys={keys} profile={profile} stats={stats} admin={isAdmin ? () => go("admin") : undefined} />}
        {screen === "keydetail" && <KeyDetailS c={sel} n={keys[sel]} back={() => go("keys")} open={() => go("case")} />}

        {showTabs && (
          <nav className="fixed bottom-0 left-1/2 z-20 flex w-full max-w-[430px] -translate-x-1/2 justify-around rounded-t-2xl bg-card py-2 text-card-foreground shadow-2xl">
            {tabs.map(([s, l, I]) => (
              <Button variant="ghost" key={s} onClick={() => go(s)} className={`h-auto flex flex-col items-center gap-0.5 text-[11px] font-bold ${screen === s ? "k-blue" : "text-muted-foreground"}`}>
                <I size={24} strokeWidth={screen === s ? 2.8 : 2} />{l}
              </Button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}

function Header({ title, back, right }: { title: string; back?: () => void; right?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 pb-3 pt-5">
      {back && <Button variant="ghost" onClick={back}><ArrowLeft size={24} /></Button>}
      <h1 className="flex-1 text-xl font-extrabold">{title}</h1>
      {right}
    </div>
  );
}

function HomeS({ balance, ads, reportedAds, busy, msg, onWatch, mining, promotion, clockOffset }: { balance: number; ads: number; reportedAds: number; busy: boolean; msg: string; onWatch: () => void; mining: () => void; promotion: () => void; clockOffset: number }) {
  const limit = reportedAds >= MAX_DAILY_ADS;
  const progress = ads % ADS_PER_KEY;
  const keysToday = Math.floor(ads / ADS_PER_KEY);
  return (
    <div className="app-light min-h-screen">
      <div className="relative h-60 overflow-hidden rounded-b-3xl">
        <img src={hero} alt="Treasure" className="absolute inset-0 h-full w-full object-cover" width={1024} height={768} />
        <div className="relative flex items-start justify-between p-4">
          <span className="grid h-9 w-9 place-items-center rounded-full btn-red"><Bell size={18} /></span>
          <span className="flex items-center gap-1 rounded-full btn-blue px-3 py-1 text-sm font-extrabold"><KeyRound size={14} /> ${balance.toFixed(2)}</span>
        </div>
        <div className="relative text-center">
          <div className="title-logo text-5xl">Lootzy</div>
          <div className="text-xs font-bold text-primary-foreground drop-shadow">Watch Ads · Get Keys · Open Cases</div>
        </div>
      </div>
      <div className="space-y-3 px-4 pt-4">
        <MiningBanner open={mining} />
        <MiningPromotionBanner open={promotion} offset={clockOffset}/>
        <Button variant="ghost" disabled={busy || limit} onClick={onWatch} className="watch-ad watch-card h-auto flex w-full items-center gap-3 whitespace-normal rounded-2xl p-4 text-left shadow-xl disabled:opacity-70">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full btn-green">{busy ? <Loader2 className="animate-spin" size={26} /> : <Play fill="currentColor" size={26} />}</span>
          <span className="min-w-0 flex-1"><b className="block text-base">{limit ? "Bugungi limit tugadi" : busy ? "Reklama ochilmoqda..." : "Reklama ko‘rish"}</b><span className="text-xs opacity-90">{limit ? "Ertaga 00:00 (Toshkent) da yangilanadi" : "10 ta reklama = 1 ta red kalit"}</span></span>
          <ChevronRight />
        </Button>
        {msg && <p className="text-center text-sm font-bold" role="status">{msg}</p>}
        <div className="lcard flex items-center gap-3 p-4">
          <div className="flex-1">
            <div className="text-xs font-bold text-muted-foreground">Tasdiqlangan reklamalar</div>
            <div className="text-2xl font-extrabold">{progress} / {ADS_PER_KEY}</div>
            <div className="progress mt-2 h-3 rounded-full"><i style={{ width: `${progress * 10}%` }} /></div>
          </div>
          <div className="rounded-xl border p-3 text-center">
            <div className="text-xs font-bold">Next reward</div>
            <div className="flex items-center gap-1 font-extrabold"><Key c="red" size={30} /> x1</div>
          </div>
        </div>
        <div className="lcard flex items-center gap-3 p-4">
          <Gift className="k-red" size={34} />
          <div className="flex-1"><b className="block">Bugungi kalitlar: {keysToday} / 3</b><span className="text-xs text-muted-foreground">Reklamalar: {reportedAds} / {MAX_DAILY_ADS} · 00:00 da yangilanadi</span></div>
        </div>
      </div>
    </div>
  );
}

function KeysS({ keys, back, pick, detail }: { keys: Record<Color, number>; back: () => void; pick: (c: Color) => void; detail: (c: Color) => void }) {
  const [tab, setTab] = useState<"cases" | "my">("cases");
  return (
    <div>
      <Header title="Keys" back={back} />
      <div className="app-light mx-3 grid grid-cols-4 gap-y-3 rounded-2xl p-3">
        {CASES.map(({ c }) => (
          <Button variant="ghost" key={c} onClick={() => detail(c)} className="h-auto flex flex-col items-center text-xs font-extrabold"><Key c={c} size={30} />{keys[c]}</Button>
        ))}
      </div>
      <div className="app-light mx-3 mt-3 min-h-[70vh] rounded-t-2xl p-3">
        <div className="mb-3 grid grid-cols-2 gap-2 rounded-full bg-blue-soft p-1">
          {(["cases", "my"] as const).map((t) => (
            <Button variant="ghost" key={t} onClick={() => setTab(t)} className={`rounded-full py-1.5 text-sm font-bold ${tab === t ? "btn-blue" : "k-blue"}`}>{t === "cases" ? "Cases" : "My Keys"}</Button>
          ))}
        </div>
        {tab === "cases" ? (
          <div className="grid grid-cols-2 gap-3">
            {CASES.map(({ c, name }) => (
              <Button variant="ghost" key={c} onClick={() => pick(c)} className={`bg-${c}-soft h-auto flex-col rounded-2xl p-3 text-center font-bold`}>
                <Chest c={c} className="mx-auto h-24 w-24" />
                <div className="text-sm">{name}</div>
                <div className="flex items-center justify-center gap-1"><Key c={c} size={18} />{keys[c]}</div>
              </Button>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {CASES.map(({ c }) => (
              <Button variant="ghost" key={c} onClick={() => detail(c)} className="lcard h-auto flex w-full items-center gap-3 p-3 font-bold capitalize">
                <Key c={c} size={28} /><span className="flex-1 text-left">{c} Key</span>x{keys[c]}<ChevronRight size={18} />
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const ITEM_W = 88, STRIP = 40, WIN_AT = 34;
function CaseS({ c, n, close, open, done }: { c: Color; n: number; close: () => void; open: () => Promise<number | null>; done: () => void }) {
  const [min, max] = CASE_RANGES[c];
  const name = CASES.find((x) => x.c === c)?.name ?? "Case";
  const [strip, setStrip] = useState<number[]>(() => Array.from({ length: STRIP }, () => rollReward(c)));
  const [offset, setOffset] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [error, setError] = useState("");
  const start = async () => {
    if (spinning) return;
    setSpinning(true); setError("");
    let v: number | null;
    try { v = await open(); } catch(e) { setError(e instanceof Error ? e.message : "Sandiq ochilmadi"); setSpinning(false); return; }
    if (v === null) { setSpinning(false); return; }
    const items = Array.from({ length: STRIP }, () => rollReward(c));
    items[WIN_AT] = v;
    setOffset(0); setStrip(items); setSpinning(true);
    const jitter = Math.floor(Math.random() * (ITEM_W - 20)) - (ITEM_W - 20) / 2;
    requestAnimationFrame(() => requestAnimationFrame(() => setOffset(WIN_AT * ITEM_W + jitter)));
    setTimeout(() => { setSpinning(false); done(); }, 5400);
  };
  return (
    <div className="px-4 pb-6">
      <div className="flex items-center gap-3 pb-2 pt-5"><Button variant="ghost" disabled={spinning} onClick={close}><X /></Button><h1 className="text-xl font-extrabold">{name}</h1></div>
      <div className="burst relative mx-auto grid h-52 place-items-center">
        <Chest c={c} className={`h-44 w-44 ${spinning ? "shake" : ""}`} />
      </div>
      <div className="glass relative mt-2 h-24 overflow-hidden rounded-2xl">
        <div className="absolute inset-y-0 left-1/2 z-10 w-1 -translate-x-1/2 rounded bg-primary" />
        <div className="absolute top-2 flex" style={{ left: `calc(50% - ${ITEM_W / 2}px)`, transform: `translateX(-${offset}px)`, transition: spinning && offset ? "transform 5s cubic-bezier(0.12,0.8,0.18,1)" : "none" }}>
          {strip.map((v, i) => (
            <div key={i} style={{ width: ITEM_W }} className="shrink-0 px-1">
              <div className={`bg-${c}-soft flex h-20 flex-col items-center justify-center rounded-xl text-xs font-extrabold text-foreground`}>
                <img src={coins} alt="" className="h-9 w-9" />${v.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-sm opacity-90">Use a <span className="capitalize">{c}</span> key to open this case</p>
      <div className="mx-auto mt-2 flex w-fit items-center gap-1 rounded-full glass px-4 py-1 font-bold"><Key c={c} size={18} />{n}</div>
      <Button variant="ghost" disabled={spinning || n < 1} onClick={() => void start()} className="btn-red mt-4 w-full rounded-full py-3 text-lg font-extrabold disabled:opacity-50">
        {spinning ? <><Loader2 className="animate-spin" /> Opening...</> : n < 1 ? "No keys" : "Open Case"}
      </Button>
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
      <div className="glass mt-5 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm">
        <img src={coins} alt="" className="h-8 w-8" /><span className="flex-1">Possible reward</span><b>${min.toFixed(2)} – ${max.toFixed(2)}</b>
      </div>
    </div>
  );
}

function WinS({ v, balance, close }: { v: number; balance: number; close: () => void }) {
  return (
    <div className="min-h-screen bg-background px-6 pt-5 text-center">
      <div className="flex"><Button variant="ghost" onClick={close}><X /></Button></div>
      <h1 className="text-foreground text-4xl font-extrabold">Congratulations!</h1>
      <p className="font-bold">You won</p>
      <div className="pop burst mx-auto mt-4 grid h-64 w-64 place-items-center rounded-full">
        <img src={coins} alt="Coins" className="h-40 w-40" />
        <div className="glass -mt-6 rounded-full px-8 py-2 text-3xl font-extrabold">${v.toFixed(2)}</div>
      </div>
      <Button variant="ghost" onClick={close} className="mt-6 w-full rounded-full border-2 border-[var(--app-red)] py-3 text-lg font-extrabold">Cool!</Button>
      <div className="glass mx-auto mt-5 flex w-fit items-center gap-3 rounded-2xl px-5 py-3 text-left">
        <img src={walletImg} alt="" className="h-12 w-12" /><div><div className="text-sm">New balance</div><b className="text-xl">${balance.toFixed(2)}</b></div>
      </div>
      <Chest c="red" className="mx-auto mt-6 h-40 w-40" />
    </div>
  );
}

function BrandLogo({ id }: { id: string }) {
  const base = "grid h-14 w-full place-items-center rounded-xl text-lg font-black";
  if (id === "visa") return <div className={`${base} bg-blue-soft k-blue italic tracking-wider`}>VISA</div>;
  if (id === "btc") return <div className={base}><svg viewBox="0 0 32 32" className="h-12 w-12"><circle cx="16" cy="16" r="16" fill="#F7931A"/><text x="16" y="23" textAnchor="middle" fontSize="20" fontWeight="900" fill="#fff">₿</text></svg></div>;
  if (id === "ltc") return <div className={base}><svg viewBox="0 0 32 32" className="h-12 w-12"><circle cx="16" cy="16" r="16" fill="#345D9D"/><text x="16" y="23" textAnchor="middle" fontSize="20" fontWeight="900" fill="#fff">Ł</text></svg></div>;
  if (id === "doge") return <div className={base}><svg viewBox="0 0 32 32" className="h-12 w-12"><circle cx="16" cy="16" r="16" fill="#C2A633"/><text x="16" y="23" textAnchor="middle" fontSize="20" fontWeight="900" fill="#fff">Ð</text></svg></div>;
  if (id === "uzcard") return <div className={base}><svg viewBox="0 0 64 32" className="h-10 w-20"><rect width="64" height="32" rx="6" fill="#1A4D9C"/><text x="32" y="21" textAnchor="middle" fontSize="13" fontWeight="900" fill="#fff">UZCARD</text></svg></div>;
  return <div className={base}><svg viewBox="0 0 64 32" className="h-10 w-20"><rect width="64" height="32" rx="6" fill="#00A651"/><text x="32" y="21" textAnchor="middle" fontSize="14" fontWeight="900" fill="#fff">HUMO</text></svg></div>;
}

function WalletS({ balance, back, withdrawals, withdraw, clockOffset }: { clockOffset: number; balance: number; back: () => void; withdrawals: Withdrawal[]; withdraw: (method: string, amount: number, destination: string) => Promise<void> }) {
  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [picked, setPicked] = useState<string>();
  const m = WITHDRAW_METHODS.find((x) => x.id === picked);
  return (
    <div>
      <Header title="Wallet" back={back} right={<Info size={20} />} />
      <div className="watch-card relative mx-3 overflow-hidden rounded-2xl p-4">
        <img src={walletImg} alt="" className="absolute -right-2 -top-2 h-28 w-28" />
        <div className="text-sm">Your Balance</div>
        <div className="text-3xl font-extrabold">${balance.toFixed(2)}</div>
      </div>
      <div className="app-light mx-3 mt-3 rounded-2xl p-3">
        <h2 className="mb-2 font-extrabold">Withdraw Methods</h2>
        <div className="grid grid-cols-3 gap-3">
          {WITHDRAW_METHODS.map((x) => (
            <Button variant="ghost" key={x.id} onClick={() => setPicked(x.id)} className={`lcard h-auto flex-col gap-1 p-2 ${picked === x.id ? "ring-2 ring-primary" : ""}`}>
              <BrandLogo id={x.id} />
              <b className="text-xs">{x.name}</b>
              <span className="text-[10px] text-muted-foreground">Min ${x.min.toFixed(2)}</span>
            </Button>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">Pul tushish vaqti: {PAYOUT_DAYS} kun</p>
        {m && (
          <div className="lcard mt-3 p-3 text-sm">
            <b>{m.name}</b> · minimal ${m.min.toFixed(2)} · {PAYOUT_DAYS} kun ichida
            <form className="mt-3 space-y-3" onSubmit={async e => { e.preventDefault(); setBusy(true); setMessage(""); try { await withdraw(m.id, dollarsToCents(amount), destination); setMessage("So‘rov yuborildi"); setAmount(""); setDestination(""); } catch(err) { setMessage(err instanceof Error ? err.message : "So‘rov yuborilmadi"); } finally { setBusy(false); } }}>
              <label className="block">Miqdor ($)<Input aria-label="Yechish miqdori" inputMode="decimal" required value={amount} onChange={e => setAmount(e.target.value)} /></label>
              <label className="block">Karta / hamyon manzili<Input aria-label="Karta yoki hamyon" required minLength={8} maxLength={256} value={destination} onChange={e => setDestination(e.target.value)} /></label>
              <Button type="submit" disabled={busy || balance < m.min} className="btn-blue w-full">{busy ? "Yuborilmoqda..." : balance < m.min ? `Yana $${(m.min - balance).toFixed(2)} kerak` : "So‘rov yuborish"}</Button>
            </form>
          </div>
        )}
        {message && <p role="status" className="mt-3 text-sm">{message}</p>}
        <h2 className="mt-5 mb-2 text-sm font-extrabold">Yechish so‘rovlari</h2>
        {withdrawals.some(w => openPayment(w.status)) && <p role="status" className="bg-blue-soft mb-3 rounded-lg p-3 text-sm">⏳ Menejerimiz to‘lov yubormoqda, tez orada to‘lab beriladi.</p>}
        {!withdrawals.length && <p className="py-3 text-xs text-muted-foreground">Hozircha so‘rovlar yo‘q</p>}
        {withdrawals.map(w => <div key={w.id} className="flex justify-between gap-2 border-b py-3 text-xs"><span className="uppercase">{w.method}<small className="block normal-case text-muted-foreground">{STATUS_LABELS[w.status]}</small>{w.queue_number && <small className="block mt-1 normal-case font-bold">#{w.queue_number} navbat</small>}{openPayment(w.status) && w.due_at && <small className="block mt-1 normal-case"><Countdown deadline={w.due_at} offset={clockOffset} expired="Muddat tugadi — to‘lov kutilmoqda"/></small>}</span><b>${(w.amount_cents/100).toFixed(2)}</b></div>)}
      </div>
    </div>
  );
}

function ReferralS({ back, profile, stats }: { back: () => void; profile: TelegramProfile; stats: { invited: number; confirmed: number; keys: number } }) {
  const link = referralLink(profile.id);
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <Header title="Referral" back={back} />
      <div className="watch-card relative mx-3 overflow-hidden rounded-2xl p-4">
        <img src={walletImg} alt="" className="absolute -right-1 top-0 h-24 w-24" />
        <h2 className="text-2xl font-extrabold">Invite Friends</h2>
        <p className="text-sm">10 ta referal = 1 ta purple kalit</p>
      </div>
      <div className="app-light mx-3 mt-3 space-y-3 rounded-2xl p-3">
        <div>
          <b className="text-sm">Your referral link</b>
          <div className="lcard mt-1 flex items-center gap-2 p-2 text-xs">
            <span className="flex-1 truncate">{link}</span>
            <Button variant="ghost" size="sm" aria-label={copied ? "Copied" : "Copy referral link"} onClick={async () => { try { await navigator.clipboard.writeText(link); setCopied(true); } catch { setCopied(false); } }} className="btn-blue rounded-full"><Copy />{copied ? "Copied" : "Copy"}</Button>
          </div>
        </div>
        <div className="flex items-center justify-between border-b pb-3 text-sm font-bold"><span>Referal progress: {stats.confirmed % 10} / 10</span><span className="flex items-center gap-1"><Key c="purple" /> x1</span></div>
        <div className="grid grid-cols-3 gap-2">
          {[["Total invited", String(stats.invited)], ["Confirmed", String(stats.confirmed)], ["Keys received", String(stats.keys)]].map(([l, v]) => (
            <div key={l} className="lcard p-2"><div className="text-[11px] text-muted-foreground">{l}</div><b className="text-lg">{v}</b></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileS({ keys, profile, stats, admin }: { keys: Record<Color, number>; profile: TelegramProfile; stats: { opened: number; earned: number }; admin?: (() => void) | undefined }) {
  return (
    <div>
      <Header title="Profile" right={<Settings size={22} />} />
      {admin && <Button className="mx-3 mb-4" onClick={admin}><ShieldCheck size={18} />Admin panel</Button>}
      <div className="app-light mx-3 space-y-3 rounded-2xl p-3">
        <div className="flex items-center gap-3">
          <img src={profile.photo_url ?? avatar} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = avatar; }} alt="Telegram profile" width={80} height={80} loading="lazy" className="h-20 w-20 rounded-full object-cover" />
          <div className="min-w-0 flex-1">
            <b className="text-lg break-all">{profile.username ? `@${profile.username}` : [profile.first_name, profile.last_name].filter(Boolean).join(" ")}</b><div className="text-xs text-muted-foreground">ID: {profile.id}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[["0", "Referrals"], [String(stats.opened), "Cases opened"], [`$${stats.earned.toFixed(2)}`, "Total earned"]].map(([v, l]) => (
            <div key={l} className="lcard p-2"><b className="block">{v}</b><span className="text-[10px] text-muted-foreground">{l}</span></div>
          ))}
        </div>
        <div className="lcard p-3 text-xs">
          <b className="text-sm">Statistics</b>
          {[["Withdrawn", "$0.00"], ["Active keys", String(Object.values(keys).reduce((total, n) => total + n, 0))]].map(([l, v]) => (
            <div key={l} className="flex justify-between border-b py-2 last:border-0"><span>{l}</span><b>{v}</b></div>
          ))}
        </div>
        <div>
          <b className="text-sm">Active keys</b>
          <div className="mt-1 grid grid-cols-4 gap-2">
            {CASES.map(({ c }) => (
              <div key={c} className="lcard flex items-center justify-center gap-1 p-2 font-bold"><Key c={c} />{keys[c]}</div>
            ))}
          </div>
        </div>
        <Button asChild variant="ghost" className="lcard h-auto w-full justify-start gap-3 whitespace-normal p-3 text-left">
          <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer">
          <HelpCircle className="k-purple" size={30} />
          <div className="flex-1"><b className="block text-sm">Support</b><span className="k-blue text-xs">Need help? Contact us</span></div>
          <ChevronRight size={18} />
          </a>
        </Button>
      </div>
    </div>
  );
}

function KeyDetailS({ c, n, back, open }: { c: Color; n: number; back: () => void; open: () => void }) {
  const cs = CASES.find((x) => x.c === c);
  if (!cs) return null;
  return (
    <div className="px-4">
      <Header title="Key Details" back={back} />
      <div className="flex items-center gap-4 py-4">
        <div className="burst grid h-32 w-32 place-items-center rounded-full"><Key c={c} size={80} /></div>
        <div><b className="text-2xl capitalize">{c} Key</b><div className="text-sm opacity-80">Common</div></div>
      </div>
      <div className="glass flex justify-between rounded-xl p-4"><span>Quantity</span><b>{n}</b></div>
      <h2 className="mt-5 mb-2 font-bold">Possible cases</h2>
      <div className="glass rounded-xl">
        <div className="flex items-center gap-3 border-b border-border/20 p-3">
          <Chest c={c} className="h-12 w-12" />
          <div className="flex-1"><b className="block">{cs.name}</b><span className="text-xs opacity-80">Common</span></div>
          <Button variant="ghost" onClick={open} className="btn-blue rounded-full px-5 py-1.5 font-bold">Open</Button>
        </div>
        <div className="flex justify-between p-3"><span>Bonus chance</span><span className="flex items-center gap-1">1% <Info size={14} /></span></div>
      </div>
      <p className="glass mt-4 rounded-xl p-4 text-xs opacity-90">Used to open {cs.name}. You can get keys from ads, referrals or special events.</p>
    </div>
  );
}
