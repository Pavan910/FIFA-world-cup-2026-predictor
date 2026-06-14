import { BookmakerOdds, Match, MatchOdds } from "./types";
import { buildPredictor } from "./predictions";

const ODDS_API_BASE = "https://api.the-odds-api.com/v4";
const SPORT = "soccer_fifa_world_cup";

// Maps football-data.org team names to the names used by The Odds API
// where they differ.
const TEAM_NAME_ALIASES: Record<string, string> = {
  "United States": "USA",
  Czechia: "Czech Republic",
  "Bosnia-Herzegovina": "Bosnia and Herzegovina",
  "Cape Verde Islands": "Cape Verde",
  "Congo DR": "DR Congo",
  Curaçao: "Curacao",
  "Ivory Coast": "Ivory Coast",
};

function normalizeName(name: string): string {
  return (TEAM_NAME_ALIASES[name] ?? name).toLowerCase().trim();
}

interface ApiOutcome {
  name: string;
  price: number;
}

interface ApiMarket {
  key: string;
  outcomes: ApiOutcome[];
}

interface ApiBookmaker {
  title: string;
  markets: ApiMarket[];
}

interface ApiEvent {
  home_team: string;
  away_team: string;
  bookmakers: ApiBookmaker[];
}

async function fetchLiveOdds(revalidate: number): Promise<ApiEvent[] | null> {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `${ODDS_API_BASE}/sports/${SPORT}/odds?apiKey=${apiKey}&regions=eu,uk&markets=h2h&oddsFormat=decimal`,
      { next: { revalidate } }
    );
    if (!res.ok) return null;
    return (await res.json()) as ApiEvent[];
  } catch {
    return null;
  }
}

function findEvent(events: ApiEvent[], match: Match): ApiEvent | null {
  const home = normalizeName(match.homeTeam.name);
  const away = normalizeName(match.awayTeam.name);

  return (
    events.find(
      (e) => normalizeName(e.home_team) === home && normalizeName(e.away_team) === away
    ) ?? null
  );
}

function bookmakersFromEvent(event: ApiEvent): BookmakerOdds[] {
  const result: BookmakerOdds[] = [];

  for (const bookmaker of event.bookmakers) {
    const market = bookmaker.markets.find((m) => m.key === "h2h");
    if (!market) continue;

    const home = market.outcomes.find((o) => o.name === event.home_team);
    const away = market.outcomes.find((o) => o.name === event.away_team);
    const draw = market.outcomes.find((o) => o.name === "Draw");

    if (!home || !away || !draw) continue;

    result.push({
      name: bookmaker.title,
      home: home.price,
      draw: draw.price,
      away: away.price,
    });
  }

  return result;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

// Some bookmakers occasionally return mislabeled outcomes (e.g. the "away"
// price actually matching the consensus "draw" price). Drop any bookmaker
// whose odds deviate too far from the consensus median before picking the
// "best" price, so a single bad data point can't blow up the bet calculator.
function dropOutlierBookmakers(bookmakers: BookmakerOdds[]): BookmakerOdds[] {
  if (bookmakers.length < 3) return bookmakers;

  const medians = {
    home: median(bookmakers.map((b) => b.home)),
    draw: median(bookmakers.map((b) => b.draw)),
    away: median(bookmakers.map((b) => b.away)),
  };

  return bookmakers.filter((b) =>
    (["home", "draw", "away"] as const).every((key) => {
      const ratio = b[key] / medians[key];
      return ratio >= 0.4 && ratio <= 2.5;
    })
  );
}

// Picks the single bookmaker whose home/draw/away line sits closest to the
// market consensus (median). This gives one coherent, realistic line —
// similar to what a typical bookmaker like Stake would show — rather than
// an inflated "best of all books" combination.
function representativeOdds(bookmakers: BookmakerOdds[]): BookmakerOdds {
  if (bookmakers.length === 1) return bookmakers[0];

  const medians = {
    home: median(bookmakers.map((b) => b.home)),
    draw: median(bookmakers.map((b) => b.draw)),
    away: median(bookmakers.map((b) => b.away)),
  };

  let best = bookmakers[0];
  let bestDistance = Infinity;

  for (const b of bookmakers) {
    const distance =
      Math.abs(b.home - medians.home) / medians.home +
      Math.abs(b.draw - medians.draw) / medians.draw +
      Math.abs(b.away - medians.away) / medians.away;

    if (distance < bestDistance) {
      bestDistance = distance;
      best = b;
    }
  }

  return best;
}

// Converts a win/draw/loss percentage split into estimated decimal odds with
// a typical ~6% bookmaker margin, used when live odds aren't available.
function estimateOdds(matches: Match[], match: Match): MatchOdds {
  const predictor = buildPredictor(matches);
  const { homeWinPct, drawPct, awayWinPct } = predictor(match.homeTeam, match.awayTeam);
  const MARGIN = 0.94;

  const toOdds = (pct: number) => Math.max(1.01, Math.round(((100 / pct) * MARGIN) * 100) / 100);

  const odds = {
    home: toOdds(homeWinPct),
    draw: toOdds(drawPct),
    away: toOdds(awayWinPct),
  };

  return {
    bookmakers: [{ name: "Estimated", ...odds }],
    representative: { name: "Estimated", ...odds },
    source: "estimated",
  };
}

const LIVE_REVALIDATE_SECONDS = 60;
const UPCOMING_REVALIDATE_SECONDS = 1800;

export async function getMatchOdds(matches: Match[], match: Match): Promise<MatchOdds> {
  const isLive = match.status === "IN_PLAY" || match.status === "PAUSED";
  const revalidate = isLive ? LIVE_REVALIDATE_SECONDS : UPCOMING_REVALIDATE_SECONDS;

  const events = await fetchLiveOdds(revalidate);
  if (!events) return estimateOdds(matches, match);

  const event = findEvent(events, match);
  if (!event) return estimateOdds(matches, match);

  const rawBookmakers = bookmakersFromEvent(event);
  if (rawBookmakers.length === 0) return estimateOdds(matches, match);

  const bookmakers = dropOutlierBookmakers(rawBookmakers);
  if (bookmakers.length === 0) return estimateOdds(matches, match);

  return {
    bookmakers,
    representative: representativeOdds(bookmakers),
    source: "live",
  };
}
