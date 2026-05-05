import { saveQueue, type QueuedPayload } from "./indexeddb-queue";
import { createSaveStateMachine, type SaveStateMachine } from "./state-machine";

const DEBOUNCE_MS = 10_000;

export interface StorageAdapter {
  commit(payload: QueuedPayload): Promise<unknown>;
}

export interface BatchedStorage {
  commit(payload: Omit<QueuedPayload, "enqueuedAt">): Promise<void>;
  flushNow(): Promise<void>;
  attachUnloadFlush(target: Window): () => void;
  stateMachine: SaveStateMachine;
}

export function createBatchedStorage(adapter: StorageAdapter): BatchedStorage {
  const stateMachine = createSaveStateMachine();
  let timer: ReturnType<typeof setTimeout> | null = null;

  const cancelTimer = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const flush = async () => {
    cancelTimer();
    const queued = await saveQueue.peekAll();
    if (queued.length === 0) {
      return;
    }
    stateMachine.publishNow();
    try {
      for (const payload of queued) {
        await adapter.commit(payload);
        await saveQueue.clear(payload.slug);
      }
      stateMachine.commitOk();
    } catch (error) {
      stateMachine.commitFail(error);
      throw error;
    }
  };

  const scheduleFlush = () => {
    cancelTimer();
    timer = setTimeout(() => {
      flush().catch((err) => console.error("storage flush failed", err));
    }, DEBOUNCE_MS);
  };

  return {
    async commit(payload) {
      await saveQueue.enqueue({ ...payload, enqueuedAt: Date.now() });
      stateMachine.saveClicked();
      scheduleFlush();
    },
    flushNow: flush,
    attachUnloadFlush(target) {
      const handler = () => {
        // Best effort — the browser may not wait for promises here,
        // but the IndexedDB queue persists, so the recovery banner
        // will surface on next load if this fires too late.
        flush().catch(() => undefined);
      };
      const visibilityHandler = () => {
        if (target.document.visibilityState === "hidden") handler();
      };
      target.addEventListener("beforeunload", handler);
      target.addEventListener("visibilitychange", visibilityHandler);
      return () => {
        target.removeEventListener("beforeunload", handler);
        target.removeEventListener("visibilitychange", visibilityHandler);
      };
    },
    stateMachine,
  };
}
