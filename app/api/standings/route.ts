import { NextResponse } from "next/server";
import { getGroups } from "@/lib/football-api";

export async function GET() {
  const groups = await getGroups();
  return NextResponse.json({ groups });
}
