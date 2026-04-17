import { beforeEach, describe, expect, it } from "vitest";
import { usePaletteStore } from "./paletteStore";

describe("paletteStore", () => {
  beforeEach(() => {
    usePaletteStore.setState({ isOpen: false, query: "" }, false);
  });

  it("defaults to closed with empty query", () => {
    const s = usePaletteStore.getState();
    expect(s.isOpen).toBe(false);
    expect(s.query).toBe("");
  });

  it("open sets isOpen true", () => {
    usePaletteStore.getState().open();
    expect(usePaletteStore.getState().isOpen).toBe(true);
  });

  it("close clears query and isOpen", () => {
    usePaletteStore.setState({ isOpen: true, query: "seg" }, false);
    usePaletteStore.getState().close();
    const s = usePaletteStore.getState();
    expect(s.isOpen).toBe(false);
    expect(s.query).toBe("");
  });

  it("toggle flips and clears query only on close", () => {
    usePaletteStore.getState().setQuery("abc");
    usePaletteStore.getState().toggle();
    expect(usePaletteStore.getState().isOpen).toBe(true);
    expect(usePaletteStore.getState().query).toBe("abc");
    usePaletteStore.getState().toggle();
    expect(usePaletteStore.getState().isOpen).toBe(false);
    expect(usePaletteStore.getState().query).toBe("");
  });
});
