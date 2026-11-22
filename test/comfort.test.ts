import { describe, expect, it } from "vitest";
import {
  comfortLevel,
  feltStep,
  zoneColour,
  zoneOf,
  type Zone,
} from "../src/comfort";
import { defaultScales } from "../src/dial";

const celsius = defaultScales("°C");

describe("zoneOf", () => {
  it.each([
    [18.9, "too cold"],
    [19, "comfortable"],
    [24, "comfortable"],
    [24.1, "too warm"],
  ])("puts %s °C in the %s band", (temperature, band) => {
    expect(zoneOf({ temperature, humidity: 50 }, celsius).temperature).toBe(
      band
    );
  });

  it.each([
    [39, "too dry"],
    [40, "comfortable"],
    [60, "comfortable"],
    [61, "too humid"],
  ])("puts %s %% in the %s band", (humidity, band) => {
    expect(zoneOf({ temperature: 21, humidity }, celsius).humidity).toBe(band);
  });

  it("reads a reading outside its scale's range by the reading, not the pinned needle", () => {
    expect(zoneOf({ temperature: 40, humidity: 10 }, celsius)).toEqual({
      temperature: "too warm",
      humidity: "too dry",
    });
  });
});

// The nine zones, in the design note's order, with their felt-temperature step and words.
const zones: [Zone, number, string][] = [
  [{ temperature: "too cold", humidity: "too dry" }, -4, "Too cold and dry"],
  [{ temperature: "too cold", humidity: "comfortable" }, -3, "Too cold"],
  [
    { temperature: "too cold", humidity: "too humid" },
    -2,
    "Too cold and humid",
  ],
  [{ temperature: "comfortable", humidity: "too dry" }, -1, "Too dry"],
  [{ temperature: "comfortable", humidity: "comfortable" }, 0, "Comfortable"],
  [{ temperature: "comfortable", humidity: "too humid" }, 1, "Too humid"],
  [{ temperature: "too warm", humidity: "too dry" }, 2, "Too warm and dry"],
  [{ temperature: "too warm", humidity: "comfortable" }, 3, "Too warm"],
  [{ temperature: "too warm", humidity: "too humid" }, 4, "Too warm and humid"],
];

describe("feltStep", () => {
  it.each(zones)("gives %o step %i", (zone, step) => {
    expect(feltStep(zone)).toBe(step);
  });
});

describe("comfortLevel", () => {
  it.each(zones)("calls %o %#", (zone, _step, words) => {
    expect(comfortLevel(zone)).toBe(words);
  });
});

describe("zoneColour", () => {
  it("is the success colour in the comfort zone", () => {
    expect(
      zoneColour({ temperature: "comfortable", humidity: "comfortable" })
    ).toBe("var(--success-color)");
  });

  it.each([
    ["too dry", "comfortable", "var(--state-climate-cool-color) 30%"],
    ["too humid", "too cold", "var(--state-climate-cool-color) 55%"],
    ["comfortable", "too cold", "var(--state-climate-cool-color) 80%"],
    ["too dry", "too cold", "var(--state-climate-cool-color) 100%"],
    ["too humid", "comfortable", "var(--red-color) 30%"],
    ["too dry", "too warm", "var(--red-color) 55%"],
    ["comfortable", "too warm", "var(--red-color) 80%"],
    ["too humid", "too warm", "var(--red-color) 100%"],
  ] as const)(
    "mixes %s and %s from %s and the success colour",
    (humidity, temperature, share) => {
      expect(zoneColour({ temperature, humidity })).toBe(
        `color-mix(in oklab, ${share}, var(--success-color))`
      );
    }
  );
});
