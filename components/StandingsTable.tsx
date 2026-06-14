import { Group } from "@/lib/types";
import TeamFlag from "./TeamFlag";

export default function StandingsTable({ group }: { group: Group }) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
      <div className="bg-zinc-50 px-4 py-2 font-semibold dark:bg-zinc-900">
        {group.name}
      </div>
      <table className="w-full text-sm">
        <thead className="text-left text-xs text-zinc-500">
          <tr>
            <th className="px-4 py-2">#</th>
            <th className="px-4 py-2">Team</th>
            <th className="px-2 py-2 text-center">P</th>
            <th className="px-2 py-2 text-center">W</th>
            <th className="px-2 py-2 text-center">D</th>
            <th className="px-2 py-2 text-center">L</th>
            <th className="px-2 py-2 text-center">GD</th>
            <th className="px-4 py-2 text-center">Pts</th>
          </tr>
        </thead>
        <tbody>
          {group.standings.map((row) => (
            <tr
              key={row.team.id}
              className="border-t border-zinc-100 dark:border-zinc-800"
            >
              <td className="px-4 py-2 text-zinc-500">{row.position}</td>
              <td className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <TeamFlag flag={row.team.flag} name={row.team.name} className="text-lg" />
                  <span>{row.team.name}</span>
                </div>
              </td>
              <td className="px-2 py-2 text-center">{row.playedGames}</td>
              <td className="px-2 py-2 text-center">{row.won}</td>
              <td className="px-2 py-2 text-center">{row.draw}</td>
              <td className="px-2 py-2 text-center">{row.lost}</td>
              <td className="px-2 py-2 text-center">{row.goalDifference}</td>
              <td className="px-4 py-2 text-center font-semibold">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
