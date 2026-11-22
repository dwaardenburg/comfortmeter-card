/** The YAML a dashboard gives the card, after validation. */
export interface ComfortmeterCardConfig {
  type: string;
  temperature_entity: string;
  humidity_entity: string;
  name?: string;
}

const ENTITY_ID = /^[a-z_]+\.[a-z0-9_]+$/;

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
  return config as unknown as ComfortmeterCardConfig;
}
