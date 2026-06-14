import Link from "next/link";
import { getGroups, getMatches } from "@/lib/football-api";
import DashboardMatches from "@/components/DashboardMatches";
import StandingsTable from "@/components/StandingsTable";

export default async function DashboardPage() {
  const [matches, groups] = await Promise.all([getMatches(), getGroups()]);

  return (
    <div className="flex flex-col gap-8">
      <DashboardMatches initialMatches={matches} />

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
