// formatCell coerces an unknown cell value to a string without producing
// "[object Object]" for plain objects or arrays.
export function formatCell(v: unknown, fallback = ""): string {
  if (v === null || v === undefined) return fallback;
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean" || typeof v === "bigint") {
    return String(v);
  }
  try {
    return JSON.stringify(v);
  } catch {
    return fallback;
  }
}
