import { describe, expect, it } from "vitest";
import { defined } from "./defined";
import {
  APEX,
  BASE_Y,
  HUMIDITY_PIVOT,
  RADIUS,
  TEMPERATURE_PIVOT,
  defaultScales,
  layoutDial,
  scaleAngle,
  type Point,
} from "../src/dial";

const celsius = defaultScales("°C");
const distance = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/** Whether p lies inside a convex polygon, whichever way round its corners run. */
function inside(p: Point, polygon: readonly Point[]): boolean {
  const sides = polygon.map((a, i) => {
    const b = polygon[(i + 1) % polygon.length];
    return Math.sign(
      (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])
    );
  });
  return sides.every((s) => s >= 0) || sides.every((s) => s <= 0);
}

/** Whether c lies on the line through a and b. */
function collinear(a: Point, b: Point, c: Point): boolean {
  const cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  return Math.abs(cross) / distance(a, b) < 1e-6;
}

describe("defaultScales", () => {
  it("uses 10–35 °C with a comfortable band of 19–24 °C", () => {
    expect(celsius.temperature).toEqual({
      min: 10,
      max: 35,
      comfortable_min: 19,
      comfortable_max: 24,
    });
  });

  it("uses the same range in °F for a °F sensor", () => {
    expect(defaultScales("°F").temperature).toEqual({
      min: 50,
      max: 95,
      comfortable_min: 66,
      comfortable_max: 75,
    });
  });

  it("uses 20–100 % with a comfortable band of 40–60 %", () => {
    expect(celsius.humidity).toEqual({
      min: 20,
      max: 100,
      comfortable_min: 40,
      comfortable_max: 60,
    });
  });
});

describe("scaleAngle", () => {
  const scale = celsius.temperature;

  it("runs from 0° at the scale's minimum to 60° at its maximum", () => {
    expect(scaleAngle(10, scale)).toBe(0);
    expect(scaleAngle(22.5, scale)).toBe(30);
    expect(scaleAngle(35, scale)).toBe(60);
  });

  it("pins a reading outside the range at the scale's end", () => {
    expect(scaleAngle(-5, scale)).toBe(0);
    expect(scaleAngle(41, scale)).toBe(60);
  });
});

describe("the pointed arch", () => {
  it("has its pivots on the base, a radius apart, either side of the middle", () => {
    expect(TEMPERATURE_PIVOT[1]).toBe(BASE_Y);
    expect(HUMIDITY_PIVOT[1]).toBe(BASE_Y);
    expect(distance(TEMPERATURE_PIVOT, HUMIDITY_PIVOT)).toBeCloseTo(RADIUS);
    expect(TEMPERATURE_PIVOT[0] + HUMIDITY_PIVOT[0]).toBe(320);
    expect(TEMPERATURE_PIVOT[0]).toBeLessThan(HUMIDITY_PIVOT[0]);
  });

  it("has its apex a radius from both pivots", () => {
    expect(distance(APEX, TEMPERATURE_PIVOT)).toBeCloseTo(RADIUS);
    expect(distance(APEX, HUMIDITY_PIVOT)).toBeCloseTo(RADIUS);
    expect(APEX[0]).toBeCloseTo(160);
  });
});

