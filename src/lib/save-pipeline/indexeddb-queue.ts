const DB_NAME = "keystatic-save-queue";
const STORE = "payloads";
const VERSION = 1;

export interface QueuedPayload {
  slug: string;
  fields: Record<string, unknown>;
  files: Record<string, Blob>;
  enqueuedAt: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function getDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = globalThis.indexedDB.open(DB_NAME, VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: "slug" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

function reqPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => Promise<T>
): Promise<T> {
  const db = await getDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const store = tx.objectStore(STORE);
    fn(store).then(resolve, reject);
    tx.onerror = () => reject(tx.error);
  });
}

export const saveQueue = {
  async enqueue(payload: QueuedPayload): Promise<void> {
    await withStore("readwrite", async (store) => {
      const existing = await reqPromise<QueuedPayload | undefined>(store.get(payload.slug));
      const merged: QueuedPayload = existing
        ? {
            slug: payload.slug,
            fields: { ...existing.fields, ...payload.fields },
            files: { ...existing.files, ...payload.files },
            enqueuedAt: Math.min(existing.enqueuedAt, payload.enqueuedAt),
          }
        : payload;
      await reqPromise(store.put(merged));
    });
  },

  peekAll(): Promise<QueuedPayload[]> {
    return withStore("readonly", (store) => reqPromise<QueuedPayload[]>(store.getAll()));
  },

  clear(slug: string): Promise<void> {
    return withStore("readwrite", (store) => reqPromise(store.delete(slug)));
  },

  clearAll(): Promise<void> {
    return withStore("readwrite", (store) => reqPromise(store.clear()));
  },
};
