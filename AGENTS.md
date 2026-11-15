<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Import bundled profile imagery from `src/assets` so the frontend can serve it without external image dependencies.
- Keep the reusable Lootzy UI independent of TanStack routes so a separate Vite static entry can host the same React application without a Node server.
- Verify raw Telegram initData on every Cloud API request; browser identity is display-only, and separate server-managed Telegram roles authorize admin operations.
- Keep account changes, case openings and withdrawal reservations/refunds atomic in service-role-only database functions so retries and concurrent requests cannot duplicate money or keys.
- Never import browser balances into trusted accounts or grant rewards from reported ad completion; only provider-verified completion may authorize ad keys.
- Use the public authenticated-by-Telegram API for the separately hosted Vite entry, preserving route-independent shared UI.
- Select pure static dist output for local npm builds and retain TanStack builds in the managed Lovable environment; static hosting must not discard the separately deployed trusted API.
- Count only verified ad events toward reward progress and expose unverified report totals separately so watched reports cannot imply spendable rewards.
- The Telegram bot runs through the gateway webhook at /api/public/telegram/webhook, verified by a secret derived from the connection key; referral confirmation and referral key grants happen only in the service-role database function after a live channel-membership check, so referrals cannot be claimed without a real subscription.
- Bot notices (withdrawals, referrals) are best-effort and must never fail or roll back the money operation that triggered them.
- The static mini app's API URL lives in scripts/api-url.mjs and must be this project's own published URL, because a remix keeps the old URL and silently reads the old project's database.
- Bonus entries and weighted draws use a service-role-only, role-checked database function with a transaction lock, distinct persisted ranks and atomic prize grants; retries must never reroll or award twice.
- Keep bonus UI route-independent and expose its operations through the Telegram-verified API so static hosting uses the same trusted game state.

- Rotate bonus games with independent round IDs and service-role functions; preserve completed rounds and balances so old results cannot enter or pay out again in a new round.
- Mining runs persist their exchange rate and payout at admin activation; service-role-only settlement locks each due run and credits it once, with hourly reconciliation plus settlement on authenticated reads.
- Withdrawal queue numbers are immutable global ticket numbers assigned by an insert trigger; persisted deadlines are independent of payment status and never automatically mark a transfer paid.
- Purchase-promotion UI uses one fixed shared window and server clock offset; contact-only offers never grant rewards from browser clicks and remain independent of TanStack routes for static hosting.
