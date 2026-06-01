// Types matching FlashLearn-AI's ecosystem API surface.
// Source: plans/flashlearnai/01-status-report-for-wanderlearn-stories.md
//
// These follow FL-AI's response envelope convention: payloads are wrapped
// in `{ data, meta }`. Errors come back with `{ error: { code, message,
// details? } }` instead — we surface those as a typed FlashLearnError.

export type AgeBand = "4-7" | "8-12" | "13-18";

export interface Standard {
  framework: "indiana-k";
  code: string;
}

export interface SourceContext {
  consumer: "wanderlearn-stories";
  bookId: string;
  hubId: string;
  /** ISO-8601 timestamp of hub completion. */
  completedAt: string;
}

export interface CreateSessionRequest {
  /** Consumer-issued; opaque to FL-AI. Must be stable per-child. */
  childId: string;
  ageBand: AgeBand;
  standards: Standard[];
  sourceContext: SourceContext;
  /** IANA timezone (e.g., "America/Indiana/Indianapolis"). Defaults UTC. */
  tz?: string;
}

export interface CreateSessionResponse {
  sessionId: string;
  /** ISO-8601: next local midnight in the request's tz, or UTC. */
  scheduledFor: string;
  estimatedCardCount: number;
}

export interface CardAttempt {
  isCorrect: boolean;
  latencyMs: number;
  /** ISO-8601. */
  attemptedAt?: string;
  /** 1–5 if the consumer's UI captures it. */
  confidenceRating?: number;
}

export interface CardResult {
  /** ObjectId hex string from the FL-AI deck. */
  cardId: string;
  attempts: CardAttempt[];
}

export interface SubmitResultsRequest {
  cards: CardResult[];
}

export interface SessionCompletedCard {
  cardId: string;
  standardCode: string;
  correctOnFirstAttempt: boolean;
  attempts: number;
  latencyMs: number;
}

/**
 * The shape returned by `POST /sessions/:id/results` AND fired by the
 * `session.completed` webhook. Same body — we use the webhook as audit
 * confirmation (see plans/17-flashlearn-ai-feedback.md §1).
 */
export interface SessionCompletedPayload {
  type: "session.completed";
  sessionId: string;
  childId: string;
  /** ISO-8601. */
  completedAt: string;
  cards: SessionCompletedCard[];
}

export type MasteryState = "exposed" | "practiced" | "demonstrated";

export interface MasteryStandard extends Standard {
  state: MasteryState;
  /** 0–1, fraction first-attempt correct over the rolling window. */
  firstAttemptCorrectRate: number;
  attemptCount: number;
  /** ISO-8601 or null if no attempts yet. */
  lastAttemptAt: string | null;
}

export interface MasteryResponse {
  childId: string;
  standards: MasteryStandard[];
}

export interface DeleteChildResponse {
  deleted: true;
  purgedRecordCount: number;
}

export interface FlashLearnEnvelope<T> {
  data: T;
  meta?: { requestId?: string };
}

export interface FlashLearnErrorBody {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export class FlashLearnError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    status: number,
    details?: Record<string, unknown>,
  ) {
    super(`[${code}] ${message}`);
    this.name = "FlashLearnError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}
