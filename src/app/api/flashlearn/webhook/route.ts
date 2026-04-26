// FlashLearn-AI session.completed webhook receiver.
//
// FL-AI POSTs here after a child plays a deck. The body matches the
// response of POST /sessions/:id/results — same `assembleSessionCompletedPayload`
// helper on their side — so we can persist on the POST side AND treat
// the webhook as audit confirmation.
//
// Phase 4 will fill in the DB-write logic. For now this scaffold:
//  1. reads the raw body
//  2. verifies HMAC against FLASHLEARN_WEBHOOK_SECRET
//  3. parses and logs (real persistence lands with Phase 3 DB live)
//  4. returns 200 to acknowledge delivery; otherwise FL-AI retries

import { NextResponse } from "next/server";
import type { SessionCompletedPayload } from "@/flashlearn/types";
import { verifyFlashLearnSignature } from "@/flashlearn/webhook";

export async function POST(request: Request) {
  const secret = process.env.FLASHLEARN_WEBHOOK_SECRET;
  if (!secret) {
    // Fail closed in production. In development without the secret
    // configured, return 503 so FL-AI sees a clear "not ready" signal
    // instead of a misleading 200.
    console.error("[fl-ai webhook] FLASHLEARN_WEBHOOK_SECRET not set");
    return NextResponse.json(
      { error: { code: "WEBHOOK_NOT_CONFIGURED" } },
      { status: 503 },
    );
  }

  const rawBody = await request.text();
  const signatureHeader = request.headers.get("x-flashlearn-signature");

  if (
    !verifyFlashLearnSignature({
      rawBody,
      signatureHeader,
      secret,
    })
  ) {
    return NextResponse.json(
      { error: { code: "INVALID_SIGNATURE" } },
      { status: 401 },
    );
  }

  let payload: SessionCompletedPayload;
  try {
    payload = JSON.parse(rawBody) as SessionCompletedPayload;
  } catch {
    return NextResponse.json(
      { error: { code: "MALFORMED_BODY" } },
      { status: 400 },
    );
  }

  // FL-AI dedupes deliveries via X-FlashLearn-Delivery — we should
  // store this id and return 200 immediately on a duplicate. Phase 3
  // wires that against an `webhook_deliveries` table.
  const deliveryId = request.headers.get("x-flashlearn-delivery");

  // TODO(phase-3): write `payload.cards` into `card_attempts`,
  // recompute the local mastery materialized view, mark the session
  // complete in our `sessions` table.
  //
  // For now: log and acknowledge. In dev this gives us a way to test
  // the verification + parsing path without the DB layer.
  console.info("[fl-ai webhook] session.completed", {
    deliveryId,
    sessionId: payload.sessionId,
    childId: payload.childId,
    cardCount: payload.cards.length,
  });

  return NextResponse.json({ ok: true });
}
