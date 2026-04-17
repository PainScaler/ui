import type { ReactNode } from "react";
import { Label, LabelGroup, Truncate } from "@patternfly/react-core";

export type Renderer = (value: unknown) => ReactNode;
export type TextRenderer = (value: unknown) => string;

export const defaultRenderer: Renderer = (v) => (
  <Truncate content={String(v)} />
);

/** Renders a boolean as a colored Yes/No label. */
export const boolRenderer: Renderer = (v) => (
  <Label color={v ? "green" : "red"} isCompact>
    {v ? "Yes" : "No"}
  </Label>
);

/**
 * Renders a string array as a group of labels.
 * Falls back to a dash when the array is empty or the value is not an array.
 */
export const labelArrayRenderer: Renderer = (v) => {
  if (!Array.isArray(v) || v.length === 0) return "-";
  return (
    <LabelGroup>
      {(v as string[]).map((item) => (
        <Label key={`label-${item}`} isCompact>
          {item}
        </Label>
      ))}
    </LabelGroup>
  );
};

/** Renders a string array as a comma-separated string. */
export const joinRenderer: Renderer = (v) =>
  Array.isArray(v) ? (v as string[]).join(", ") || "-" : String(v ?? "-");

/** Renders a Unix timestamp (seconds, as string or number) as a locale date string. */
export const timestampRenderer: Renderer = (v) => {
  const n = Number(v);
  if (v && isNaN(n) && typeof v === "string") {
    return new Date(v).toLocaleString();
  }
  if (!v || isNaN(n) || n === 0) return "-";
  return new Date(n * 1000).toLocaleString();
};

const defaultToText: TextRenderer = (v) =>
  v === null || v === undefined ? "" : String(v);

const boolToText: TextRenderer = (v) => (v ? "Yes" : "No");

const joinToText: TextRenderer = (v) => {
  if (!Array.isArray(v) || v.length === 0) return "";
  return (v as unknown[]).map((x) => String(x ?? "")).join(", ");
};

const timestampToText: TextRenderer = (v) => {
  const n = Number(v);
  if (v && isNaN(n) && typeof v === "string") return new Date(v).toLocaleString();
  if (!v || isNaN(n) || n === 0) return "";
  return new Date(n * 1000).toLocaleString();
};

const textRenderers = new Map<Renderer, TextRenderer>([
  [defaultRenderer, defaultToText],
  [boolRenderer, boolToText],
  [labelArrayRenderer, joinToText],
  [joinRenderer, joinToText],
  [timestampRenderer, timestampToText],
]);

export function textForRenderer(r: Renderer): TextRenderer {
  return textRenderers.get(r) ?? defaultToText;
}

const sortingFns = new Map<Renderer, string>([
  [timestampRenderer, "alphanumeric"],
  [boolRenderer, "basic"],
]);

export function sortingFnForRenderer(r: Renderer): string {
  return sortingFns.get(r) ?? "alphanumeric";
}
