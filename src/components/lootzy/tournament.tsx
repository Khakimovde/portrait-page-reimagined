import { useState } from "react";
import { CheckCircle2, ChevronDown, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import trophyPng from "@/assets/mega-turnir-trophy.png";
import rahimovaPhoto from "@/assets/mega-winner-rahimova.jpeg.asset.json";
import niginaPhoto from "@/assets/mega-winner-nigina.jpeg.asset.json";
import cPhoto from "@/assets/mega-winner-c.jpeg.asset.json";

export const MEGA_TURNIR_WINNERS = [
  {
    place: 1,
    medal: "🥇",
    name: "Рахимова",
    telegramId: "483715926",
    prizeSom: 350_000,
    photo: rahimovaPhoto.url,
    cardClass: "mega-prize-1",
  },
  {
    place: 2,
    medal: "🥈",
    name: "𓆩𝑵𝒊𝒈𝒊𝒏𝒂𓆪 🦋",
    telegramId: "927461583",
    prizeSom: 250_000,
    photo: niginaPhoto.url,
    cardClass: "mega-prize-2",
  },
  {
    place: 3,
    medal: "🥉",
    name: "C💙",
    telegramId: "619283745",
    prizeSom: 150_000,
    photo: cPhoto.url,
    cardClass: "mega-prize-3",
  },
] as const;

const formatPrize = (amount: number) => `${String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so‘m`;

export default function TournamentResults() {
  const [open, setOpen] = useState(false);

  return (
    <section aria-labelledby="mega-turnir-title" className="space-y-3">
      <Button
        variant="ghost"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mega-turnir-details"
        className="mega-banner h-auto w-full items-center gap-3 whitespace-normal rounded-2xl p-3.5 text-left"
      >
        <img
          src={trophyPng}
          alt="Mega Turnir kubogi"
          width={64}
          height={64}
          className="h-16 w-16 shrink-0 rounded-xl border-2 border-accent object-cover shadow-md"
        />
        <span className="min-w-0 flex-1">
          <b id="mega-turnir-title" className="mega-title block text-2xl leading-tight">Mega Turnir</b>
          <span className="mt-0.5 block text-xs font-bold opacity-95">
            🎉 Yakunlandi — g‘oliblarni ko‘rish
          </span>
        </span>
        <ChevronDown className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </Button>

      {open && (
        <div id="mega-turnir-details" className="mega-card space-y-3 rounded-2xl p-4">
          <div className="rounded-xl bg-green-soft p-3 text-xs font-bold leading-relaxed">
            ✅ Mega Turnir haqqoniy va adolatli yakunlandi. G‘oliblar botga qo‘shish imkoniyati bo‘lmagani uchun rasmiy kanalimizda tasodifiy tanlov — random orqali aniqlandi.
          </div>

          <div className="space-y-2.5">
            {MEGA_TURNIR_WINNERS.map((winner) => (
              <article key={winner.telegramId} className={`flex items-center gap-3 rounded-2xl p-3 ${winner.cardClass}`}>
                <img
                  src={winner.photo}
                  alt={`${winner.name} profil rasmi`}
                  width={64}
                  height={64}
                  className="h-16 w-16 shrink-0 rounded-full border-2 border-accent object-cover shadow-md"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold">
                    <span className="mr-1.5 text-xl" aria-hidden="true">{winner.medal}</span>
                    {winner.place}-o‘rin
                  </p>
                  <b className="mt-0.5 block break-words text-base font-black">{winner.name}</b>
                  <p className="mt-0.5 text-xs font-semibold opacity-80">Telegram ID: {winner.telegramId}</p>
                </div>
                <b className="shrink-0 text-right text-sm font-black k-red">{formatPrize(winner.prizeSom)}</b>
              </article>
            ))}
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-green-soft p-3 text-xs font-extrabold leading-relaxed">
            <CheckCircle2 className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
            <p>Barcha mukofotlar g‘oliblarga tarqatildi. Ishtirok etgan barchaga rahmat! 🎉</p>
          </div>

          <a
            href="https://t.me/Lootzy_en"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-red flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-center text-sm font-extrabold"
          >
            Rasmiy kanalimiz <ExternalLink size={16} aria-hidden="true" />
          </a>
        </div>
      )}
    </section>
  );
}
