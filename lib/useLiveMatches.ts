"use client";

import { useEffect, useState } from "react";
import { Match } from "./types";

const POLL_INTERVAL_MS = 30_000;

// Polls /api/matches periodically so live scores update without a page
// reload. Falls back to the server-rendered initial data if a poll fails.
export function useLiveMatches(initialMatches: Match[]): Match[] {
  const [matches, setMatches] = useState(initialMatches);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/matches");
        if (!res.ok) return;
        const data: { matches: Match[] } = await res.json();
        setMatches(data.matches);
      } catch {
        // Keep showing the last known data if the poll fails.
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  return matches;
}
