import { describe, expect, it } from "vitest";
import { readingOf } from "../src/reading";

const entity = (state: string) => ({ state, attributes: {} });

describe("readingOf", () => {
  it.each([
    ["21.5", 21.5],
    ["-3", -3],
    ["48", 48],
  ])("reads %s as %s", (state, reading) => {
    expect(readingOf(entity(state))).toBe(reading);
  });

  it.each(["unavailable", "unknown", "", "21.5 °C", "NaN", "Infinity"])(
    "has no reading for %j",
    (state) => {
      expect(readingOf(entity(state))).toBeUndefined();
    }
  );

  it("has no reading for a missing entity", () => {
    expect(readingOf(undefined)).toBeUndefined();
  });
});
