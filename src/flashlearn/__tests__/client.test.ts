import { describe, it, expect, vi } from "vitest";
import { FlashLearnClient, FlashLearnError } from "../client";
import type {
  CreateSessionRequest,
  MasteryResponse,
} from "../types";

function mockFetch(
  responses: Array<{ status: number; body: unknown } | Error>,
): typeof fetch {
  let i = 0;
  return vi.fn(async () => {
    const next = responses[i++];
    if (next instanceof Error) throw next;
    if (!next) throw new Error("mockFetch ran out of responses");
    return new Response(JSON.stringify(next.body), {
      status: next.status,
      headers: { "Content-Type": "application/json" },
    });
  }) as unknown as typeof fetch;
}

const baseOpts = {
  baseUrl: "https://sandbox.flashlearnai.witus.online/api/v1",
  apiKey: "fl_eco_test_key",
};

describe("FlashLearnClient", () => {
  describe("createSession", () => {
    it("posts to /sessions and unwraps the envelope", async () => {
      const fetchImpl = mockFetch([
        {
          status: 201,
          body: {
            data: {
              sessionId: "uuid-abc",
              scheduledFor: "2026-04-27T05:00:00Z",
              estimatedCardCount: 4,
            },
          },
        },
      ]);
      const client = new FlashLearnClient({ ...baseOpts, fetchImpl });

      const req: CreateSessionRequest = {
        childId: "child-001",
        ageBand: "4-7",
        standards: [{ framework: "indiana-k", code: "K.NS.1" }],
        sourceContext: {
          consumer: "wanderlearn-stories",
          bookId: "alice",
          hubId: "h1-descent",
          completedAt: "2026-04-26T19:00:00Z",
        },
        tz: "America/Indiana/Indianapolis",
      };
      const out = await client.createSession(req);

      expect(out.sessionId).toBe("uuid-abc");
      expect(out.estimatedCardCount).toBe(4);

      const call = (fetchImpl as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(call[0]).toBe(
        "https://sandbox.flashlearnai.witus.online/api/v1/sessions",
      );
      const init = call[1] as RequestInit;
      expect(init.method).toBe("POST");
      expect(
        (init.headers as Record<string, string>).Authorization,
      ).toBe("Bearer fl_eco_test_key");
      expect(JSON.parse(init.body as string)).toEqual(req);
    });

    it("throws FlashLearnError with the API code on 4xx", async () => {
      const fetchImpl = mockFetch([
        {
          status: 400,
          body: {
            error: {
              code: "INVALID_INPUT",
              message: "unknown standard",
              details: { unknownStandards: ["K.X.99"] },
            },
          },
        },
      ]);
      const client = new FlashLearnClient({ ...baseOpts, fetchImpl });

      await expect(
        client.createSession({
          childId: "c",
          ageBand: "4-7",
          standards: [{ framework: "indiana-k", code: "K.X.99" }],
          sourceContext: {
            consumer: "wanderlearn-stories",
            bookId: "alice",
            hubId: "h1",
            completedAt: "2026-04-26T19:00:00Z",
          },
        }),
      ).rejects.toMatchObject({
        name: "FlashLearnError",
        code: "INVALID_INPUT",
        status: 400,
        details: { unknownStandards: ["K.X.99"] },
      });
    });
  });

  describe("getMastery", () => {
    it("GETs /mastery/:childId and unwraps", async () => {
      const fetchImpl = mockFetch([
        {
          status: 200,
          body: {
            data: {
              childId: "child-001",
              standards: [
                {
                  framework: "indiana-k",
                  code: "K.NS.1",
                  state: "demonstrated",
                  firstAttemptCorrectRate: 0.83,
                  attemptCount: 12,
                  lastAttemptAt: "2026-04-27T08:00:00Z",
                },
              ],
            } satisfies MasteryResponse,
          },
        },
      ]);
      const client = new FlashLearnClient({ ...baseOpts, fetchImpl });

      const out = await client.getMastery("child-001");
      expect(out.standards[0].state).toBe("demonstrated");

      const call = (fetchImpl as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(call[0]).toBe(
        "https://sandbox.flashlearnai.witus.online/api/v1/mastery/child-001",
      );
      expect((call[1] as RequestInit).method).toBe("GET");
    });

    it("throws on 404 (no rollups for child or post-cascade)", async () => {
      const fetchImpl = mockFetch([
        {
          status: 404,
          body: {
            error: { code: "NOT_FOUND", message: "no mastery for child" },
          },
        },
      ]);
      const client = new FlashLearnClient({ ...baseOpts, fetchImpl });
      await expect(client.getMastery("nonexistent")).rejects.toMatchObject({
        code: "NOT_FOUND",
        status: 404,
      });
    });
  });

  describe("deleteChild", () => {
    it("DELETEs /children/:childId", async () => {
      const fetchImpl = mockFetch([
        {
          status: 200,
          body: { data: { deleted: true, purgedRecordCount: 47 } },
        },
      ]);
      const client = new FlashLearnClient({ ...baseOpts, fetchImpl });

      const out = await client.deleteChild("child-001");
      expect(out.purgedRecordCount).toBe(47);

      const call = (fetchImpl as ReturnType<typeof vi.fn>).mock.calls[0];
      expect((call[1] as RequestInit).method).toBe("DELETE");
    });
  });

  describe("submitResults", () => {
    it("POSTs to /sessions/:id/results with cards", async () => {
      const fetchImpl = mockFetch([
        {
          status: 200,
          body: {
            data: {
              type: "session.completed",
              sessionId: "uuid-abc",
              childId: "child-001",
              completedAt: "2026-04-27T16:00:00Z",
              cards: [
                {
                  cardId: "card-1",
                  standardCode: "K.NS.1",
                  correctOnFirstAttempt: true,
                  attempts: 1,
                  latencyMs: 4200,
                },
              ],
            },
          },
        },
      ]);
      const client = new FlashLearnClient({ ...baseOpts, fetchImpl });

      const out = await client.submitResults("uuid-abc", {
        cards: [
          {
            cardId: "card-1",
            attempts: [{ isCorrect: true, latencyMs: 4200 }],
          },
        ],
      });

      expect(out.type).toBe("session.completed");
      expect(out.cards[0].standardCode).toBe("K.NS.1");

      const call = (fetchImpl as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(call[0]).toBe(
        "https://sandbox.flashlearnai.witus.online/api/v1/sessions/uuid-abc/results",
      );
    });
  });

  describe("envelope handling", () => {
    it("throws MALFORMED_RESPONSE when the envelope is missing data", async () => {
      const fetchImpl = mockFetch([{ status: 200, body: { meta: {} } }]);
      const client = new FlashLearnClient({ ...baseOpts, fetchImpl });
      await expect(client.getMastery("c")).rejects.toBeInstanceOf(
        FlashLearnError,
      );
    });
  });
});
