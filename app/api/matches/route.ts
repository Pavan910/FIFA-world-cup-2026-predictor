import { NextRequest, NextResponse } from "next/server";
import { getMatches } from "@/lib/football-api";

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status");
  const matches = await getMatches();

  const filtered = status
    ? matches.filter((match) => match.status === status.toUpperCase())
    : matches;

  return NextResponse.json({ matches: filtered });
}
