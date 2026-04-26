import { describe, it, expect } from "vitest";
import { promises as fs } from "node:fs";
import path from "node:path";
import { BookMetadata, Hub, Curriculum } from "./curriculum";

const ALICE_DIR = path.join(process.cwd(), "src", "curriculum", "alice");

async function readJson(file: string): Promise<unknown> {
  const text = await fs.readFile(path.join(ALICE_DIR, file), "utf8");
  return JSON.parse(text);
}

describe("Alice curriculum seed", () => {
  it("book.json parses as BookMetadata", async () => {
    const raw = await readJson("book.json");
    const result = BookMetadata.safeParse(raw);
    if (!result.success) console.error(result.error.issues);
    expect(result.success).toBe(true);
  });

  it("hub-1-descent.json parses as Hub with 3 eggs", async () => {
    const raw = await readJson("hub-1-descent.json");
    const result = Hub.safeParse(raw);
    if (!result.success) console.error(result.error.issues);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.eggs).toHaveLength(3);
      expect(result.data.bookId).toBe("alice");
    }
  });

  it("hub-2-hall.json parses as Hub with 3 eggs", async () => {
    const raw = await readJson("hub-2-hall.json");
    const result = Hub.safeParse(raw);
    if (!result.success) console.error(result.error.issues);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.eggs).toHaveLength(3);
      expect(result.data.bookId).toBe("alice");
    }
  });

  it("composes into a Curriculum with both hubs and 6 total eggs", async () => {
    const book = BookMetadata.parse(await readJson("book.json"));
    const hub1 = Hub.parse(await readJson("hub-1-descent.json"));
    const hub2 = Hub.parse(await readJson("hub-2-hall.json"));
    const composite = Curriculum.parse({ ...book, hubs: [hub1, hub2] });
    expect(composite.hubs).toHaveLength(2);
    const totalEggs = composite.hubs.reduce(
      (n, h) => n + h.eggs.length,
      0,
    );
    expect(totalEggs).toBe(6);
  });

  it("every egg maps to at least one Indiana K standard", async () => {
    const hub1 = Hub.parse(await readJson("hub-1-descent.json"));
    const hub2 = Hub.parse(await readJson("hub-2-hall.json"));
    for (const egg of [...hub1.eggs, ...hub2.eggs]) {
      expect(egg.standards.length).toBeGreaterThan(0);
      for (const std of egg.standards) {
        expect(std.framework).toBe("indiana-k");
        expect(std.code).toMatch(/^K\./);
      }
    }
  });

  it("every interaction is Tier 1 (gaze + listen) at MVP", async () => {
    const hub1 = Hub.parse(await readJson("hub-1-descent.json"));
    const hub2 = Hub.parse(await readJson("hub-2-hall.json"));
    for (const egg of [...hub1.eggs, ...hub2.eggs]) {
      expect(egg.interactions.length).toBeGreaterThan(0);
      for (const interaction of egg.interactions) {
        expect(interaction.tier).toBe(1);
      }
    }
  });
});
