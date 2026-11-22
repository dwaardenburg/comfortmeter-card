// The preview page's scenarios, and the stand-in `hass` each is drawn with. The
// edge cases are also mounted by test/scenarios.test.ts, which checks that none
// throws or draws at a coordinate that isn't a number.
import type { HassEntity, HomeAssistant } from "../src/home-assistant";

export interface Scenario {
  label: string;
  /** The sensor's state; `null` leaves the entity out of `hass` altogether. */
  temperature: string | null;
  humidity: string | null;
  /** The temperature sensor's unit; `null` gives it none. Default °C. */
  unit?: string | null;
  /** The decimals set in the entity registry, for both sensors. */
  precision?: number;
  options?: Record<string, unknown>;
  /** The card's width in the preview, in px. Default 260. */
  width?: number;
}

/** How the card looks: the cases a person checks the design against. */
export const looks: Scenario[] = [
  { label: "comfortable", temperature: "21.5", humidity: "48" },
  { label: "too warm and humid", temperature: "26.3", humidity: "68" },
  { label: "cold, pinned below 10 °C", temperature: "8.0", humidity: "37" },
  {
    label: "°F sensor, long room name",
    temperature: "71.6",
    humidity: "55",
    unit: "°F",
    options: { name: "Master bedroom on the second floor, east side" },
  },
  { label: "both at their minimums", temperature: "9.0", humidity: "18" },
  {
    label: "comfortable up to 27 °C and 65 %",
    temperature: "26.3",
    humidity: "63",
    options: {
      temperature: { comfortable_max: 27 },
      humidity: { comfortable_max: 65 },
    },
  },
  { label: "a wide card", temperature: "22.8", humidity: "57", width: 540 },
  {
    label: "show_comfort_limits",
    temperature: "21.5",
    humidity: "48",
    options: { show_comfort_limits: true },
  },
];

/**
 * Sensors that are missing, broken or at the extremes, and configurations at odds. Each
 * card combines variations that don't affect each other, so a few cards cover them all;
 * split one out when it looks off.
 */
export const edgeCases: Scenario[] = [
  {
    label: "humidity unavailable · many decimals · no name",
    temperature: "21.4567",
    humidity: "unavailable",
    options: { name: undefined },
  },
  {
    label: "temperature unknown · on a comfort limit, numbered",
    temperature: "unknown",
    humidity: "60",
    options: { show_comfort_limits: true },
  },
  {
    label: "both entities missing · long name",
    temperature: null,
    humidity: null,
    options: { name: "Master bedroom on the second floor, east side" },
  },
  {
    label: "not a number · empty",
    temperature: "error",
    humidity: "",
  },
  {
    label:
      "registry precision 3 · far below the scales · °F · name not beside the readings",
    width: 200,
    temperature: "-13.4567",
    humidity: "0",
    unit: "°F",
    precision: 3,
  },
  {
    label: "registry precision 0 · far above · humidity over 100 % · wide",
    temperature: "48.94",
    humidity: "112",
    precision: 0,
    width: 540,
  },
  {
    label: "on the other limits · no unit · band as wide as the scale",
    temperature: "24",
    humidity: "40",
    unit: null,
    options: {
      show_comfort_limits: true,
      humidity: {
        min: 0,
        comfortable_min: 0.5,
        comfortable_max: 99.5,
        max: 100,
      },
    },
  },
  { label: "huge numbers", temperature: "1e9", humidity: "-1e9" },
  {
    label: "°C limits on a °F sensor",
    temperature: "71.6",
    humidity: "48",
    unit: "°F",
    options: { temperature: { comfortable_max: 25 } },
  },
  {
    label: "half a section, the narrowest · readings on their own lines",
    temperature: "-12.5",
    humidity: "100",
    width: 155,
    options: { show_comfort_limits: true },
  },
];

/** The two sensors' ids in every scenario. */
export const ENTITIES = {
  temperature: "sensor.room_temperature",
  humidity: "sensor.room_humidity",
};

/** The card's configuration in a scenario. */
export function configFor(scenario: Scenario): Record<string, unknown> {
  return {
    type: "custom:comfortmeter-card",
    temperature_entity: ENTITIES.temperature,
    humidity_entity: ENTITIES.humidity,
    name: "Living room",
    ...scenario.options,
  };
}

/**
 * A stand-in for Home Assistant's `hass` in a scenario. Its formatting follows Home
 * Assistant's closely enough for the readings: the registry's display precision if
 * set, otherwise the state's own decimals, and the unit after a space.
 */
export function hassFor(scenario: Scenario): HomeAssistant {
  const states: Record<string, HassEntity> = {};
  const entities: NonNullable<HomeAssistant["entities"]> = {};
  const add = (id: string, state: string | null, unit: string | null) => {
    if (state === null) return;
    states[id] = {
      entity_id: id,
      state,
      attributes: unit === null ? {} : { unit_of_measurement: unit },
    };
    entities[id] = { display_precision: scenario.precision };
  };
  const unit = scenario.unit === undefined ? "°C" : scenario.unit;
  add(ENTITIES.temperature, scenario.temperature, unit);
  add(ENTITIES.humidity, scenario.humidity, "%");
  return {
    states,
    entities,
    formatEntityState(entity, state = entity.state) {
      const number = Number(state);
      if (state.trim() === "" || !Number.isFinite(number)) return state;
      // As Home Assistant's formatNumber: the registry's precision, else the decimals
      // written in the state, in the user's locale (en-US here).
      const digits =
        entities[entity.entity_id]?.display_precision ??
        (state.split(".")[1] ?? "").replace(/e.*/i, "").length;
      const value = number.toLocaleString("en-US", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });
      const unit = entity.attributes.unit_of_measurement;
      return unit ? `${value} ${unit}` : value;
    },
  };
}

/** A scenario's caption: its states and what it shows. */
export function captionFor(scenario: Scenario): string {
  const shown = (state: string | null) =>
    state === null ? "missing" : `"${state}"`;
  return `${shown(scenario.temperature)}, ${shown(scenario.humidity)} · ${scenario.label}`;
}
