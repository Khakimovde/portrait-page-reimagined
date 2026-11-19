import { useState } from "react";
import { CheckCircle2, ChevronDown, ExternalLink, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import nozaninPhoto from "@/assets/nozanin-abdusattorova.jpeg.asset.json";
import doniyorbekPhoto from "@/assets/doniyorbek.jpeg.asset.json";
import guliPhoto from "@/assets/guli.jpeg.asset.json";

export const TOURNAMENT_WINNERS = [
  { place: 1, medal: "🥇", name: "Nozanin Abdusattorova", telegramId: 5837291046, prizeSom: 200_000, photo: nozaninPhoto.url },
  { place: 2, medal: "🥈", name: "Doniyorbek", telegramId: 9274618350, prizeSom: 100_000, photo: doniyorbekPhoto.url },
  { place: 3, medal: "🥉", name: "Guli 🤍", telegramId: 6148392751, prizeSom: 50_000, photo: guliPhoto.url },
] as const;

const formatPrize = (amount: number) => `${String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so‘m`;

export default function TournamentResults() {
  const [open, setOpen] = useState(true);

  return (
    <section aria-labelledby="tournament-results-title" className="space-y-3">
      <Button
        variant="ghost"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="tournament-winners"
        className="btn-blue h-auto w-full items-center gap-3 whitespace-normal rounded-2xl border-2 border-accent p-4 text-left shadow-xl"
      >
        <Trophy className="h-9 w-9 shrink-0 txt-gold" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <b id="tournament-results-title" className="block text-xl">Turnir yakunlandi!</b>
          <span className="text-xs">G‘oliblar va mukofotlarni ko‘ring</span>
        </span>
        <ChevronDown className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </Button>

      {open && (
        <div id="tournament-winners" className="lcard space-y-3 p-4">
          <div className="rounded-xl bg-green-soft p-3 text-center">
            <b className="flex items-center justify-center gap-2 text-sm k-green">
              <CheckCircle2 size={20} aria-hidden="true" /> Haqqoniy va adolatli yakunlandi
            </b>
            <p className="mt-1 text-xs">G‘oliblar rasmiy kanalimizda tasodifiy tanlov — random orqali aniqlandi.</p>
          </div>

          <div className="space-y-2">
            {TOURNAMENT_WINNERS.map((winner) => (
              <article key={winner.telegramId} className={`flex items-center gap-3 rounded-2xl border p-3 ${winner.place === 1 ? "bg-gold-soft" : "bg-card"}`}>
                <div className="relative shrink-0">
                  <img
                    src={winner.photo}
                    alt={`${winner.name} profil rasmi`}
                    className="h-16 w-16 rounded-full border-2 border-accent object-cover"
                    width={64}
                    height={64}
                    loading="lazy"
                  />
                  <span className="absolute -bottom-1 -right-1 text-2xl" aria-label={`${winner.place}-o‘rin`}>{winner.medal}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-muted-foreground">{winner.place}-o‘rin</span>
                  <h3 className="break-words text-base font-extrabold">{winner.name}</h3>
                  <p className="text-xs text-muted-foreground">ID: {winner.telegramId}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="block text-[10px] font-bold text-muted-foreground">Mukofot</span>
                  <b className="text-sm k-blue">{formatPrize(winner.prizeSom)}</b>
                </div>
              </article>
            ))}
          </div>

          <p className="rounded-xl bg-blue-soft p-3 text-center text-sm font-bold">
            🎉 Barcha mukofotlar g‘oliblarga tarqatildi. G‘oliblarni chin dildan tabriklaymiz!
          </p>
          <a
            href="https://t.me/Lootzy_en"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 text-center text-xs font-bold k-blue underline"
          >
            Natijalar e’lon qilingan rasmiy kanal <ExternalLink size={13} aria-hidden="true" />
          </a>
        </div>
      )}
    </section>
  );
}
