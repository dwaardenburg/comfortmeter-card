/**
 * How the header lays out the room name and the readings for the room it has:
 * - `inline`: the readings at the ends of the name's line;
 * - `stacked`: the name on its own line, the readings on the line below, at its ends;
 * - `narrow`: the name, then each reading on a line of its own, centred.
 */
export type HeaderLayout = "inline" | "stacked" | "narrow";

/** Widths in px, each as wide as its content wants to be. */
export interface HeaderWidths {
  /** The header's width inside its padding. */
  available: number;
  /** The name's full width, or 0 without a name. */
  name: number;
  humidity: number;
  temperature: number;
  /** The space between two items on a line. */
  gap: number;
}

/**
 * The readings stay beside the name while the whole name fits between them, move down a
 * line when it doesn't, and are centred one per line when they don't fit side by side.
 */
export function headerLayout(widths: HeaderWidths): HeaderLayout {
  const { available, name, humidity, temperature, gap } = widths;
  const readings = humidity + gap + temperature;
  if (readings > available) return "narrow";
  if (name > 0 && readings + gap + name > available) return "stacked";
  return "inline";
}
