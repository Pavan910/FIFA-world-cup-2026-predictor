import { Match, Team } from "./types";
import { getFifaRanking } from "./fifa-rankings";

export interface MatchPrediction {
  homeWinPct: number;
  drawPct: number;
  awayWinPct: number;
}

interface TeamStats {
  played: number;
  points: number;
  goalDiff: number;
}

const HOME_ADVANTAGE = 3;
const BASE_DRAW_PCT = 0.28;
const MIN_DRAW_PCT = 0.16;

// Only USA, Canada, and Mexico co-host the 2026 World Cup; every other
// fixture is played at a neutral venue with no real home advantage.
const HOST_NATIONS_2026 = new Set(["United States", "Canada", "Mexico"]);

function buildTeamStats(matches: Match[]): Map<number, TeamStats> {
  const stats = new Map<number, TeamStats>();

  const ensure = (id: number) => {
    let entry = stats.get(id);
    if (!entry) {
      entry = { played: 0, points: 0, goalDiff: 0 };
      stats.set(id, entry);
    }
    return entry;
  };

  for (const match of matches) {
    if (
      match.status !== "FINISHED" ||
      match.homeScore === null ||
      match.awayScore === null
    ) {
      continue;
    }

    const home = ensure(match.homeTeam.id);
    const away = ensure(match.awayTeam.id);

    home.played += 1;
    away.played += 1;
    home.goalDiff += match.homeScore - match.awayScore;
    away.goalDiff += match.awayScore - match.homeScore;

    if (match.homeScore > match.awayScore) {
      home.points += 3;
    } else if (match.homeScore < match.awayScore) {
      away.points += 3;
    } else {
      home.points += 1;
      away.points += 1;
    }
  }

  return stats;
}

// FIFA ranking contribution: a mid-table team (rank ~24) scores 0, a top-ranked
// team scores positive, a lower-ranked team scores negative.
function rankingRating(teamName: string): number {
  const rank = getFifaRanking(teamName);
  if (rank === null) return 0;
  return (24 - rank) / 4;
}

// Rating in roughly the same range for every team: 0 for an average/unplayed team,
// positive for teams performing above average, negative for below.
function teamRating(stats: TeamStats | undefined, teamName: string): number {
  const ranking = rankingRating(teamName);
  if (!stats || stats.played === 0) return ranking;
  const pointsPerGame = stats.points / stats.played;
  const goalDiffPerGame = stats.goalDiff / stats.played;
  return (pointsPerGame - 1.5) * 10 + goalDiffPerGame * 5 + ranking * 0.5;
}

// Rounds three percentages to integers that sum to exactly 100.
function roundToHundred([a, b, c]: [number, number, number]): [number, number, number] {
  const rounded = [Math.round(a), Math.round(b), Math.round(c)];
  const diff = 100 - (rounded[0] + rounded[1] + rounded[2]);
  if (diff !== 0) {
    const largestIndex = rounded.indexOf(Math.max(...rounded));
    rounded[largestIndex] += diff;
  }
  return rounded as [number, number, number];
}

export function buildPredictor(matches: Match[]) {
  const stats = buildTeamStats(matches);

  return function predictMatch(home: Team, away: Team): MatchPrediction {
    const homeAdvantage = HOST_NATIONS_2026.has(home.name) ? HOME_ADVANTAGE : 0;
    const homeRating = teamRating(stats.get(home.id), home.name) + homeAdvantage;
    const awayRating = teamRating(stats.get(away.id), away.name);
    const diff = homeRating - awayRating;

    const drawPct = Math.max(BASE_DRAW_PCT - Math.abs(diff) * 0.01, MIN_DRAW_PCT);
    const homeShare = 1 / (1 + Math.exp(-diff / 8));
    const remaining = 1 - drawPct;

    const [homeWinPct, drawRounded, awayWinPct] = roundToHundred([
      remaining * homeShare * 100,
      drawPct * 100,
      remaining * (1 - homeShare) * 100,
    ]);

    return { homeWinPct, drawPct: drawRounded, awayWinPct };
  };
}
