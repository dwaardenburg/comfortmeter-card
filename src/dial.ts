/**
 * The dial's geometry: where every part of the comfortmeter sits for a pair of readings.
 *
 * The dial is a pointed arch in a 320-wide SVG canvas. Each scale is an arc centred on its
 * needle's pivot with a radius equal to the distance between the pivots, so the two
 * scales meet at the apex. The temperature needle pivots at the lower left and its scale
 * is the right arc; the humidity needle pivots at the lower right and its scale is the
 * left arc. A scale reads in degrees above the base, from 0° at the opposite pivot to 60°
 * at the apex.
 */

export type Point = readonly [number, number];

/** One scale's range and comfortable band, in the reading's own unit. */
export interface Scale {
  min: number;
  max: number;
  comfortable_min: number;
  comfortable_max: number;
}

export interface Scales {
  temperature: Scale;
  humidity: Scale;
}

/** The readings to show; a reading the sensor can't give is left undefined. */
export interface Readings {
  temperature: number | undefined;
  humidity: number | undefined;
}

export interface Needle {
  pivot: Point;
  /** Where the needle meets its scale. */
  marker: Point;
}

export interface BandLine {
  pivot: Point;
  end: Point;
}

export interface DialLayout {
  temperatureNeedle?: Needle;
  humidityNeedle?: Needle;
  /** Where the needles cross; undefined while either reading is missing. */
  crossing?: Point;
  /** The comfort zone's four corners, in order round the zone. */
  comfortZone: Point[];
  bandLines: BandLine[];
  /** The comfort limits' numbers, when they are shown, in the band lines' order. */
  comfortLimits: ComfortLimit[];
}

export interface ComfortLimit {
  value: number;
  at: Point;
}

/** The arc's radius: the distance between the pivots. */
export const RADIUS = 270;
export const BASE_Y = 282;
/** The scales' stroke width, the thermostat track's. */
export const SCALE_WIDTH = 24;
/** How far a band line stops short of the scale's inner edge. */
const BAND_LINE_GAP = 4;
/** How far a band line stops short of the scale when a comfort limit is numbered there. */
const COMFORT_LIMIT_GAP = 22;
/** Where a comfort limit's number sits: on its band line, just inside the scale. */
const COMFORT_LIMIT_RADIUS = RADIUS - 25;
const SCALE_DEGREES = 60;

export const TEMPERATURE_PIVOT: Point = [160 - RADIUS / 2, BASE_Y];
export const HUMIDITY_PIVOT: Point = [160 + RADIUS / 2, BASE_Y];
export const APEX: Point = [160, BASE_Y - RADIUS * Math.sin(Math.PI / 3)];
export const BASE_MIDDLE: Point = [160, BASE_Y];

const HUMIDITY_SCALE: Scale = {
  min: 20,
  max: 100,
  comfortable_min: 40,
  comfortable_max: 60,
};

/**
 * The scales for a temperature sensor's unit. 10–35 °C is exactly 50–95 °F, so a °F
 * sensor gets the same dial.
 */
export function defaultScales(temperatureUnit: string | undefined): Scales {
  const fahrenheit = temperatureUnit === "°F";
  return {
    temperature: fahrenheit
      ? { min: 50, max: 95, comfortable_min: 66, comfortable_max: 75 }
      : { min: 10, max: 35, comfortable_min: 19, comfortable_max: 24 },
    humidity: { ...HUMIDITY_SCALE },
  };
}

/** Degrees above the base a reading sits at on its scale, pinned to the scale's ends. */
export function scaleAngle(reading: number, scale: Scale): number {
  const share = (reading - scale.min) / (scale.max - scale.min);
  return SCALE_DEGREES * Math.min(1, Math.max(0, share));
}

const radians = (degrees: number) => (degrees * Math.PI) / 180;

/** A point on the temperature scale's side, at an angle above the base from its pivot. */
export function temperaturePoint(degrees: number, radius = RADIUS): Point {
  return [
    TEMPERATURE_PIVOT[0] + radius * Math.cos(radians(degrees)),
    TEMPERATURE_PIVOT[1] - radius * Math.sin(radians(degrees)),
  ];
}

/** A point on the humidity scale's side, at an angle above the base from its pivot. */
export function humidityPoint(degrees: number, radius = RADIUS): Point {
  return [
    HUMIDITY_PIVOT[0] - radius * Math.cos(radians(degrees)),
    HUMIDITY_PIVOT[1] - radius * Math.sin(radians(degrees)),
  ];
}

