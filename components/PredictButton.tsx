"use client";

import { useState } from "react";
import { Match } from "@/lib/types";
import { FormResult, HeadToHeadEntry, TeamMatchContext } from "@/lib/match-context";
import { AiPrediction } from "@/lib/groq";
import PredictionBar from "./PredictionBar";

interface PredictResponse {
  prediction: AiPrediction;
  context: {
    home: TeamMatchContext;
    away: TeamMatchContext;
    headToHead: HeadToHeadEntry[];
  };
}

const FORM_COLORS: Record<FormResult, string> = {
  W: "bg-emerald-500",
  D: "bg-zinc-400",
  L: "bg-red-500",
};

function FormBadges({ form }: { form: FormResult[] }) {
  if (form.length === 0) {
    return <span className="text-zinc-400">No matches played in this World Cup yet</span>;
  }
  return (
    <div className="flex gap-1">
      {form.map((result, i) => (
        <span
          key={i}
          className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${FORM_COLORS[result]}`}
        >
          {result}
        </span>
      ))}
    </div>
  );
}

function standingLine(standing: TeamMatchContext["standing"]): string | null {
  if (!standing) return null;
  return `P${standing.playedGames} W${standing.won} D${standing.draw} L${standing.lost} · GD ${standing.goalDifference} · ${standing.points} pts`;
}

function TeamStats({ team }: { team: TeamMatchContext }) {
  const line = standingLine(team.standing);
  return (
    <div className="flex flex-col gap-1">
      <p className="font-medium text-zinc-700 dark:text-zinc-300">{team.team.shortName}</p>
      {team.fifaRanking !== null && (
        <p className="text-zinc-500">FIFA Ranking: #{team.fifaRanking}</p>
      )}
      <FormBadges form={team.recentForm} />
      {team.recentMatches.length > 0 && (
        <div className="text-zinc-500">
          {team.recentMatches.map((m, i) => (
            <p key={i}>
              {m.result} {m.goalsFor}-{m.goalsAgainst} vs {m.opponent} ({m.isHome ? "H" : "A"})
            </p>
          ))}
          <p className="mt-0.5 text-zinc-500">
            {team.recentGoalsFor} scored · {team.recentGoalsAgainst} conceded (this WC)
          </p>
        </div>
      )}
      {line && <p className="text-zinc-500">{line}</p>}
    </div>
  );
}

export default function PredictButton({ match }: { match: Match }) {
  const [status, setStatus] = useState<"idle" | "loading" | "loaded" | "error">("idle");
  const [data, setData] = useState<PredictResponse | null>(null);

  async function handlePredict() {
    setStatus("loading");
    try {
      const res = await fetch(`/api/predict?matchId=${match.id}`);
      if (!res.ok) throw new Error("Request failed");
      const json: PredictResponse = await res.json();
      setData(json);
      setStatus("loaded");
    } catch {
      setStatus("error");
    }
  }

  if (status === "idle" || status === "error") {
    return (
      <div className="flex flex-1 flex-col gap-1">
        <button
          onClick={handlePredict}
          className="w-full rounded-full border border-zinc-300 px-4 py-2 text-center text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Prediction
        </button>
        {status === "error" && (
          <p className="text-xs text-red-500">Couldn&apos;t load a prediction. Try again.</p>
        )}
      </div>
    );
  }

  if (status === "loading") {
    return <p className="flex-1 text-center text-xs text-zinc-500">Analyzing match…</p>;
  }

  const { prediction, context } = data!;

  return (
    <div className="flex w-full flex-col gap-3 rounded-md bg-zinc-50 p-3 dark:bg-zinc-800/50">
      <PredictionBar
        prediction={prediction}
        homeShortName={match.homeTeam.shortName}
        awayShortName={match.awayTeam.shortName}
      />
      <p className="text-xs text-zinc-600 dark:text-zinc-300">{prediction.reasoning}</p>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <TeamStats team={context.home} />
        <TeamStats team={context.away} />
      </div>
      {context.headToHead.length > 0 && (
        <div className="text-xs text-zinc-500">
          <p className="mb-1 font-medium text-zinc-700 dark:text-zinc-300">
            Head-to-head this tournament
          </p>
          {context.headToHead.map((h, i) => (
            <p key={i}>
              {h.homeTeam} {h.homeScore}–{h.awayScore} {h.awayTeam}
            </p>
          ))}
        </div>
      )}
      {prediction.source === "fallback" && (
        <p className="text-xs italic text-amber-600 dark:text-amber-400">
          Showing a statistical estimate — AI prediction unavailable right now.
        </p>
      )}
    </div>
  );
}
