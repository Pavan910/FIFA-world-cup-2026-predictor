import { MatchContext, TeamMatchContext } from "./match-context";
import { MatchPrediction } from "./predictions";
import { StandingRow } from "./types";

export interface AiPrediction extends MatchPrediction {
  reasoning: string;
  source: "ai" | "fallback";
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

function formatStanding(standing: StandingRow | null): string {
  if (!standing) return "no group standings data available";
  return `played ${standing.playedGames}, won ${standing.won}, drawn ${standing.draw}, lost ${standing.lost}, goal difference ${standing.goalDifference}, ${standing.points} points`;
}

function formatRecentMatches(team: TeamMatchContext): string {
  if (team.recentMatches.length === 0) {
    return "has not played a match in this World Cup yet";
  }
  const lines = team.recentMatches
    .map((m) => `${m.result} ${m.goalsFor}-${m.goalsAgainst} vs ${m.opponent} (${m.isHome ? "home" : "away"})`)
    .join("; ");
  return `last ${team.recentMatches.length} results: ${lines} — totals: ${team.recentGoalsFor} scored, ${team.recentGoalsAgainst} conceded`;
}

function formatRanking(team: TeamMatchContext): string {
  return team.fifaRanking !== null ? `#${team.fifaRanking}` : "unranked";
}

const HOST_NATIONS_2026 = new Set(["United States", "Canada", "Mexico"]);

function buildPrompt(context: MatchContext): string {
  const { match, home, away, headToHead } = context;
  const h2hText = headToHead.length
    ? headToHead
        .map((h) => `${h.homeTeam} ${h.homeScore}-${h.awayScore} ${h.awayTeam}`)
        .join("; ")
    : "no previous meetings this tournament";

  const homeIsHost = HOST_NATIONS_2026.has(home.team.name);
  const awayIsHost = HOST_NATIONS_2026.has(away.team.name);
  const hostNote = homeIsHost
    ? `${home.team.name} is one of the three 2026 host nations (USA, Canada, Mexico) and will benefit from genuine home-crowd support and home-soil advantage.`
    : awayIsHost
      ? `${away.team.name} is one of the three 2026 host nations (USA, Canada, Mexico) and will benefit from genuine home-crowd support and home-soil advantage, even though they are listed as the away team in this fixture.`
      : `Neither team is a 2026 host nation (the hosts are USA, Canada, and Mexico). This match is played at a neutral venue — the "home"/"away" labels below are just the official fixture order and do NOT imply any home-crowd advantage for either side.`;

  return `You are an experienced football analyst predicting the outcome of a FIFA World Cup 2026 match. This is the 2026 tournament, hosted jointly by the United States, Canada, and Mexico — NOT the 2022 Qatar World Cup or any other prior tournament. Do not bring in outdated context like Qatar being a host, or any other team being a host, unless that team is USA, Canada, or Mexico. Use everything you know about international football to make a well-rounded prediction — don't rely on a single statistic.

Match: ${home.team.name} (home) vs ${away.team.name} (away)
Competition stage: ${match.group ?? match.stage}
Venue context: ${hostNote}

Data available for this match:

${home.team.name}:
- FIFA world ranking: ${formatRanking(home)}
- Group standing: ${formatStanding(home.standing)}
- Recent World Cup results: ${formatRecentMatches(home)}

${away.team.name}:
- FIFA world ranking: ${formatRanking(away)}
- Group standing: ${formatStanding(away.standing)}
- Recent World Cup results: ${formatRecentMatches(away)}

Head-to-head this tournament: ${h2hText}

In addition to the data above, draw on your own football knowledge of each squad — current key players and star quality, squad depth and injuries you're aware of, playing style and tactics, manager/coaching quality, historical World Cup pedigree and big-tournament experience, and current form/momentum heading into this tournament. FIFA ranking is just one input among many; do not treat it as the deciding factor or repeat it as the main reason in every answer. Only apply a home-advantage boost (roughly 5-10 percentage points) if the venue context above says a team is a genuine 2026 host nation — otherwise treat this as a neutral-venue match.

Weigh all of these factors together and vary which ones you emphasize based on what's actually most relevant to this specific matchup. Predict the outcome probabilities for ${home.team.name} winning, a draw, and ${away.team.name} winning. Respond with ONLY a JSON object in this exact format, with no extra text:
{"homeWinPct": <integer 0-100>, "drawPct": <integer 0-100>, "awayWinPct": <integer 0-100>, "reasoning": "<2-4 sentence explanation that references the specific factors that matter most for THIS matchup>"}

The three percentages must be integers that sum to exactly 100.`;
}

function toFallback(prediction: MatchPrediction): AiPrediction {
  return {
    ...prediction,
    reasoning:
      "AI prediction unavailable right now — showing a statistical estimate based on each team's results so far this tournament.",
    source: "fallback",
  };
}

export async function getAiPrediction(
  context: MatchContext,
  fallback: MatchPrediction
): Promise<AiPrediction> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return toFallback(fallback);

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || DEFAULT_MODEL,
        messages: [{ role: "user", content: buildPrompt(context) }],
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
    });

    if (!res.ok) return toFallback(fallback);

    const data = await res.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content;
    if (!content) return toFallback(fallback);

    const parsed = JSON.parse(content);
    const { homeWinPct, drawPct, awayWinPct, reasoning } = parsed;

    if (
      typeof homeWinPct !== "number" ||
      typeof drawPct !== "number" ||
      typeof awayWinPct !== "number" ||
      typeof reasoning !== "string"
    ) {
      return toFallback(fallback);
    }

    return {
      homeWinPct: Math.round(homeWinPct),
      drawPct: Math.round(drawPct),
      awayWinPct: Math.round(awayWinPct),
      reasoning,
      source: "ai",
    };
  } catch {
    return toFallback(fallback);
  }
}
