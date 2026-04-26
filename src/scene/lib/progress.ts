// Local-only progress tracking via IndexedDB.
//
// Pre-VPC (the anonymous demo path), nothing about the visit leaves
// the device. Plan 07 §"Data minimization" rules out server-side
// progress for unconsented children. After VPC lands (Phase 3), a
// separate flush path will sync this to /api/progress.

const DB_NAME = "wanderlearn-stories";
const STORE = "progress";
const VERSION = 1;

interface ProgressRecord {
  eggId: string;
  completedAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "eggId" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function markEggComplete(eggId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const record: ProgressRecord = { eggId, completedAt: Date.now() };
    tx.objectStore(STORE).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCompletedEggs(): Promise<string[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () =>
      resolve((req.result as ProgressRecord[]).map((r) => r.eggId));
    req.onerror = () => reject(req.error);
  });
}

export async function clearProgress(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
