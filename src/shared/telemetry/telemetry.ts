import { PostTelemetry } from "@/shared/api/api.gen";
import { logging } from "@/shared/api/models.gen";

const FLUSH_INTERVAL_MS = 30_000;
const MAX_BUFFER = 100;

let buffer: logging.TelemetryEvent[] = [];
let timer: ReturnType<typeof setInterval> | null = null;
let started = false;

type TrackInput = {
  type: "page_view" | "error";
  route?: string;
  error_message?: string;
  error_stack?: string;
};

function makeEvent(input: TrackInput): logging.TelemetryEvent {
  return logging.TelemetryEvent.createFrom({
    type: input.type,
    ts: new Date().toISOString(),
    route: input.route,
    error_message: input.error_message,
    error_stack: input.error_stack,
  });
}

export function track(input: TrackInput): void {
  buffer.push(makeEvent(input));
  if (buffer.length >= MAX_BUFFER) {
    void flush();
  }
}

export async function flush(): Promise<void> {
  if (buffer.length === 0) return;
  const events = buffer;
  buffer = [];
  const batch = logging.TelemetryBatch.createFrom({ events });
  try {
    await PostTelemetry(batch);
  } catch {
    // drop on failure; do not loop
  }
}

function flushBeacon(): void {
  if (buffer.length === 0) return;
  const events = buffer;
  buffer = [];
  const batch = { events };
  try {
    const blob = new Blob([JSON.stringify(batch)], {
      type: "application/json",
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/v1/telemetry", blob);
      return;
    }
  } catch {
    // ignore
  }
  // fallback: best-effort fetch with keepalive
  try {
    void fetch("/api/v1/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(batch),
      keepalive: true,
    });
  } catch {
    // ignore
  }
}

export function startTelemetry(): void {
  if (started || typeof window === "undefined") return;
  started = true;
  timer = setInterval(() => {
    void flush();
  }, FLUSH_INTERVAL_MS);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flushBeacon();
    }
  });
  window.addEventListener("pagehide", () => {
    flushBeacon();
  });
}

export function stopTelemetry(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  started = false;
}
