import { NextResponse } from "next/server";
import { getDbStatus } from "@/lib/db";

export async function GET() {
  const start = Date.now();
  const status = await getDbStatus();
  const latencyMs = Date.now() - start;

  return NextResponse.json({
    ...status,
    latencyMs,
    timestamp: new Date().toISOString(),
  });
}
