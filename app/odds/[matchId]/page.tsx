import Link from "next/link";
import { notFound } from "next/navigation";
import { getMatches } from "@/lib/football-api";
import { getMatchOdds } from "@/lib/odds-api";
import TeamFlag from "@/components/TeamFlag";
import BetCalculator from "@/components/BetCalculator";

export default async function OddsPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  const matches = await getMatches();
  const match = matches.find((m) => m.id === Number(matchId));

  if (!match) {
    notFound();
  }

  const odds = await getMatchOdds(matches, match);

  const kickoff = new Date(match.utcDate).toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/fixtures" className="text-sm font-medium hover:underline">
          ← Back to fixtures
        </Link>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>{match.group ?? match.stage.replace(/_/g, " ")}</span>
          <span>{kickoff}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-2">
            <TeamFlag flag={match.homeTeam.flag} name={match.homeTeam.name} />
            <span className="font-medium">{match.homeTeam.name}</span>
          </div>
          <div className="text-lg font-semibold tabular-nums">
            {match.homeScore !== null && match.awayScore !== null
              ? `${match.homeScore} – ${match.awayScore}`
              : "vs"}
          </div>
          <div className="flex flex-1 items-center justify-end gap-2 text-right">
            <span className="font-medium">{match.awayTeam.name}</span>
            <TeamFlag flag={match.awayTeam.flag} name={match.awayTeam.name} />
          </div>
        </div>
      </div>

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

      <p className="text-xs text-zinc-400">
        Odds are for informational purposes only. Please gamble responsibly.
      </p>
    </div>
  );
}
