// Throwaway prototype for #2. The pointed-arch dial: two scales, each an arc centred on
// its own needle's pivot, with the radius equal to the distance between the pivots (an
// equilateral arch, as on the Fischer). Each arc spans 60° from the base to the apex; the
// scale uses the part between GAP_LOW and GAP_HIGH so the arcs clear the pivots and meet
// with a small gap at the apex.
import { scalesFor, type Point, type Reading } from "./geometry";

export const SPAN = 270;
export const BASE_Y = 282;
// Sides swapped in round seven: humidity is the left arc, temperature the right one.
/** The temperature needle's pivot, lower left; the humidity arc ends on it. */
export const TEMP_PIVOT: Point = [160 - SPAN / 2, BASE_Y];
/** The humidity needle's pivot, lower right; the temperature arc ends on it. */
export const HUM_PIVOT: Point = [160 + SPAN / 2, BASE_Y];
/** A point on one of the scales, at degrees above the base. */
export type ArchPoint = (deg: number, r?: number) => Point;

export const GAP_LOW = 6;
export const GAP_HIGH = 56;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const rad = (d: number) => (d * Math.PI) / 180;

/** Degrees above the base a scale value sits at, seen from its needle's pivot. */
const lift = (f: number, lo: number, hi: number) => lo + (hi - lo) * clamp01(f);

/** The temperature arc is centred on the temperature pivot and lies to its upper right. */
export const tempPoint = (deg: number, r = SPAN): Point => [
  TEMP_PIVOT[0] + r * Math.cos(rad(deg)),
  TEMP_PIVOT[1] - r * Math.sin(rad(deg)),
];
/** The humidity arc is centred on the humidity pivot and lies to its upper left. */
export const humPoint = (deg: number, r = SPAN): Point => [
  HUM_PIVOT[0] - r * Math.cos(rad(deg)),
  HUM_PIVOT[1] - r * Math.sin(rad(deg)),
];

export function tempArc(lo = GAP_LOW, hi = GAP_HIGH): string {
  const [x1, y1] = tempPoint(lo);
  const [x2, y2] = tempPoint(hi);
  return `M${x1} ${y1} A${SPAN} ${SPAN} 0 0 0 ${x2} ${y2}`;
}
export function humArc(lo = GAP_LOW, hi = GAP_HIGH): string {
  const [x1, y1] = humPoint(lo);
  const [x2, y2] = humPoint(hi);
  return `M${x1} ${y1} A${SPAN} ${SPAN} 0 0 1 ${x2} ${y2}`;
}

function intersect(p1: Point, p2: Point, p3: Point, p4: Point): Point | null {
  const d =
    (p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0]);
  if (Math.abs(d) < 1e-6) return null;
  const t =
    ((p1[0] - p3[0]) * (p3[1] - p4[1]) - (p1[1] - p3[1]) * (p3[0] - p4[0])) / d;
  return [p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1])];
}

export function readArch(
  t: number,
  h: number,
  unit: string,
  lo = GAP_LOW,
  hi = GAP_HIGH
): Reading {
  const s = scalesFor(unit);
  const tDeg = (x: number) => lift((x - s.tMin) / (s.tMax - s.tMin), lo, hi);
  const hDeg = (x: number) => lift((x - s.hMin) / (s.hMax - s.hMin), lo, hi);
  const tTip = tempPoint(tDeg(t));
  const hTip = humPoint(hDeg(h));
  const tBand =
    t < s.tLo ? "too cold" : t > s.tHi ? "too warm" : ("comfortable" as const);
  const hBand =
    h < s.hLo ? "too dry" : h > s.hHi ? "too humid" : ("comfortable" as const);
  const cap = (x: string) => x[0].toUpperCase() + x.slice(1);
  const verdict =
    tBand === "comfortable" && hBand === "comfortable"
      ? "Comfortable"
      : hBand === "comfortable"
        ? cap(tBand)
        : tBand === "comfortable"
          ? cap(hBand)
          : `${cap(tBand)} and ${hBand.replace("too ", "")}`;
  const tl = [tempPoint(tDeg(s.tLo)), tempPoint(tDeg(s.tHi))];
  const hl = [humPoint(hDeg(s.hLo)), humPoint(hDeg(s.hHi))];
  const zone = [
    intersect(TEMP_PIVOT, tl[0], HUM_PIVOT, hl[0])!,
    intersect(TEMP_PIVOT, tl[0], HUM_PIVOT, hl[1])!,
    intersect(TEMP_PIVOT, tl[1], HUM_PIVOT, hl[1])!,
    intersect(TEMP_PIVOT, tl[1], HUM_PIVOT, hl[0])!,
  ];
  const top = Math.min(...zone.map((p) => p[1]));
  const cx = zone.reduce((a, p) => a + p[0], 0) / 4;
  return {
    t,
    h,
    s,
    tA: tDeg(t),
    hA: hDeg(h),
    tTip,
    hTip,
    // Both at their minimums the needles lie on one line along the base: call that a
    // crossing in the middle of the base.
    crossing: intersect(TEMP_PIVOT, tTip, HUM_PIVOT, hTip) ?? [160, BASE_Y],
    tBand,
    hBand,
    verdict,
    zone,
    zoneTop: [cx, top],
  };
}
