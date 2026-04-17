import { describe, expect, it } from "vitest";
import {
  DEFAULT_FORM,
  validateAccessTarget,
  validateClientContext,
  type FormState,
} from "./types";

const form = (overrides: Partial<FormState> = {}): FormState => ({
  ...DEFAULT_FORM,
  ...overrides,
});

describe("validateAccessTarget", () => {
  it("errors when neither fqdn nor segmentID set", () => {
    expect(validateAccessTarget(form())).toEqual([
      "Select a segment or enter an FQDN.",
    ]);
  });

  it("errors when both fqdn and segmentID set", () => {
    expect(
      validateAccessTarget(form({ fqdn: "example.com", segmentID: "s1" })),
    ).toEqual(["Provide either FQDN or segment, not both."]);
  });

  it("passes with only fqdn", () => {
    expect(validateAccessTarget(form({ fqdn: "example.com" }))).toEqual([]);
  });

  it("passes with only segmentID", () => {
    expect(validateAccessTarget(form({ segmentID: "s1" }))).toEqual([]);
  });
});

describe("validateClientContext", () => {
  it("errors without platform", () => {
    expect(validateClientContext(form())).toEqual(["Pick a platform."]);
  });

  it("passes with platform", () => {
    expect(validateClientContext(form({ platform: "Windows" }))).toEqual([]);
  });
});
