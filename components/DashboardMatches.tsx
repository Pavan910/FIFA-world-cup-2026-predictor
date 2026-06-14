"use client";

import Link from "next/link";
import { Match } from "@/lib/types";
import { useLiveMatches } from "@/lib/useLiveMatches";
import MatchCard from "./MatchCard";

export default function DashboardMatches({ initialMatches }: { initialMatches: Match[] }) {
  const matches = useLiveMatches(initialMatches);

  const live = matches.filter((m) => m.status === "IN_PLAY" || m.status === "PAUSED");
  const upcoming = matches
    .filter((m) => m.status === "SCHEDULED" || m.status === "TIMED")
    .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
    .slice(0, 3);
  const recentResults = matches
    .filter((m) => m.status === "FINISHED")
    .sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime())
    .slice(0, 3);

  return (
    <>
      {live.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-bold">Live Now</h2>
          <div className="flex flex-col gap-2">
            {live.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold">Upcoming Matches</h2>
          <Link href="/fixtures" className="text-sm font-medium hover:underline">
            View all
          </Link>
        </div>
        {upcoming.length > 0 ? (
          <div className="flex flex-col gap-2">
            {upcoming.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <p className="text-zinc-500">No upcoming matches scheduled.</p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">Recent Results</h2>
        {recentResults.length > 0 ? (
          <div className="flex flex-col gap-2">
            {recentResults.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <p className="text-zinc-500">No results yet.</p>
        )}
      </section>
    </>
  );
}
