import { beforeEach, describe, expect, it } from "vitest";
import { useUIStore } from "./uiStore";

describe("uiStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useUIStore.setState({ colorMode: "system" }, false);
  });

  it("defaults to system colorMode", () => {
    expect(useUIStore.getState().colorMode).toBe("system");
  });

  it("setColorMode updates state", () => {
    useUIStore.getState().setColorMode("dark");
    expect(useUIStore.getState().colorMode).toBe("dark");
  });

  it("persists to localStorage under painscaler-ui", () => {
    useUIStore.getState().setColorMode("light");
    const parsed = JSON.parse(localStorage.getItem("painscaler-ui")!);
    expect(parsed.state.colorMode).toBe("light");
  });
});
