"use client";

import { Match, MatchOdds } from "@/lib/types";
import { useLiveOdds } from "@/lib/useLiveOdds";
import BetCalculator from "./BetCalculator";

export default function OddsPanel({
  match,
  initialOdds,
}: {
  match: Match;
  initialOdds: MatchOdds;
}) {
  const odds = useLiveOdds(match.id, initialOdds);

  return (
    <>
      <BetCalculator match={match} odds={odds.representative} />

      <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Odds by bookmaker
        </h2>
        {odds.source === "estimated" && (
          <p className="text-xs italic text-amber-600 dark:text-amber-400">
            Live odds aren&apos;t available for this match — showing an estimate based on our
            statistical model.
          </p>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-zinc-500">
                <th className="py-1 pr-4 font-medium">Bookmaker</th>
                <th className="py-1 pr-4 font-medium text-right">{match.homeTeam.shortName}</th>
                <th className="py-1 pr-4 font-medium text-right">Draw</th>
                <th className="py-1 font-medium text-right">{match.awayTeam.shortName}</th>
              </tr>
            </thead>
            <tbody>
              {odds.bookmakers.map((b, i) => (
                <tr key={`${b.name}-${i}`} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="py-2 pr-4">{b.name}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{b.home.toFixed(2)}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{b.draw.toFixed(2)}</td>
                  <td className="py-2 text-right tabular-nums">{b.away.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
