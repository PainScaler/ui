import { describe, expect, it } from "vitest";
import { filterAndRank, scoreAction } from "./scorer";
import type { PaletteAction } from "./types";

const make = (partial: Partial<PaletteAction>): PaletteAction => ({
  id: "x",
  label: "Segments",
  group: "Pages",
  onSelect: () => {},
  ...partial,
});

describe("scoreAction", () => {
  it("returns 0 for empty query", () => {
    expect(scoreAction(make({}), "")).toBe(0);
  });

  it("prefix match beats substring match", () => {
    const prefix = scoreAction(make({ label: "Segments" }), "seg");
    const sub = scoreAction(make({ label: "App Segments" }), "seg");
    expect(prefix).toBeGreaterThan(sub);
  });

  it("keyword match contributes", () => {
    const s = scoreAction(
      make({ label: "Refresh", keywords: ["reload"] }),
      "reload",
    );
    expect(s).toBeGreaterThan(0);
  });

  it("description match contributes but less than label", () => {
    const desc = scoreAction(make({ label: "Refresh", description: "sync data" }), "sync");
    const label = scoreAction(make({ label: "Sync" }), "sync");
    expect(label).toBeGreaterThan(desc);
  });
});

describe("filterAndRank", () => {
  it("returns all when query empty", () => {
    const list = [make({ id: "a" }), make({ id: "b" })];
    expect(filterAndRank(list, "")).toHaveLength(2);
  });

  it("drops non-matches and sorts by score", () => {
    const list = [
      make({ id: "sub", label: "App Segments" }),
      make({ id: "pref", label: "Segments" }),
      make({ id: "miss", label: "Policies" }),
    ];
    const out = filterAndRank(list, "seg");
    expect(out.map((a) => a.id)).toEqual(["pref", "sub"]);
  });
});
