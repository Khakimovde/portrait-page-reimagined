// Alternates Monetag and Onclicka; if one fails, the other fills in.
const MONETAG_ZONE = "12146511";
const ONCLICKA_SPOT = 6154390;
type Show = () => Promise<unknown>;
const w = () => window as unknown as Record<string, any>;

function loadScript(src: string, attrs: Record<string, string> = {}) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src; s.async = true;
    Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
    s.onload = () => resolve(); s.onerror = () => reject(new Error("load failed"));
    document.head.appendChild(s);
  });
}

let onclickaShow: Promise<Show> | undefined;
async function showOnclicka() {
  onclickaShow ??= loadScript("https://js.onclckvd.com/in-stream-ad-admanager/tma.js")
    .then(() => w()["initCdTma"]({ id: ONCLICKA_SPOT }) as Promise<Show>)
    .catch((e) => { onclickaShow = undefined; throw e; });
  const show = await onclickaShow;
  await show();
}
async function showMonetag() {
  await loadScript("https://libtl.com/sdk.js", { "data-zone": MONETAG_ZONE, "data-sdk": `show_${MONETAG_ZONE}` });
  const fn = w()[`show_${MONETAG_ZONE}`];
  if (typeof fn !== "function") throw new Error("Monetag unavailable");
  await fn();
}

const providers: [() => Promise<void>, () => Promise<void>] = [showMonetag, showOnclicka];
let turn = 0;
export function preloadAds() { void loadScript("https://libtl.com/sdk.js", { "data-zone": MONETAG_ZONE, "data-sdk": `show_${MONETAG_ZONE}` }).catch(() => {}); void showOnclickaInit(); }
function showOnclickaInit() { onclickaShow ??= loadScript("https://js.onclckvd.com/in-stream-ad-admanager/tma.js").then(() => w()["initCdTma"]({ id: ONCLICKA_SPOT })).catch(() => { onclickaShow = undefined; throw new Error(); }); return onclickaShow.catch(() => {}); }

/** Resolves when an ad was fully watched (by either provider); rejects if both fail. */
export async function showNextAd() {
  const first = turn % 2; turn++;
  try { await (first ? providers[1] : providers[0])(); }
  catch { await (first ? providers[0] : providers[1])(); }
}
