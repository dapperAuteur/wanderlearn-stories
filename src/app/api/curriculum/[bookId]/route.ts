import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import {
  BookMetadata,
  Hub,
  type Curriculum,
} from "@/curriculum/schemas/curriculum";

const CURRICULUM_ROOT = path.join(process.cwd(), "src", "curriculum");

export async function GET(
  _request: Request,
  context: { params: Promise<{ bookId: string }> },
) {
  const { bookId } = await context.params;

  if (!/^[a-z0-9-]+$/.test(bookId)) {
    return NextResponse.json({ error: "invalid bookId" }, { status: 400 });
  }

  const bookDir = path.join(CURRICULUM_ROOT, bookId);

  let bookRaw: unknown;
  try {
    const text = await fs.readFile(path.join(bookDir, "book.json"), "utf8");
    bookRaw = JSON.parse(text);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json({ error: "book not found" }, { status: 404 });
    }
    throw err;
  }

  const book = BookMetadata.safeParse(bookRaw);
  if (!book.success) {
    return NextResponse.json(
      { error: "book.json failed validation", issues: book.error.issues },
      { status: 400 },
    );
  }
  if (book.data.bookId !== bookId) {
    return NextResponse.json(
      {
        error: `book.json bookId "${book.data.bookId}" does not match URL "${bookId}"`,
      },
      { status: 400 },
    );
  }

  const entries = await fs.readdir(bookDir);
  const hubFiles = entries.filter((f) => /^hub-.*\.json$/.test(f)).sort();

  if (hubFiles.length === 0) {
    return NextResponse.json({ error: "no hubs for book" }, { status: 404 });
  }

  const hubs: Hub[] = [];
  for (const file of hubFiles) {
    const text = await fs.readFile(path.join(bookDir, file), "utf8");
    const parse = Hub.safeParse(JSON.parse(text));
    if (!parse.success) {
      return NextResponse.json(
        { error: `${file} failed validation`, issues: parse.error.issues },
        { status: 400 },
      );
    }
    if (parse.data.bookId !== bookId) {
      return NextResponse.json(
        { error: `${file} hub.bookId does not match URL bookId` },
        { status: 400 },
      );
    }
    hubs.push(parse.data);
  }

  const curriculum: Curriculum = { ...book.data, hubs };
  return NextResponse.json(curriculum);
}
