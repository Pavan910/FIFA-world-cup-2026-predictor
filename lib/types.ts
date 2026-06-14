export type MatchStatus =
  | "SCHEDULED"
  | "TIMED"
  | "IN_PLAY"
  | "PAUSED"
  | "FINISHED"
  | "POSTPONED"
  | "SUSPENDED"
  | "CANCELLED";

export interface Team {
  id: number;
  name: string;
  shortName: string;
  flag: string;
}

export interface Match {
  id: number;
  utcDate: string;
  status: MatchStatus;
  matchday: number | null;
  stage: string;
  group: string | null;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number | null;
  awayScore: number | null;
}

export interface StandingRow {
  position: number;
  team: Team;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface Group {
  name: string;
  standings: StandingRow[];
}

export interface BookmakerOdds {
  name: string;
  home: number;
  draw: number;
  away: number;
}

export interface MatchOdds {
  bookmakers: BookmakerOdds[];
  representative: { name: string; home: number; draw: number; away: number };
  source: "live" | "estimated";
}
