import { Group, Match, StandingRow, Team } from "./types";
import { getFifaRanking } from "./fifa-rankings";

export type FormResult = "W" | "D" | "L";

export interface HeadToHeadEntry {
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
}

export interface RecentMatchEntry {
  date: string;
  opponent: string;
  isHome: boolean;
  goalsFor: number;
  goalsAgainst: number;
  result: FormResult;
}

export interface TeamMatchContext {
  team: Team;
  standing: StandingRow | null;
  fifaRanking: number | null;
  recentForm: FormResult[];
  recentMatches: RecentMatchEntry[];
  recentGoalsFor: number;
  recentGoalsAgainst: number;
}

export interface MatchContext {
  match: Match;
  home: TeamMatchContext;
  away: TeamMatchContext;
  headToHead: HeadToHeadEntry[];
}

function recentMatches(teamId: number, matches: Match[], limit = 5): RecentMatchEntry[] {
  return matches
    .filter((m) => m.homeTeam.id === teamId || m.awayTeam.id === teamId)
    .filter((m) => m.status === "FINISHED" && m.homeScore !== null && m.awayScore !== null)
    .sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime())
    .slice(0, limit)
    .map((m) => {
      const isHome = m.homeTeam.id === teamId;
      const goalsFor = (isHome ? m.homeScore : m.awayScore) as number;
      const goalsAgainst = (isHome ? m.awayScore : m.homeScore) as number;
      const result: FormResult = goalsFor > goalsAgainst ? "W" : goalsFor < goalsAgainst ? "L" : "D";
      return {
        date: m.utcDate,
        opponent: isHome ? m.awayTeam.name : m.homeTeam.name,
        isHome,
        goalsFor,
        goalsAgainst,
        result,
      };
    });
}

function findStanding(teamId: number, groups: Group[]): StandingRow | null {
  for (const group of groups) {
    const row = group.standings.find((r) => r.team.id === teamId);
    if (row) return row;
  }
  return null;
}

function headToHead(homeId: number, awayId: number, matches: Match[]): HeadToHeadEntry[] {
  return matches
    .filter((m) => m.status === "FINISHED" && m.homeScore !== null && m.awayScore !== null)
    .filter(
      (m) =>
        (m.homeTeam.id === homeId && m.awayTeam.id === awayId) ||
        (m.homeTeam.id === awayId && m.awayTeam.id === homeId)
    )
    .map((m) => ({
      date: m.utcDate,
      homeTeam: m.homeTeam.name,
      awayTeam: m.awayTeam.name,
      homeScore: m.homeScore as number,
      awayScore: m.awayScore as number,
    }));
}

function buildTeamContext(team: Team, matches: Match[], groups: Group[]): TeamMatchContext {
  const recent = recentMatches(team.id, matches);
  return {
    team,
    standing: findStanding(team.id, groups),
    fifaRanking: getFifaRanking(team.name),
    recentForm: recent.map((m) => m.result),
    recentMatches: recent,
    recentGoalsFor: recent.reduce((sum, m) => sum + m.goalsFor, 0),
    recentGoalsAgainst: recent.reduce((sum, m) => sum + m.goalsAgainst, 0),
  };
}

export function buildMatchContext(
  matchId: number,
  matches: Match[],
  groups: Group[]
): MatchContext | null {
  const match = matches.find((m) => m.id === matchId);
  if (!match) return null;

  return {
    match,
    home: buildTeamContext(match.homeTeam, matches, groups),
    away: buildTeamContext(match.awayTeam, matches, groups),
    headToHead: headToHead(match.homeTeam.id, match.awayTeam.id, matches),
  };
}
