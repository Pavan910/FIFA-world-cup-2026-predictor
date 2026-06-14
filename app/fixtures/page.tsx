import Link from "next/link";
import { getMatches } from "@/lib/football-api";
import FixtureList from "@/components/FixtureList";
import { MatchStatus } from "@/lib/types";

const FILTERS: { label: string; param?: string; statuses?: MatchStatus[] }[] = [
  { label: "All" },
  { label: "Upcoming", param: "upcoming", statuses: ["SCHEDULED", "TIMED"] },
  { label: "Live", param: "live", statuses: ["IN_PLAY", "PAUSED"] },
  { label: "Finished", param: "finished", statuses: ["FINISHED"] },
];

export default async function FixturesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const matches = await getMatches();

  const activeFilter = FILTERS.find((filter) => filter.param === status);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="mb-3 text-2xl font-bold">Fixtures & Results</h1>
        <div className="flex gap-2">
          {FILTERS.map((filter) => {
            const isActive = (status ?? undefined) === filter.param;
            return (
              <Link
                key={filter.label}
                href={filter.param ? `/fixtures?status=${filter.param}` : "/fixtures"}
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  isActive
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                }`}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>
      </div>
      <FixtureList initialMatches={matches} statuses={activeFilter?.statuses} />
    </div>
  );
}
