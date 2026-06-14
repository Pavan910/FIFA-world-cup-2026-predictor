import { getGroups } from "@/lib/football-api";
import StandingsTable from "@/components/StandingsTable";

export default async function StatsPage() {
  const groups = await getGroups();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Group Standings</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {groups.map((group) => (
          <StandingsTable key={group.name} group={group} />
        ))}
      </div>
    </div>
  );
}
