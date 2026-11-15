import { createFileRoute } from "@tanstack/react-router";
import App from "@/components/lootzy/app";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Lootzy — Telegram Mini App" },
    { name: "description", content: "Lootzy: Telegram orqali kiring, red, purple, green va pink sandiqlarni ko‘ring." },
    { property: "og:title", content: "Lootzy — Telegram Mini App" },
    { property: "og:description", content: "Telegramdagi Lootzy: reklama va referal kalitlari, to‘rtta sandiq." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: App,
});
