const DEBOUNCE_SECONDS = 10;
const BUILD_ESTIMATE_SECONDS = 60;

export type SaveState =
  | { kind: "saved" }
  | { kind: "editing" }
  | { kind: "pendingPublish"; secondsRemaining: number }
  | { kind: "publishing" }
  | { kind: "building"; secondsRemaining: number }
  | { kind: "liveEstimated" }
  | { kind: "error"; message: string };

export type Listener = (state: SaveState) => void;

export interface SaveStateMachine {
  getState(): SaveState;
  subscribe(listener: Listener): () => void;
  markDirty(): void;
  saveClicked(): void;
  publishNow(): void;
  commitOk(): void;
  commitFail(error: unknown): void;
  retry(): void;
}

export function createSaveStateMachine(): SaveStateMachine {
  let state: SaveState = { kind: "saved" };
  const listeners = new Set<Listener>();
  let countdownInterval: ReturnType<typeof setInterval> | null = null;

  const setState = (next: SaveState) => {
    state = next;
    listeners.forEach((l) => l(state));
  };

  const clearCountdown = () => {
    if (countdownInterval !== null) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
  };

  function startCountdown(
    tickState: (remaining: number) => SaveState,
    initialSeconds: number,
    terminal: SaveState,
  ) {
    clearCountdown();
    setState(tickState(initialSeconds));
    countdownInterval = setInterval(() => {
      const next = (state as { secondsRemaining: number }).secondsRemaining - 1;
      if (next <= 0) {
        clearCountdown();
        setState(terminal);
      } else {
        setState(tickState(next));
      }
    }, 1000);
  }

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    markDirty() {
      clearCountdown();
      setState({ kind: "editing" });
    },
    saveClicked() {
      startCountdown(
        (s) => ({ kind: "pendingPublish", secondsRemaining: s }),
        DEBOUNCE_SECONDS,
        { kind: "publishing" },
      );
    },
    publishNow() {
      clearCountdown();
      setState({ kind: "publishing" });
    },
    commitOk() {
      startCountdown(
        (s) => ({ kind: "building", secondsRemaining: s }),
        BUILD_ESTIMATE_SECONDS,
        { kind: "liveEstimated" },
      );
    },
    commitFail(error) {
      clearCountdown();
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : String(error),
      });
    },
    retry() {
      setState({ kind: "publishing" });
    },
  };
}
