import Link from "next/link";
import { getGroups, getMatches } from "@/lib/football-api";
import MatchCard from "@/components/MatchCard";
import StandingsTable from "@/components/StandingsTable";

export default async function DashboardPage() {
  const [matches, groups] = await Promise.all([getMatches(), getGroups()]);

  const live = matches.filter(
    (m) => m.status === "IN_PLAY" || m.status === "PAUSED"
  );
  const upcoming = matches
    .filter((m) => m.status === "SCHEDULED" || m.status === "TIMED")
    .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
    .slice(0, 3);
  const recentResults = matches
    .filter((m) => m.status === "FINISHED")
    .sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime())
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-8">
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

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold">Group Standings</h2>
          <Link href="/stats" className="text-sm font-medium hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.slice(0, 2).map((group) => (
            <StandingsTable key={group.name} group={group} />
          ))}
        </div>
      </section>
    </div>
  );
}
