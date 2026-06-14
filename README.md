# FIFA World Cup 2026 Dashboard

A stats dashboard and fixtures/results tracker for the FIFA World Cup 2026, built with Next.js, TypeScript, and Tailwind CSS.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app. Pages:

- `/` — Dashboard: live matches, upcoming fixtures, recent results, and a standings snapshot
- `/fixtures` — Full fixtures/results list with status filters
- `/stats` — Group standings tables

## Live data

The app ships with mock data so it works out of the box. To use live World Cup data:

1. Get a free API key from [football-data.org](https://www.football-data.org/client/register).
2. Add it to `.env.local`:
   ```
   FOOTBALL_DATA_API_KEY=your_key_here
   ```
3. Restart the dev server. `lib/football-api.ts` automatically switches from mock data (`lib/mock-data.ts`) to live data once the key is set, falling back to mock data if the API request fails.