/** Where the line through a and b meets the line through c and d, if they are not parallel. */
function intersect(a: Point, b: Point, c: Point, d: Point): Point | undefined {
  const denominator =
    (a[0] - b[0]) * (c[1] - d[1]) - (a[1] - b[1]) * (c[0] - d[0]);
  if (Math.abs(denominator) < 1e-9) return undefined;
  const t =
    ((a[0] - c[0]) * (c[1] - d[1]) - (a[1] - c[1]) * (c[0] - d[0])) /
    denominator;
  return [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])];
}

/** Lay out the dial for a pair of readings on a pair of scales. */
export function layoutDial(
  readings: Readings,
  scales: Scales,
  options: { showComfortLimits?: boolean } = {}
): DialLayout {
  const temperatureAngle = (x: number) => scaleAngle(x, scales.temperature);
  const humidityAngle = (x: number) => scaleAngle(x, scales.humidity);

  const temperatureNeedle =
    readings.temperature === undefined
      ? undefined
      : {
          pivot: TEMPERATURE_PIVOT,
          marker: temperaturePoint(temperatureAngle(readings.temperature)),
        };
  const humidityNeedle =
    readings.humidity === undefined
      ? undefined
      : {
          pivot: HUMIDITY_PIVOT,
          marker: humidityPoint(humidityAngle(readings.humidity)),
        };

  // At both minimums the needles lie on one line along the base: the card calls that a
  // crossing in the middle of the base.
  const crossing =
    temperatureNeedle && humidityNeedle
      ? (intersect(
          temperatureNeedle.pivot,
          temperatureNeedle.marker,
          humidityNeedle.pivot,
          humidityNeedle.marker
        ) ?? BASE_MIDDLE)
      : undefined;

  const temperatureLimits = [
    temperaturePoint(temperatureAngle(scales.temperature.comfortable_min)),
    temperaturePoint(temperatureAngle(scales.temperature.comfortable_max)),
  ];
  const humidityLimits = [
    humidityPoint(humidityAngle(scales.humidity.comfortable_min)),
    humidityPoint(humidityAngle(scales.humidity.comfortable_max)),
  ];
  const corner = (t: Point, h: Point) =>
    intersect(TEMPERATURE_PIVOT, t, HUMIDITY_PIVOT, h) ?? BASE_MIDDLE;
  const comfortZone = [
    corner(temperatureLimits[0], humidityLimits[0]),
    corner(temperatureLimits[0], humidityLimits[1]),
    corner(temperatureLimits[1], humidityLimits[1]),
    corner(temperatureLimits[1], humidityLimits[0]),
  ];

  // The four comfort limits, each with where its band line runs from and towards.
  const limits = [
    ...[
      scales.temperature.comfortable_min,
      scales.temperature.comfortable_max,
    ].map((value) => ({
      value,
      pivot: TEMPERATURE_PIVOT,
      at: (radius: number) => temperaturePoint(temperatureAngle(value), radius),
    })),
    ...[scales.humidity.comfortable_min, scales.humidity.comfortable_max].map(
      (value) => ({
        value,
        pivot: HUMIDITY_PIVOT,
        at: (radius: number) => humidityPoint(humidityAngle(value), radius),
      })
    ),
  ];
  // Band lines stop short of the scale, and further short when a number sits there.
  const lineLength =
    RADIUS -
    SCALE_WIDTH / 2 -
    (options.showComfortLimits ? COMFORT_LIMIT_GAP : BAND_LINE_GAP);
  const bandLines: BandLine[] = limits.map(({ pivot, at }) => ({
    pivot,
    end: at(lineLength),
  }));
  const comfortLimits: ComfortLimit[] = options.showComfortLimits
    ? limits.map(({ value, at }) => ({ value, at: at(COMFORT_LIMIT_RADIUS) }))
    : [];

  return {
    temperatureNeedle,
    humidityNeedle,
    crossing,
    comfortZone,
    bandLines,
    comfortLimits,
  };
}

/** An SVG path for the temperature scale: from the humidity pivot up to the apex. */
export function temperatureScalePath(): string {
  const [x1, y1] = temperaturePoint(0);
  const [x2, y2] = temperaturePoint(SCALE_DEGREES);
  return `M${x1} ${y1} A${RADIUS} ${RADIUS} 0 0 0 ${x2} ${y2}`;
}

/** An SVG path for the humidity scale: from the temperature pivot up to the apex. */
export function humidityScalePath(): string {
  const [x1, y1] = humidityPoint(0);
  const [x2, y2] = humidityPoint(SCALE_DEGREES);
  return `M${x1} ${y1} A${RADIUS} ${RADIUS} 0 0 1 ${x2} ${y2}`;
}

/** An SVG path through a polygon's corners. */
export function polygonPath(corners: readonly Point[]): string {
  return `${corners.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ")} Z`;
}
