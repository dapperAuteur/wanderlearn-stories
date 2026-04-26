// Typed HTTP client for FlashLearn-AI's ecosystem API.
// Architecture B per plans/17-flashlearn-ai-feedback.md: consumer hosts
// the play UI; raw attempts POST to FL-AI; webhook fires back as audit.
//
// The client takes `fetch` as a dependency so tests can inject a mock.
// In production, the route handler that uses it passes the global fetch.

import type {
  CreateSessionRequest,
  CreateSessionResponse,
  DeleteChildResponse,
  FlashLearnEnvelope,
  FlashLearnErrorBody,
  MasteryResponse,
  SessionCompletedPayload,
  SubmitResultsRequest,
} from "./types";
import { FlashLearnError } from "./types";

export { FlashLearnError } from "./types";

export interface FlashLearnClientOptions {
  /** e.g. https://flashlearnai.witus.online/api/v1 (no trailing slash). */
  baseUrl: string;
  /** fl_eco_* ecosystem partner key. */
  apiKey: string;
  /** Optional fetch override for tests. Defaults to globalThis.fetch. */
  fetchImpl?: typeof fetch;
}

export class FlashLearnClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly fetchImpl: typeof fetch;

  constructor(opts: FlashLearnClientOptions) {
    this.baseUrl = opts.baseUrl.replace(/\/$/, "");
    this.apiKey = opts.apiKey;
    this.fetchImpl = opts.fetchImpl ?? globalThis.fetch.bind(globalThis);
  }

  async createSession(
    req: CreateSessionRequest,
  ): Promise<CreateSessionResponse> {
    return this.post<CreateSessionResponse>("/sessions", req);
  }

  async submitResults(
    sessionId: string,
    req: SubmitResultsRequest,
  ): Promise<SessionCompletedPayload> {
    return this.post<SessionCompletedPayload>(
      `/sessions/${encodeURIComponent(sessionId)}/results`,
      req,
    );
  }

  async getMastery(childId: string): Promise<MasteryResponse> {
    return this.get<MasteryResponse>(
      `/mastery/${encodeURIComponent(childId)}`,
    );
  }

  async deleteChild(childId: string): Promise<DeleteChildResponse> {
    return this.del<DeleteChildResponse>(
      `/children/${encodeURIComponent(childId)}`,
    );
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    return this.send<T>("POST", path, body);
  }

  private async get<T>(path: string): Promise<T> {
    return this.send<T>("GET", path);
  }

  private async del<T>(path: string): Promise<T> {
    return this.send<T>("DELETE", path);
  }

  private async send<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const res = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    let parsed: unknown;
    try {
      parsed = text.length > 0 ? JSON.parse(text) : {};
    } catch {
      throw new FlashLearnError(
        "MALFORMED_RESPONSE",
        `FlashLearn-AI returned non-JSON body (status ${res.status})`,
        res.status,
      );
    }

    if (!res.ok) {
      const errorBody = parsed as Partial<FlashLearnErrorBody>;
      const code = errorBody?.error?.code ?? "UNKNOWN_ERROR";
      const message =
        errorBody?.error?.message ?? `Request failed with status ${res.status}`;
      throw new FlashLearnError(code, message, res.status, errorBody?.error?.details);
    }

    const envelope = parsed as Partial<FlashLearnEnvelope<T>>;
    if (!envelope || typeof envelope !== "object" || !("data" in envelope)) {
      throw new FlashLearnError(
        "MALFORMED_RESPONSE",
        "FlashLearn-AI envelope missing `data` field",
        res.status,
      );
    }
    return envelope.data as T;
  }
}

let cached: FlashLearnClient | null = null;

/**
 * Lazy-init helper for server-side use. Reads FLASHLEARN_API_BASE +
 * FLASHLEARN_API_KEY from process.env. Throws clearly if either is
 * missing — better than letting a 401 escape from a deep-nested call.
 */
export function getFlashLearnClient(): FlashLearnClient {
  if (cached) return cached;
  const baseUrl = process.env.FLASHLEARN_API_BASE;
  const apiKey = process.env.FLASHLEARN_API_KEY;
  if (!baseUrl || !apiKey) {
    throw new Error(
      "FlashLearn-AI: FLASHLEARN_API_BASE and FLASHLEARN_API_KEY must be set. " +
        "Mint a fl_eco_* key at /developer/keys on the target environment, " +
        "then `vercel env add` both values.",
    );
  }
  cached = new FlashLearnClient({ baseUrl, apiKey });
  return cached;
}
