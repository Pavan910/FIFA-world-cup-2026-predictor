import Link from "next/link";
import { notFound } from "next/navigation";
import { getMatches } from "@/lib/football-api";
import { getMatchOdds } from "@/lib/odds-api";
import TeamFlag from "@/components/TeamFlag";
import OddsPanel from "@/components/OddsPanel";

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

      <OddsPanel match={match} initialOdds={odds} />

      <p className="text-xs text-zinc-400">
        Odds are for informational purposes only. Please gamble responsibly.
      </p>
    </div>
  );
}
