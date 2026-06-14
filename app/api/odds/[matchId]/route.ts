import { NextResponse } from "next/server";
import { getMatches } from "@/lib/football-api";
import { getMatchOdds } from "@/lib/odds-api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;
  const matches = await getMatches();
  const match = matches.find((m) => m.id === Number(matchId));

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  const odds = await getMatchOdds(matches, match);
  return NextResponse.json(odds);
}
