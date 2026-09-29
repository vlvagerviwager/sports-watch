import { useEffect } from "react";

interface WakeLockLike {
  release: () => Promise<void>;
}

interface WakeLockManager {
  request: (type: "screen") => Promise<WakeLockLike>;
}

function getWakeLock(): WakeLockManager | undefined {
  const nav = navigator as unknown as { wakeLock?: WakeLockManager };
  return typeof nav.wakeLock?.request === "function" ? nav.wakeLock : undefined;
}

export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const wakeLock = getWakeLock();
    if (!wakeLock) return;

    let lock: WakeLockLike | null = null;
    let disposed = false;

    const request = async () => {
      try {
        const next = await wakeLock.request("screen");
        if (disposed) {
          void next.release();
          return;
        }
        lock = next;
      } catch {
        // Permission denied or unsupported; the timer still works without it.
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && lock === null) {
        void request();
      }
    };

    void request();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (lock) {
        void lock.release().catch(() => undefined);
        lock = null;
      }
    };
  }, [active]);
}