describe("layoutDial", () => {
  it("puts each marker on its scale, a radius from its needle's pivot", () => {
    const dial = layoutDial({ temperature: 23, humidity: 70 }, celsius);
    expect(
      distance(defined(dial.temperatureNeedle).marker, TEMPERATURE_PIVOT)
    ).toBeCloseTo(RADIUS);
    expect(
      distance(defined(dial.humidityNeedle).marker, HUMIDITY_PIVOT)
    ).toBeCloseTo(RADIUS);
    expect(defined(dial.temperatureNeedle).pivot).toEqual(TEMPERATURE_PIVOT);
    expect(defined(dial.humidityNeedle).pivot).toEqual(HUMIDITY_PIVOT);
  });

  it("puts the temperature scale on the right and the humidity scale on the left", () => {
    const dial = layoutDial({ temperature: 22.5, humidity: 60 }, celsius);
    expect(defined(dial.temperatureNeedle).marker[0]).toBeGreaterThan(160);
    expect(defined(dial.humidityNeedle).marker[0]).toBeLessThan(160);
  });

  it("runs each scale from the opposite pivot to the apex", () => {
    const lowest = layoutDial({ temperature: 10, humidity: 20 }, celsius);
    expect(defined(lowest.temperatureNeedle).marker[0]).toBeCloseTo(
      HUMIDITY_PIVOT[0]
    );
    expect(defined(lowest.temperatureNeedle).marker[1]).toBeCloseTo(BASE_Y);
    expect(defined(lowest.humidityNeedle).marker[0]).toBeCloseTo(
      TEMPERATURE_PIVOT[0]
    );
    const highest = layoutDial({ temperature: 35, humidity: 100 }, celsius);
    expect(defined(highest.temperatureNeedle).marker[0]).toBeCloseTo(APEX[0]);
    expect(defined(highest.temperatureNeedle).marker[1]).toBeCloseTo(APEX[1]);
    expect(defined(highest.humidityNeedle).marker[1]).toBeCloseTo(APEX[1]);
  });

  it("puts the crossing on both needles", () => {
    const dial = layoutDial({ temperature: 26.3, humidity: 68 }, celsius);
    const { temperatureNeedle: t, humidityNeedle: h, crossing } = dial;
    expect(
      collinear(defined(t).pivot, defined(t).marker, defined(crossing))
    ).toBe(true);
    expect(
      collinear(defined(h).pivot, defined(h).marker, defined(crossing))
    ).toBe(true);
  });

  it("crosses in the middle when both readings are as far up their scales", () => {
    const dial = layoutDial({ temperature: 22.5, humidity: 60 }, celsius);
    expect(defined(dial.crossing)[0]).toBeCloseTo(160);
  });

  it("crosses inside the comfort zone when the air is comfortable", () => {
    const dial = layoutDial({ temperature: 21.5, humidity: 48 }, celsius);
    expect(inside(defined(dial.crossing), dial.comfortZone)).toBe(true);
  });

  it.each([
    [26.3, 68],
    [17, 50],
    [21.5, 30],
    [21.5, 75],
  ])("crosses outside the comfort zone at %s °C and %s %%", (t, h) => {
    const dial = layoutDial({ temperature: t, humidity: h }, celsius);
    expect(inside(defined(dial.crossing), dial.comfortZone)).toBe(false);
  });

  it("puts the crossing in the middle of the base when both readings are at their minimums", () => {
    const dial = layoutDial({ temperature: 9, humidity: 18 }, celsius);
    expect(dial.crossing).toEqual([160, BASE_Y]);
  });

  it("builds the comfort zone from the four band lines, inside the arch", () => {
    const dial = layoutDial({ temperature: 21.5, humidity: 48 }, celsius);
    expect(dial.comfortZone).toHaveLength(4);
    for (const corner of dial.comfortZone) {
      expect(corner[1]).toBeLessThan(BASE_Y);
      expect(corner[1]).toBeGreaterThan(APEX[1]);
      const onTemperatureLine = dial.bandLines
        .filter((l) => l.pivot === TEMPERATURE_PIVOT)
        .some((l) => collinear(l.pivot, l.end, corner));
      const onHumidityLine = dial.bandLines
        .filter((l) => l.pivot === HUMIDITY_PIVOT)
        .some((l) => collinear(l.pivot, l.end, corner));
      expect(onTemperatureLine && onHumidityLine).toBe(true);
    }
  });

  it("runs a band line from each pivot towards each of its comfort limits, short of the scale", () => {
    const dial = layoutDial({ temperature: 21.5, humidity: 48 }, celsius);
    expect(dial.bandLines).toHaveLength(4);
    for (const line of dial.bandLines) {
      const length = distance(line.pivot, line.end);
      expect(length).toBeLessThan(RADIUS - 12);
      expect(length).toBeGreaterThan(RADIUS - 24);
    }
  });

  it("leaves out a needle and the crossing when a reading is missing", () => {
    const dial = layoutDial(
      { temperature: 21.5, humidity: undefined },
      celsius
    );
    expect(dial.temperatureNeedle).toBeDefined();
    expect(dial.humidityNeedle).toBeUndefined();
    expect(dial.crossing).toBeUndefined();
    expect(dial.comfortZone).toHaveLength(4);
  });
});
