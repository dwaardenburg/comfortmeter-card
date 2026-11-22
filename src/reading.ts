import type { HassEntity } from "./home-assistant";

/**
 * A sensor's reading as a number, or undefined when the sensor is missing, unavailable,
 * unknown or reports something that isn't a number.
 */
export function readingOf(entity: HassEntity | undefined): number | undefined {
  const state = entity?.state.trim() ?? "";
  if (state === "") return undefined;
  const reading = Number(state);
  return Number.isFinite(reading) ? reading : undefined;
}
