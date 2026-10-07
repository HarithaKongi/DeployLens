import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  let database: "ok" | "not-configured" | "error" = "not-configured";

  if (process.env.DATABASE_URL) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      database = "ok";
    } catch {
      database = "error";
    }
  }

  const healthy = database !== "error";

  return NextResponse.json(
    {
      service: "DeployLens",
      status: healthy ? "ok" : "degraded",
      database,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 },
  );
}