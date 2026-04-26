// HMAC verification for FlashLearn-AI's `session.completed` webhook.
//
// Header format:
//   X-FlashLearn-Signature: sha256=<hex>
//
// Use timingSafeEqual to avoid leaking signature byte length via timing.
// FL-AI's signing key rotates via /developer/webhooks; consumers must
// accept old + new signatures during the rotation grace window if
// they're feeling thorough — for MVP, single-secret verification is
// fine.

import { createHmac, timingSafeEqual } from "node:crypto";

export interface VerifyWebhookOptions {
  /** Raw request body as a string — DO NOT JSON.parse first. */
  rawBody: string;
  /** Value of the X-FlashLearn-Signature header. */
  signatureHeader: string | null | undefined;
  /** The webhook signing secret registered at /developer/webhooks. */
  secret: string;
}

/**
 * Verifies the HMAC signature on a FlashLearn-AI webhook request.
 * Returns true if the signature is valid; false otherwise.
 *
 * Always reject by default (e.g., missing header → false) so a
 * misconfiguration on either side fails closed.
 */
export function verifyFlashLearnSignature(opts: VerifyWebhookOptions): boolean {
  if (!opts.signatureHeader || !opts.secret) return false;

  const expected =
    "sha256=" +
    createHmac("sha256", opts.secret).update(opts.rawBody).digest("hex");

  // timingSafeEqual requires equal-length buffers; bail out fast if
  // they aren't, but use the Buffer comparison for the constant-time path.
  const received = opts.signatureHeader;
  if (received.length !== expected.length) return false;

  try {
    return timingSafeEqual(Buffer.from(received), Buffer.from(expected));
  } catch {
    return false;
  }
}
