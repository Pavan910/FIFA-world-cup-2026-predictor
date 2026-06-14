"use client";

import { useState } from "react";
import { Match } from "@/lib/types";

type Outcome = "home" | "draw" | "away";

interface BetCalculatorProps {
  match: Match;
  odds: { name: string; home: number; draw: number; away: number };
}

export default function BetCalculator({ match, odds }: BetCalculatorProps) {
  const [outcome, setOutcome] = useState<Outcome>("home");
  const [stake, setStake] = useState<number>(100);

  const selectedOdds = odds[outcome];
  const payout = stake > 0 ? stake * selectedOdds : 0;
  const profit = payout - stake;

  const options: { key: Outcome; label: string }[] = [
    { key: "home", label: match.homeTeam.name },
    { key: "draw", label: "Draw" },
    { key: "away", label: match.awayTeam.name },
  ];

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Bet Calculator</h2>
        <span className="text-xs text-zinc-400">Odds: {odds.name}</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setOutcome(opt.key)}
            className={`flex flex-col items-center gap-1 rounded-md border px-2 py-3 transition-colors ${
              outcome === opt.key
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
                : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            }`}
          >
            <span className="text-xs text-zinc-500 truncate w-full text-center">{opt.label}</span>
            <span className="text-lg font-bold tabular-nums">{odds[opt.key].toFixed(2)}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-zinc-500" htmlFor="stake">
          Stake
        </label>
        <input
          id="stake"
          type="number"
          min={0}
          step={1}
          value={stake}
          onChange={(e) => setStake(Math.max(0, Number(e.target.value)))}
          className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm tabular-nums focus:border-emerald-500 focus:outline-none dark:border-zinc-700"
        />
      </div>

      <div className="flex flex-col gap-1 rounded-md bg-zinc-50 p-3 text-sm dark:bg-zinc-800/50">
        <div className="flex items-center justify-between">
          <span className="text-zinc-500">Odds</span>
          <span className="font-medium tabular-nums">{selectedOdds.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-500">Total Payout</span>
          <span className="font-medium tabular-nums">{payout.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-500">Profit</span>
          <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            {profit.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
