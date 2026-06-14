"use client";

import { Match, MatchStatus } from "@/lib/types";
import { useLiveMatches } from "@/lib/useLiveMatches";
import MatchCard from "./MatchCard";

export default function FixtureList({
  initialMatches,
  statuses,
}: {
  initialMatches: Match[];
  statuses?: MatchStatus[];
}) {
  const matches = useLiveMatches(initialMatches);

  const filtered = statuses
    ? matches.filter((match) => statuses.includes(match.status))
    : matches;

  const sorted = [...filtered].sort(
    (a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime()
  );

  if (sorted.length === 0) {
    return <p className="text-zinc-500">No matches found.</p>;
  }

  const byDate = new Map<string, Match[]>();
  for (const match of sorted) {
    const key = new Date(match.utcDate).toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    byDate.set(key, [...(byDate.get(key) ?? []), match]);
  }

  return (
    <div className="flex flex-col gap-6">
      {Array.from(byDate.entries()).map(([date, dayMatches]) => (
        <section key={date}>
          <h3 className="mb-2 text-sm font-semibold text-zinc-500">{date}</h3>
          <div className="flex flex-col gap-2">
            {dayMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
