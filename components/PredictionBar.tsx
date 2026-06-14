import { MatchPrediction } from "@/lib/predictions";

export default function PredictionBar({
  prediction,
  homeShortName,
  awayShortName,
}: {
  prediction: MatchPrediction;
  homeShortName: string;
  awayShortName: string;
}) {
  const { homeWinPct, drawPct, awayWinPct } = prediction;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div className="bg-emerald-500" style={{ width: `${homeWinPct}%` }} />
        <div className="bg-zinc-400 dark:bg-zinc-600" style={{ width: `${drawPct}%` }} />
        <div className="bg-blue-500" style={{ width: `${awayWinPct}%` }} />
      </div>
      <div className="flex justify-between text-[11px] text-zinc-500">
        <span>{homeShortName} {homeWinPct}%</span>
        <span>Draw {drawPct}%</span>
        <span>{awayShortName} {awayWinPct}%</span>
      </div>
    </div>
  );
}
