import type { Column } from "./types";

const escapeField = (s: string): string => {
  if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

export function buildCsv(
  columns: Column[],
  rows: Record<string, unknown>[],
): string {
  const header = columns.map((c) => escapeField(c.label)).join(",");
  const body = rows
    .map((row) =>
      columns
        .map((c) => {
          const raw = row[c.key];
          const text = c.toText ? c.toText(raw) : String(raw ?? "");
          return escapeField(text);
        })
        .join(","),
    )
    .join("\n");
  return `${header}\n${body}`;
}

export function downloadCsv(filename: string, csv: string): void {
  const bom = "\uFEFF";
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function csvFilename(tableKey: string | undefined): string {
  const base = tableKey ?? "export";
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${base}-${y}-${m}-${d}.csv`;
}
