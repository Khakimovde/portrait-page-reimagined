import { useEffect, useState } from "react";
import { remainingTime } from "@/lib/lootzy-mining-rules";
export default function Countdown({ deadline, expired = "Muddat tugadi", offset = 0 }: { deadline: string; expired?: string; offset?: number }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  return <span className="tabular-nums">{Date.parse(deadline) <= now + offset ? expired : remainingTime(deadline, now + offset)}</span>;
}