import { Group, Match, StandingRow, Team } from "./types";
import { mockGroups, mockMatches } from "./mock-data";

const API_BASE = "https://api.football-data.org/v4";
const COMPETITION = "WC";

// football-data.org raw response shapes (only the fields we use)
interface ApiTeam {
  id: number;
  name: string;
  shortName?: string;
  tla?: string;
  crest?: string;
}

interface ApiMatch {
  id: number;
  utcDate: string;
  status: Match["status"];
  matchday: number | null;
  stage: string;
  group: string | null;
  homeTeam: ApiTeam;
  awayTeam: ApiTeam;
  score?: { fullTime?: { home: number | null; away: number | null } };
}

interface ApiStandingRow {
  position: number;
  team: ApiTeam;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

interface ApiStandingGroup {
  type: string;
  group: string | null;
  table: ApiStandingRow[];
}

async function fetchFromApi<T>(path: string): Promise<T | null> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { "X-Auth-Token": apiKey },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function mapTeam(team: ApiTeam): Team {
  return {
    id: team.id,
    name: team.name,
    shortName: team.shortName ?? team.tla ?? team.name,
    flag: team.crest ?? "",
  };
}

// "GROUP_A" -> "Group A"
function mapGroupName(group: string | null): string | null {
  if (!group) return null;
  return group.replace(/^GROUP_/, "Group ");
}

function mapMatch(raw: ApiMatch): Match {
  return {
    id: raw.id,
    utcDate: raw.utcDate,
    status: raw.status,
    matchday: raw.matchday,
    stage: raw.stage,
    group: mapGroupName(raw.group),
    homeTeam: mapTeam(raw.homeTeam),
    awayTeam: mapTeam(raw.awayTeam),
    homeScore: raw.score?.fullTime?.home ?? null,
    awayScore: raw.score?.fullTime?.away ?? null,
  };
}

function mapStandingRow(raw: ApiStandingRow): StandingRow {
  return {
    position: raw.position,
    team: mapTeam(raw.team),
    playedGames: raw.playedGames,
    won: raw.won,
    draw: raw.draw,
    lost: raw.lost,
    points: raw.points,
    goalsFor: raw.goalsFor,
    goalsAgainst: raw.goalsAgainst,
    goalDifference: raw.goalDifference,
  };
}

export async function getMatches(): Promise<Match[]> {
  const data = await fetchFromApi<{ matches: ApiMatch[] }>(
    `/competitions/${COMPETITION}/matches`
  );
  if (!data?.matches?.length) return mockMatches;
  return data.matches.map(mapMatch);
}

export async function getGroups(): Promise<Group[]> {
  const data = await fetchFromApi<{ standings: ApiStandingGroup[] }>(
    `/competitions/${COMPETITION}/standings`
  );
  const groupStandings = data?.standings?.filter(
    (s) => s.type === "TOTAL" && s.group
  );
  if (!groupStandings?.length) return mockGroups;

  return groupStandings
    .map((s) => ({
      name: mapGroupName(s.group) ?? "Group",
      standings: s.table.map(mapStandingRow),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
