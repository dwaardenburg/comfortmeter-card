/**
 * How the air feels: which zone a pair of readings falls in, the comfort level's words
 * for it, and the colour the crossing takes there.
 */
import type { Scale, Scales } from "./dial";

export type TemperatureBand = "too cold" | "comfortable" | "too warm";
export type HumidityBand = "too dry" | "comfortable" | "too humid";

/** One band of each scale; where they overlap is one of the dial's nine zones. */
export interface Zone {
  temperature: TemperatureBand;
  humidity: HumidityBand;
}

/** -1 below the comfortable band, 0 in it (limits included), 1 above it. */
function bandStep(reading: number, scale: Scale): -1 | 0 | 1 {
  if (reading < scale.comfortable_min) return -1;
  if (reading > scale.comfortable_max) return 1;
  return 0;
}

const TEMPERATURE_BANDS = ["too cold", "comfortable", "too warm"] as const;
const HUMIDITY_BANDS = ["too dry", "comfortable", "too humid"] as const;

/** The zone a pair of readings falls in, by the readings themselves. */
export function zoneOf(
  readings: { temperature: number; humidity: number },
  scales: Scales
): Zone {
  return {
    temperature:
      TEMPERATURE_BANDS[bandStep(readings.temperature, scales.temperature) + 1],
    humidity: HUMIDITY_BANDS[bandStep(readings.humidity, scales.humidity) + 1],
  };
}

/**
 * The zone's place on one felt-temperature scale, from -4 (too cold and dry) to 4 (too
 * warm and humid). The temperature band sets the step in threes, and humidity moves it
 * one step: humid feels warmer and dry feels cooler, as the heat index, humidex and the
 * ASHRAE 55 comfort zone treat it.
 */
export function feltStep(zone: Zone): number {
  return (
    3 * (TEMPERATURE_BANDS.indexOf(zone.temperature) - 1) +
    (HUMIDITY_BANDS.indexOf(zone.humidity) - 1)
  );
}

/** Share of blue or red mixed into the green, per step away from comfortable. */
const SHARES = [0, 30, 55, 80, 100];

/** The crossing's colour in a zone, mixed from three theme colours. */
export function zoneColour(zone: Zone): string {
  const step = feltStep(zone);
  if (step === 0) return "var(--success-color)";
  const towards =
    step < 0 ? "var(--state-climate-cool-color)" : "var(--red-color)";
  return `color-mix(in oklab, ${towards} ${SHARES[Math.abs(step)]}%, var(--success-color))`;
}

/** The comfort level's words for a zone, such as "Too warm and humid". */
export function comfortLevel(zone: Zone): string {
  const { temperature, humidity } = zone;
  if (temperature === "comfortable" && humidity === "comfortable") {
    return "Comfortable";
  }
  const words =
    temperature === "comfortable"
      ? humidity
      : humidity === "comfortable"
        ? temperature
        : `${temperature} and ${humidity.replace("too ", "")}`;
  return words[0].toUpperCase() + words.slice(1);
}
