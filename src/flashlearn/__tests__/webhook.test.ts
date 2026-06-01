import { describe, it, expect } from "vitest";
import { createHmac } from "node:crypto";
import { verifyFlashLearnSignature } from "../webhook";

const SECRET = "test-secret-do-not-use-in-prod";

function signedHeader(body: string, secret = SECRET): string {
  return "sha256=" + createHmac("sha256", secret).update(body).digest("hex");
}

describe("verifyFlashLearnSignature", () => {
  it("accepts a correctly-signed payload", () => {
    const body = '{"type":"session.completed","sessionId":"abc"}';
    expect(
      verifyFlashLearnSignature({
        rawBody: body,
        signatureHeader: signedHeader(body),
        secret: SECRET,
      }),
    ).toBe(true);
  });

  it("rejects a payload signed with a different secret", () => {
    const body = '{"type":"session.completed","sessionId":"abc"}';
    expect(
      verifyFlashLearnSignature({
        rawBody: body,
        signatureHeader: signedHeader(body, "different-secret"),
        secret: SECRET,
      }),
    ).toBe(false);
  });

  it("rejects when the body has been tampered with", () => {
    const original = '{"type":"session.completed","sessionId":"abc"}';
    const tampered = '{"type":"session.completed","sessionId":"xyz"}';
    expect(
      verifyFlashLearnSignature({
        rawBody: tampered,
        signatureHeader: signedHeader(original),
        secret: SECRET,
      }),
    ).toBe(false);
  });

  it("rejects a missing header (fail-closed)", () => {
    expect(
      verifyFlashLearnSignature({
        rawBody: "{}",
        signatureHeader: null,
        secret: SECRET,
      }),
    ).toBe(false);
    expect(
      verifyFlashLearnSignature({
        rawBody: "{}",
        signatureHeader: undefined,
        secret: SECRET,
      }),
    ).toBe(false);
  });

  it("rejects when the secret is empty (fail-closed)", () => {
    const body = "{}";
    expect(
      verifyFlashLearnSignature({
        rawBody: body,
        signatureHeader: signedHeader(body),
        secret: "",
      }),
    ).toBe(false);
  });

  it("rejects on length mismatch (e.g., header without sha256= prefix)", () => {
    const body = "{}";
    const correct = signedHeader(body);
    // Strip the "sha256=" prefix — should fail length check.
    expect(
      verifyFlashLearnSignature({
        rawBody: body,
        signatureHeader: correct.replace(/^sha256=/, ""),
        secret: SECRET,
      }),
    ).toBe(false);
  });
});
