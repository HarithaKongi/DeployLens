import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    service: "DeployLens",
    status: "ok",
    timestamp: new Date().toISOString(),
    database: process.env.DATABASE_URL ? "configured" : "not-configured"
  });
}