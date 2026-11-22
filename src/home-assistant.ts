/**
 * The slice of Home Assistant's frontend `hass` object this card reads.
 *
 * Home Assistant does not publish these types, so the card declares only what it uses.
 */
export interface HassEntity {
  state: string;
  attributes: Record<string, unknown> & { unit_of_measurement?: string };
}

export interface HomeAssistant {
  states: Record<string, HassEntity | undefined>;
}
