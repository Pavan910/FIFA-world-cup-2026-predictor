"use client";

import { useEffect, useState } from "react";
import { MatchOdds } from "./types";

const POLL_INTERVAL_MS = 60_000;

// Polls /api/odds/[matchId] periodically so odds stay current without a
// page reload. Falls back to the server-rendered initial data if a poll fails.
export function useLiveOdds(matchId: number, initialOdds: MatchOdds): MatchOdds {
  const [odds, setOdds] = useState(initialOdds);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/odds/${matchId}`);
        if (!res.ok) return;
        const data: MatchOdds = await res.json();
        setOdds(data);
      } catch {
        // Keep showing the last known data if the poll fails.
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [matchId]);

  return odds;
}
