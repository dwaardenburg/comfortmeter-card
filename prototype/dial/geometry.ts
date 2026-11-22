// Throwaway prototype for #2. The dial's geometry as settled in the grill
// (documents/design/comfortmeter-dial.md), shared by the variants so they differ only in
// how they draw it.

export const C = 160;
export const R = 145;

export type Point = [number, number];

export interface Scales {
  unit: string;
  tMin: number;
  tMax: number;
  tLo: number;
  tHi: number;
  hMin: number;
  hMax: number;
  hLo: number;
  hHi: number;
}

export function scalesFor(unit: string): Scales {
  const f = unit === "°F";
  return {
    unit,
    tMin: f ? 50 : 10,
    tMax: f ? 95 : 35,
    tLo: f ? 66 : 19,
    tHi: f ? 75 : 24,
    hMin: 20,
    hMax: 100,
    hLo: 40,
    hHi: 60,
  };
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const rad = (deg: number) => (deg * Math.PI) / 180;

/** A point on the arc at an SVG angle (0° = right, clockwise, y down). */
export function pt(deg: number, r = R): Point {
  return [C + r * Math.cos(rad(deg)), C + r * Math.sin(rad(deg))];
}

/** Temperature: left half, rising clockwise from the lower-left end (135°) to the top. */
export const tempAngle = (t: number, s: Scales) =>
  135 + 135 * clamp01((t - s.tMin) / (s.tMax - s.tMin));

/** Humidity: right half, rising counter-clockwise from the lower-right end (45°). */
export const humAngle = (h: number, s: Scales) =>
  45 - 135 * clamp01((h - s.hMin) / (s.hMax - s.hMin));

/** Each needle pivots on the arc's end under the opposite scale. */
export const TEMP_PIVOT = pt(45);
export const HUM_PIVOT = pt(135);

export function intersect(
  p1: Point,
  p2: Point,
  p3: Point,
  p4: Point
): Point | null {
  const d =
    (p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0]);
  if (Math.abs(d) < 1e-6) return null;
  const t =
    ((p1[0] - p3[0]) * (p3[1] - p4[1]) - (p1[1] - p3[1]) * (p3[0] - p4[0])) / d;
  return [p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1])];
}

/** The area a needle sweeps between two scale angles: pivot, arc, back to pivot. */
export function wedge(pivot: Point, a1: number, a2: number): string {
  const [x1, y1] = pt(a1);
  const [x2, y2] = pt(a2);
  const sweep = a2 > a1 ? 1 : 0;
  const large = Math.abs(a2 - a1) > 180 ? 1 : 0;
  return `M${pivot[0]} ${pivot[1]} L${x1} ${y1} A${R} ${R} 0 ${large} ${sweep} ${x2} ${y2} Z`;
}

export function trackPath(r = R): string {
  const [x1, y1] = pt(135, r);
  const [x2, y2] = pt(45, r);
  return `M${x1} ${y1} A${r} ${r} 0 1 1 ${x2} ${y2}`;
}

export type TempBand = "too cold" | "comfortable" | "too warm";
export type HumBand = "too dry" | "comfortable" | "too humid";

export interface Reading {
  t: number;
  h: number;
  s: Scales;
  tA: number;
  hA: number;
  tTip: Point;
  hTip: Point;
  crossing: Point | null;
  tBand: TempBand;
  hBand: HumBand;
  verdict: string;
  zone: Point[];
  zoneTop: Point;
}

export function read(t: number, h: number, unit: string): Reading {
  const s = scalesFor(unit);
  const tA = tempAngle(t, s);
  const hA = humAngle(h, s);
  const tTip = pt(tA);
  const hTip = pt(hA);
  const tBand: TempBand =
    t < s.tLo ? "too cold" : t > s.tHi ? "too warm" : "comfortable";
  const hBand: HumBand =
    h < s.hLo ? "too dry" : h > s.hHi ? "too humid" : "comfortable";
  let verdict: string;
  if (tBand === "comfortable" && hBand === "comfortable")
    verdict = "Comfortable";
  else if (hBand === "comfortable") verdict = cap(tBand);
  else if (tBand === "comfortable") verdict = cap(hBand);
  else verdict = `${cap(tBand)} and ${hBand.replace("too ", "")}`;

  const tl = [pt(tempAngle(s.tLo, s)), pt(tempAngle(s.tHi, s))];
  const hl = [pt(humAngle(s.hLo, s)), pt(humAngle(s.hHi, s))];
  const zone = [
    intersect(TEMP_PIVOT, tl[0], HUM_PIVOT, hl[0])!,
    intersect(TEMP_PIVOT, tl[0], HUM_PIVOT, hl[1])!,
    intersect(TEMP_PIVOT, tl[1], HUM_PIVOT, hl[1])!,
    intersect(TEMP_PIVOT, tl[1], HUM_PIVOT, hl[0])!,
  ];
  const top = zone.reduce((a, b) => (b[1] < a[1] ? b : a));
  const cx = zone.reduce((a, b) => a + b[0], 0) / 4;
  return {
    t,
    h,
    s,
    tA,
    hA,
    tTip,
    hTip,
    crossing: intersect(TEMP_PIVOT, tTip, HUM_PIVOT, hTip),
    tBand,
    hBand,
    verdict,
    zone,
    zoneTop: [cx, top[1]],
  };
}

const cap = (x: string) => x[0].toUpperCase() + x.slice(1);

export const poly = (ps: Point[]) =>
  ps.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ") + " Z";

export interface FakeHass {
  states: Record<
    string,
    { state: string; attributes: { unit_of_measurement?: string } }
  >;
}

export function readHass(hass: FakeHass): Reading {
  const t = hass.states["sensor.room_temperature"];
  const h = hass.states["sensor.room_humidity"];
  return read(
    Number(t.state),
    Number(h.state),
    t.attributes.unit_of_measurement ?? "°C"
  );
}

export const fmt = (r: Reading) => ({
  t: `${r.t.toFixed(1)}`,
  tUnit: r.s.unit,
  h: `${Math.round(r.h)}`,
});
