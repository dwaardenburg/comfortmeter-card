import { defaultScales, type Scale, type Scales } from "./dial";
import type { HassEntity } from "./home-assistant";

/** One scale's options; any key left out keeps its default. */
export type ScaleOptions = Partial<Scale>;

/** The YAML a dashboard gives the card, after validation. */
export interface ComfortmeterCardConfig {
  type: string;
  temperature_entity: string;
  humidity_entity: string;
  name?: string;
  /** In the temperature sensor's unit. */
  temperature?: ScaleOptions;
  humidity?: ScaleOptions;
  /** Number the four comfort limits at the scales. */
  show_comfort_limits?: boolean;
}

const ENTITY_ID = /^[a-z_]+\.[a-z0-9_]+$/;

/** A scale's keys from its bottom end to its top: each must be above the one before. */
const SCALE_KEYS = [
  "min",
  "comfortable_min",
  "comfortable_max",
  "max",
] as const;

/**
 * Validate the card's YAML and return it typed.
 *
 * Throws an Error whose message Home Assistant shows in the card editor, so it names the
 * offending option.
 */
export function parseConfig(raw: unknown): ComfortmeterCardConfig {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("The card configuration must be an object.");
  }
  const config = raw as Record<string, unknown>;
  for (const option of ["temperature_entity", "humidity_entity"]) {
    const value = config[option];
    if (typeof value !== "string" || !ENTITY_ID.test(value)) {
      throw new Error(
        `Set ${option} to an entity id, such as sensor.living_room.`
      );
    }
  }
  if (config.name !== undefined && typeof config.name !== "string") {
    throw new Error("name must be text.");
  }
  if (
    config.show_comfort_limits !== undefined &&
    typeof config.show_comfort_limits !== "boolean"
  ) {
    throw new Error("show_comfort_limits must be true or false.");
  }
  for (const scale of ["temperature", "humidity"] as const) {
    const block = config[scale];
    if (block === undefined) continue;
    if (typeof block !== "object" || block === null) {
      throw new Error(
        `${scale} must be a block of options: min, max, comfortable_min and comfortable_max.`
      );
    }
    for (const key of SCALE_KEYS) {
      const value = (block as Record<string, unknown>)[key];
      if (value !== undefined && typeof value !== "number") {
        throw new Error(`${scale}.${key} must be a number.`);
      }
    }
    // The defaults depend on the sensor's unit, so only the keys set are checked here.
    layOver(scale, block as ScaleOptions, {});
  }
  return config as unknown as ComfortmeterCardConfig;
}

/**
 * The scales for the card's options and the temperature sensor's unit: the defaults for
 * that unit with the options laid over them.
 *
 * Throws an Error naming the option when the result is out of order, such as a
 * comfortable minimum above the default comfortable maximum. Only here is the unit known.
 */
export function scalesFor(
  config: ComfortmeterCardConfig,
  temperatureUnit: string | undefined
): Scales {
  const defaults = defaultScales(temperatureUnit);
  return {
    temperature: layOver(
      "temperature",
      config.temperature ?? {},
      defaults.temperature
    ) as Scale,
    humidity: layOver(
      "humidity",
      config.humidity ?? {},
      defaults.humidity
    ) as Scale,
  };
}

/**
 * Lay a scale's options over its defaults and check that each key is above the one
 * before it, skipping keys that are neither set nor defaulted. The error names the
 * option the user set, so it points at what to change.
 */
function layOver(
  scale: string,
  options: ScaleOptions,
  defaults: ScaleOptions
): ScaleOptions {
  const merged: ScaleOptions = { ...defaults, ...options };
  const present = SCALE_KEYS.filter((key) => merged[key] !== undefined);
  present.slice(1).forEach((above, i) => {
    const below = present[i];
    const high = merged[above] as number;
    const low = merged[below] as number;
    if (high > low) return;
    throw new Error(
      options[above] !== undefined
        ? `${scale}.${above} (${high}) must be above ${scale}.${below} (${low}).`
        : `${scale}.${below} (${low}) must be below ${scale}.${above} (${high}).`
    );
  });
  return merged;
}

/**
 * The card picker's first configuration: the first temperature and humidity sensors in
 * the house, or example entity ids that the editor shows as missing.
 */
export function stubConfig(
  states: Record<string, HassEntity | undefined>
): Pick<ComfortmeterCardConfig, "temperature_entity" | "humidity_entity"> {
  const first = (deviceClass: string) =>
    Object.keys(states).find(
      (id) =>
        id.startsWith("sensor.") &&
        states[id]?.attributes.device_class === deviceClass
    );
  return {
    temperature_entity: first("temperature") ?? "sensor.temperature",
    humidity_entity: first("humidity") ?? "sensor.humidity",
  };
}
