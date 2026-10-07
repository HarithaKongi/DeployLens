import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHmac, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

function verifySignature(body: string, signature: string | null) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret || !signature?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  const received = signature.slice("sha256=".length);
  if (expected.length !== received.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-hub-signature-256");
  const event = request.headers.get("x-github-event") ?? "unknown";
  const deliveryId = request.headers.get("x-github-delivery");

  if (!deliveryId) return NextResponse.json({ error: "Missing GitHub delivery id" }, { status: 400 });
  if (!verifySignature(body, signature)) return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });

  const payload = JSON.parse(body) as Record<string, any>;

  try {
    await prisma.webhookEvent.upsert({
      where: { deliveryId },
      update: {},
      create: { eventType: event, deliveryId, payload },
    });

    if (event === "deployment") {
      const repository = payload.repository;
      const deployment = payload.deployment;
      if (repository?.id && deployment?.id) {
        const repo = await prisma.repository.upsert({
          where: { githubId: String(repository.id) },
          update: {
            name: repository.name,
            fullName: repository.full_name,
            defaultBranch: repository.default_branch ?? "main",
          },
          create: {
            githubId: String(repository.id),
            name: repository.name,
            fullName: repository.full_name,
            defaultBranch: repository.default_branch ?? "main",
          },
        });

        const state = event === "deployment_status"
          ? String(payload.deployment_status?.state ?? "queued").toUpperCase()
          : "QUEUED";

        const status = ["QUEUED", "RUNNING", "SUCCESS", "FAILED", "CANCELLED"].includes(state)
          ? state as "QUEUED" | "RUNNING" | "SUCCESS" | "FAILED" | "CANCELLED"
          : "QUEUED";

        await prisma.deployment.upsert({
          where: { id: String(deployment.id) },
          update: {
            commitSha: deployment.sha ?? "",
            branch: deployment.ref ?? "main",
            status,
            environment: deployment.environment ?? "production",
            url: payload.deployment_status?.environment_url ?? deployment.url ?? null,
            errorMessage: payload.deployment_status?.description ?? null,
          },
          create: {
            id: String(deployment.id),
            repositoryId: repo.id,
            commitSha: deployment.sha ?? "",
            branch: deployment.ref ?? "main",
            status,
            environment: deployment.environment ?? "production",
            url: payload.deployment_status?.environment_url ?? deployment.url ?? null,
            errorMessage: payload.deployment_status?.description ?? null,
          },
        });
      }
    }

    return NextResponse.json({ received: true, event, deliveryId });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook processing failed" },
      { status: 500 },
    );
  }
}