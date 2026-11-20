import { useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SUPPORT_URL } from "@/lib/lootzy-rules";
import Countdown from "./countdown";
import trophyPng from "@/assets/mega-turnir-trophy.png";
import pinkCasePng from "@/assets/mega-turnir-pink-case.png";

export const MEGA_TURNIR_DRAW_AT = "2026-11-20T21:00:00+05:00";

export const MEGA_TURNIR_PRIZES = [
  { place: 1, medal: "🥇", prizeSom: 350_000, cardClass: "mega-prize-1" },
  { place: 2, medal: "🥈", prizeSom: 250_000, cardClass: "mega-prize-2" },
  { place: 3, medal: "🥉", prizeSom: 150_000, cardClass: "mega-prize-3" },
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
            350 000 so‘mgacha yutuq • 20-noyabr 21:00
          </span>
        </span>
        <ChevronDown className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </Button>

      {open && (
        <div id="mega-turnir-details" className="mega-card space-y-3 rounded-2xl p-4">
          <div className="flex items-center justify-between gap-2 rounded-xl bg-red-soft px-3 py-2 text-xs font-extrabold k-red">
            <span>👑 20-noyabr 21:00 da aniqlanadi</span>
            <Countdown deadline={MEGA_TURNIR_DRAW_AT} expired="Aniqlanmoqda" />
          </div>

          <div className="space-y-2">
            {MEGA_TURNIR_PRIZES.map((item) => (
              <div key={item.place} className={`flex items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5 ${item.cardClass}`}>
                <span className="flex items-center gap-2 text-sm font-extrabold">
                  <span className="text-2xl" aria-hidden="true">{item.medal}</span>
                  <span>{item.place}-o‘rin uchun</span>
                </span>
                <b className="text-base font-black k-red">{formatPrize(item.prizeSom)}</b>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-green-soft p-3 text-xs font-bold leading-relaxed">
            👑 Mukofot 20-noyabr 21:00 da aniqlanadi va 22:00 gacha yutuqlar kartangizga o‘tkaziladi. Turnir yutuqlari balansingizga qo‘shilib uni yechishga berishingiz shart emas — g‘olib aniqlangach to‘g‘ridan-to‘g‘ri kartangizga to‘lab beriladi. ✅
          </div>

          <div className="flex items-center gap-3 rounded-2xl border-2 border-border bg-pink-soft p-3">
            <img
              src={pinkCasePng}
              alt="Pink case"
              width={64}
              height={64}
              className="h-16 w-16 shrink-0 rounded-xl object-cover shadow"
            />
            <p className="min-w-0 flex-1 text-xs font-bold leading-relaxed">
              ⚠️ Turnirda qatnashish uchun kamida 1 ta Pink case sotib olasiz. Uning ichidan 60 mingdan 120 minggacha yechib olasiz, undan tashqari turnirda ishtirokchi bo‘lasiz.
            </p>
          </div>

          <a
            href={SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-red flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-center text-base font-extrabold"
          >
            Sotib olish <ExternalLink size={16} aria-hidden="true" />
          </a>
        </div>
      )}
    </section>
  );
}
