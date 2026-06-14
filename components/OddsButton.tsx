import Link from "next/link";

export default function OddsButton({ matchId }: { matchId: number }) {
  return (
    <Link
      href={`/odds/${matchId}`}
      className="flex-1 rounded-full border border-zinc-300 px-4 py-2 text-center text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      Odds
    </Link>
  );
}
