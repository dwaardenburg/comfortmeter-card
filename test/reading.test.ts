import { describe, expect, it } from "vitest";
import type { HassEntity, HomeAssistant } from "../src/home-assistant";
import { readingOf, shownReading } from "../src/reading";

const entity = (state: string): HassEntity => ({
  entity_id: "sensor.room_humidity",
  state,
  attributes: { unit_of_measurement: "%" },
});

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

/**
 * A stand-in for Home Assistant's formatting: the registry's display precision for the
 * entity's id if set, otherwise the decimals in the state, with a decimal comma.
 */
function hassWithPrecision(precision?: number): HomeAssistant {
  return {
    states: {},
    entities: { "sensor.room_humidity": { display_precision: precision } },
    formatEntityState(stateObj, state = stateObj.state) {
      const set = this.entities?.[stateObj.entity_id]?.display_precision;
      const number = set === undefined ? state : Number(state).toFixed(set);
      return `${number.replace(".", ",")}%`;
    },
  };
}

describe("shownReading", () => {
  it.each([
    ["55.54", undefined, "55,5%"],
    ["55.55", 2, "55,6%"],
    ["55.5", undefined, "55,5%"],
    ["19.0", undefined, "19,0%"],
    ["53", undefined, "53%"],
    ["53.21", 0, "53%"],
    ["53.21", 1, "53,2%"],
  ])("shows %s at display precision %s as %s", (state, precision, shown) => {
    expect(shownReading(hassWithPrecision(precision), entity(state))).toBe(
      shown
    );
  });

  it("shows a dash for a sensor with no reading", () => {
    expect(shownReading(hassWithPrecision(), entity("unavailable"))).toBe("—");
    expect(shownReading(hassWithPrecision(), undefined)).toBe("—");
  });
});
