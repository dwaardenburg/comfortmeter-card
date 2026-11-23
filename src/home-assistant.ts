/**
 * The slice of Home Assistant's frontend `hass` object this card reads.
 *
 * Home Assistant does not publish these types, so the card declares only what it uses.
 */
export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown> & { unit_of_measurement?: string };
}

/** An entity's entry in the entity registry, as far as the card reads it. */
export interface EntityRegistryDisplayEntry {
  /** The decimals the user set for the entity, if any. */
  display_precision?: number;
  /** The device the entity belongs to, if any. */
  device_id?: string;
}

export interface HomeAssistant {
  states: Record<string, HassEntity | undefined>;
  entities?: Record<string, EntityRegistryDisplayEntry | undefined>;
  /**
   * An entity's state as Home Assistant shows it: its display precision, unit and locale.
   * A given `state` is shown in place of the entity's own.
   */
  formatEntityState(entity: HassEntity, state?: string): string;
}

/**
 * Ask Home Assistant to open an entity's more-info dialog, as its own cards do on a tap.
 * The event crosses shadow roots up to the frontend, which opens the dialog; an entity it
 * doesn't know still gets one.
 */
export function moreInfo(from: Element, entityId: string): void {
  from.dispatchEvent(
    new CustomEvent("hass-more-info", {
      detail: { entityId },
      bubbles: true,
      composed: true,
    })
  );
}
