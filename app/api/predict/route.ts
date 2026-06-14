import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { getGroups, getMatches } from "@/lib/football-api";
import { buildMatchContext } from "@/lib/match-context";
import { buildPredictor } from "@/lib/predictions";
import { getAiPrediction } from "@/lib/groq";

export async function GET(request: NextRequest) {
  const matchIdParam = request.nextUrl.searchParams.get("matchId");
  const matchId = Number(matchIdParam);

  if (!matchIdParam || Number.isNaN(matchId)) {
    return NextResponse.json({ error: "matchId is required" }, { status: 400 });
  }

  const [matches, groups] = await Promise.all([getMatches(), getGroups()]);
  const context = buildMatchContext(matchId, matches, groups);

  if (!context) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  const fallback = buildPredictor(matches)(context.match.homeTeam, context.match.awayTeam);

  const getCachedPrediction = unstable_cache(
    () => getAiPrediction(context, fallback),
    ["predict", String(matchId)],
    { revalidate: 3600 }
  );

  const prediction = await getCachedPrediction();

  return NextResponse.json({
    prediction,
    context: {
      home: context.home,
      away: context.away,
      headToHead: context.headToHead,
    },
  });
}
