import { beforeEach, describe, expect, it } from "vitest";
import { useColumnStore } from "./columnStore";

describe("columnStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useColumnStore.setState({ visibility: {}, order: {}, sorting: {} });
  });

  it("sets visibility per tableKey without touching others", () => {
    useColumnStore.getState().setColumnVisibility("segments", { name: true, id: false });
    useColumnStore.getState().setColumnVisibility("policies", { rule: true });
    const s = useColumnStore.getState();
    expect(s.visibility.segments).toEqual({ name: true, id: false });
    expect(s.visibility.policies).toEqual({ rule: true });
  });

  it("sets order per tableKey", () => {
    useColumnStore.getState().setColumnOrder("segments", ["name", "id"]);
    expect(useColumnStore.getState().order.segments).toEqual(["name", "id"]);
  });

  it("sets sorting per tableKey", () => {
    useColumnStore.getState().setColumnSorting("segments", [{ id: "name", desc: true }]);
    expect(useColumnStore.getState().sorting.segments).toEqual([{ id: "name", desc: true }]);
  });

  it("overwrites existing tableKey entry instead of merging", () => {
    useColumnStore.getState().setColumnVisibility("segments", { a: true, b: true });
    useColumnStore.getState().setColumnVisibility("segments", { a: false });
    expect(useColumnStore.getState().visibility.segments).toEqual({ a: false });
  });

  it("persists to localStorage under painscaler-columns", () => {
    useColumnStore.getState().setColumnOrder("segments", ["x", "y"]);
    const raw = localStorage.getItem("painscaler-columns");
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.state.order.segments).toEqual(["x", "y"]);
  });
});
