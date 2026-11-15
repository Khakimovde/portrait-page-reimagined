# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Static hosting (no Node server)

Node.js is needed only to install dependencies and produce the static files:

```sh
npm install
npm run build
```

Upload **the contents of `dist/`**, including `index.html`, `favicon.ico` and the entire `assets/` folder, to any HTTPS static hosting. Images and styles are bundled with relative paths; do not upload only index.html. No Node process, Cloud key, or server files are needed on this host. `npm run build:static` explicitly produces the same static output. `npm run build:cloud` builds the separate Lovable/TanStack Cloud API; managed Lovable builds select that target automatically.

In BotFather, select **@Lootzy_enbot**, enable its **Main Mini App**, and set its HTTPS URL to your uploaded app. The Main Mini App is required for `https://t.me/Lootzy_enbot?startapp=ref_<TelegramID>` links. Bot numeric ID: `9261613826`. No bot token belongs in the browser or hosting files.

The Cloud API independently checks raw Telegram launch signatures on every request. Accounts, balances, keys and withdrawals are stored securely; old browser balances are not imported. Only Telegram ID 5326022510 can receive the server-managed admin role. Admin access appears in Profile after a successful Cloud identity check.

The static frontend defaults to `https://portrait-of-a-page.lovable.app` (set in scripts/api-url.mjs) for its Cloud API. Publish the latest Cloud API through Lovable before using the uploaded frontend. To use another published API, set `VITE_LOOTZY_API_URL` when building. No continuously running Node server is needed on your static host, but the Cloud service is still required for secure account/admin operations.

Admins can search accounts after users first open the Mini App, add dollars or keys, and manage withdrawal requests. Withdrawals reserve balance immediately; rejection refunds exactly once. Marking paid records an externally completed payment; it does not send money to a bank or crypto network.

Ad completions reported by the browser are recorded separately as unverified and do not grant spendable keys or advance the verified reward progress. The home page distinguishes watched reports from verified progress. Provider-verified ad rewards and referral counting remain unconnected. Real Telegram launch and admin end-to-end checks require a signed launch from the configured bot. Profile Support opens @Lootzy_help.
