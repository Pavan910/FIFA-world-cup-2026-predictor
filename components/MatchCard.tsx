import { Match } from "@/lib/types";
import TeamFlag from "./TeamFlag";
import PredictButton from "./PredictButton";
import OddsButton from "./OddsButton";

const UNPLAYED_STATUSES: Match["status"][] = ["SCHEDULED", "TIMED", "IN_PLAY", "PAUSED"];

function statusBadge(status: Match["status"]) {
  switch (status) {
    case "IN_PLAY":
    case "PAUSED":
      return { label: "LIVE", className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" };
    case "FINISHED":
      return { label: "FT", className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" };
    case "POSTPONED":
    case "SUSPENDED":
    case "CANCELLED":
      return { label: status, className: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" };
    default:
      return { label: "Upcoming", className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" };
  }
}

export default function MatchCard({ match }: { match: Match }) {
  const badge = statusBadge(match.status);
  const hasScore = match.homeScore !== null && match.awayScore !== null;
  const kickoff = new Date(match.utcDate).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  const canPredict = UNPLAYED_STATUSES.includes(match.status);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>{match.group ?? match.stage.replace(/_/g, " ")}</span>
        <span className={`rounded px-2 py-0.5 font-medium ${badge.className}`}>
          {badge.label}
        </span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2">
          <TeamFlag flag={match.homeTeam.flag} name={match.homeTeam.name} />
          <span className="font-medium">{match.homeTeam.name}</span>
        </div>
        <div className="text-lg font-semibold tabular-nums">
          {hasScore ? `${match.homeScore} – ${match.awayScore}` : kickoff}
        </div>
        <div className="flex flex-1 items-center justify-end gap-2 text-right">
          <span className="font-medium">{match.awayTeam.name}</span>
          <TeamFlag flag={match.awayTeam.flag} name={match.awayTeam.name} />
        </div>
      </div>
      <div className="flex flex-wrap items-stretch gap-2">
        {canPredict && <PredictButton match={match} />}
        <OddsButton matchId={match.id} />
      </div>
    </div>
  );
}
