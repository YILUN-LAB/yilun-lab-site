import { useCallback, useEffect, useRef, useState } from "react";

type State = "idle" | "ready" | "publishing" | "published" | "error";
type ErrorKind = "merge-conflict" | "network" | "other";

interface Options {
  pollInterval?: number; // ms; 0 = poll once and stop
}

/**
 * Drives the Publish button. Polls `/api/publish?dry-run=1` to check
 * whether `staging` is ahead of `main`, and exposes a `publish()`
 * action that posts to the same endpoint without the dry-run flag.
 *
 * State machine: idle → ready (via polling) → publishing → published
 * → idle (auto, after 3s). Errors land in `error` and the user can
 * retry from there.
 */
export function usePublishState({ pollInterval = 30_000 }: Options = {}) {
  const [state, setState] = useState<State>("idle");
  const [count, setCount] = useState(0);
  const [errorKind, setErrorKind] = useState<ErrorKind | null>(null);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/publish?dry-run=1", { method: "POST" });
      const body = await res.json();
      if (!mounted.current) return;
      if (body.ok && body.count > 0) {
        setState("ready");
        setCount(body.count);
      } else if (body.ok && body.count === 0) {
        setState("idle");
        setCount(0);
      }
    } catch {
      // Swallow; will retry on next poll.
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    refresh();
    if (pollInterval > 0) {
      const id = setInterval(refresh, pollInterval);
      return () => {
        mounted.current = false;
        clearInterval(id);
      };
    }
    return () => {
      mounted.current = false;
    };
  }, [refresh, pollInterval]);

  const publish = useCallback(async () => {
    setState("publishing");
    setErrorKind(null);
    try {
      const res = await fetch("/api/publish", { method: "POST" });
      const body = await res.json();
      if (!mounted.current) return;
      if (body.ok) {
        setState("published");
        setCount(0);
        setTimeout(() => {
          if (mounted.current) setState("idle");
        }, 3000);
      } else {
        setState("error");
        setErrorKind(
          body.error === "merge-conflict" ? "merge-conflict" : "other"
        );
      }
    } catch {
      if (!mounted.current) return;
      setState("error");
      setErrorKind("network");
    }
  }, []);

  return { state, count, errorKind, publish, refresh };
}
