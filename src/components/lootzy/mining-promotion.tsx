import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, ChevronRight, Clock3, Gift, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROMOTION_END, PROMOTION_OFFERS, promotionActive } from "@/lib/lootzy-promotion-rules";
import { SUPPORT_URL } from "@/lib/lootzy-rules";
import Countdown from "./countdown";
import chest from "@/assets/chest.png";

function usePromotion(offset: number) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  return promotionActive(now + offset);
}

export function MiningPromotionBanner({ open, offset = 0 }: { open: () => void; offset?: number }) {
  const active = usePromotion(offset);
  return <Button variant="ghost" onClick={open} className="bonus-round-banner h-auto w-full gap-3 whitespace-normal rounded-lg p-4 text-left">
    <img src={chest} alt="" className="c-pink h-16 w-16 shrink-0 object-contain" />
    <span className="min-w-0 flex-1">
      <span className="bonus-round-label block text-xs font-extrabold">{active ? "13 NOYABR · MAXSUS AKSIYA" : "AKSIYA YAKUNLANDI"}</span>
      <b className="my-1 block text-lg">Mining oling — bonus case sizga!</b>
      <span className="block text-xs">100 ming → 2 Pink · 50 ming → 1 Pink + 2 Green</span>
      <span className="mt-2 flex items-center gap-1 text-xs font-bold"><Clock3 size={14}/><Countdown deadline={PROMOTION_END} offset={offset} expired="Aksiya tugadi"/></span>
    </span><ChevronRight className="shrink-0" size={18}/>
  </Button>;
}

export default function MiningPromotion({ back, offset = 0 }: { back: () => void; offset?: number }) {
  const active = usePromotion(offset);
  return <section className="px-4 pb-8">
    <header className="flex items-center gap-3 py-5"><Button variant="ghost" size="icon" aria-label="Orqaga" onClick={back}><ArrowLeft/></Button><h1 className="text-xl font-extrabold">Mining bonus aksiyasi</h1></header>
    <div className="relative border-b border-border pb-6 text-center">
      <span className="bonus-round-label text-xs font-extrabold">13 NOYABR · 15 SOATLIK TAKLIF</span>
      <img src={chest} alt="Pink bonus case" className="c-pink mx-auto my-3 h-36 w-36 object-contain"/>
      <h2 className="text-2xl font-extrabold">Mining bilan ko‘proq case!</h2>
      <p className="mt-3 text-sm text-muted-foreground">Aksiya davomida 50 000 yoki 100 000 so‘mlik Mining xarid qiling va qo‘shimcha case bonusini oling. Bonus tarif narxiga qo‘shimcha sovg‘a.</p>
      <div className="bonus-round-label mt-5 flex items-center justify-center gap-2 text-3xl font-extrabold"><Clock3 size={22}/><Countdown deadline={PROMOTION_END} offset={offset} expired="Aksiya tugadi"/></div>
      <p className="mt-2 text-xs text-muted-foreground">13 noyabr 12:37 — 14 noyabr 03:37 · Toshkent vaqti</p>
    </div>
    <div className="grid gap-3 py-5">{PROMOTION_OFFERS.map(offer => <article key={offer.amount} className="flex items-center gap-4 rounded-lg border p-4">
      <Gift className={offer.green ? "k-green shrink-0" : "k-pink shrink-0"} size={30}/>
      <div className="min-w-0"><h3 className="font-extrabold">{offer.amount.toLocaleString("uz")} so‘mlik Mining</h3><p className="mt-1 text-sm"><b className="k-pink">{offer.pink} ta Pink case</b>{offer.green > 0 && <> + <b className="k-green">{offer.green} ta Green case</b></>}</p><p className="mt-1 text-xs text-muted-foreground">Xarid uchun qo‘shimcha bonus</p></div>
    </article>)}</div>
    <h2 className="mb-3 flex items-center gap-2 font-bold"><ShieldCheck size={18}/>Aksiya shartlari</h2>
    <ol className="list-decimal space-y-3 pl-5 text-sm text-muted-foreground">
      <li>Adminga Telegram ID raqamingiz va tanlagan Mining tarifingizni yuboring.</li>
      <li>Aksiya muddati ichida to‘lovni amalga oshiring. To‘lov tasdiqlangach, admin Miningni boshlaydi va tarifingizga mos bonusni qo‘shadi.</li>
      <li>Oldin olingan Mining uchun bonus berilmaydi. Hisoblagich tugagach, yangi xaridlar aksiyada qatnashmaydi.</li>
    </ol>
    <p className="my-5 text-xs text-muted-foreground">Mining — ilova ichidagi hisob-kitob, haqiqiy kripto mining emas. Pul kiritish xavfli; haqiqiy daromad kafolatlanmaydi. Case ichidagi mukofot tasodifiy.</p>
    {active ? <Button asChild className="btn-blue h-auto w-full whitespace-normal py-3"><a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer">Aksiyada qatnashish<ArrowUpRight size={18}/></a></Button> : <Button disabled className="w-full">Aksiya yakunlandi</Button>}
    <p className="mt-3 text-center text-xs text-muted-foreground">{active ? "@Lootzy_help · To‘lov va bonusni admin tasdiqlaydi" : "15 soatlik taklif muddati tugadi. Aksiya bonusi uchun yangi xaridlar qabul qilinmaydi."}</p>
  </section>;
}