import type { HassEntity, HomeAssistant } from "./home-assistant";

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

/** The most decimals a reading's text shows. */
const MAX_DECIMALS = 1;

/**
 * A reading's text: as Home Assistant formats the sensor's state, in the user's locale
 * and with the sensor's unit, but with at most one decimal. A sensor set to fewer
 * decimals keeps its setting. A sensor with no reading shows "—".
 */
export function shownReading(
  hass: HomeAssistant,
  entity: HassEntity | undefined
): string {
  const reading = readingOf(entity);
  if (!entity || reading === undefined) return "—";
  const precision =
    hass.entities?.[entity.entity_id]?.display_precision ??
    decimalsIn(entity.state);
  if (precision <= MAX_DECIMALS) return hass.formatEntityState(entity);
  // Home Assistant pads a state to the display precision it finds in the entity
  // registry under the entity's id. Under an id in the same domain that the registry
  // doesn't know, the rounded state keeps its one decimal.
  const [domain] = entity.entity_id.split(".");
  return hass.formatEntityState(
    { ...entity, entity_id: `${domain}.comfortmeter_card_reading` },
    // Rounded on whole tenths, so 55.55 (stored as 55.549…) shows as 55.6.
    (Math.round(reading * 10 ** MAX_DECIMALS) / 10 ** MAX_DECIMALS).toFixed(
      MAX_DECIMALS
    )
  );
}

/** The decimals written in a state, such as 2 for "55.54". */
function decimalsIn(state: string): number {
  const [, fraction = ""] = state.trim().split(".");
  return fraction.length;
}
