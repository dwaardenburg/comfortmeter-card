// Throwaway prototype for #2. The pointed-arch dial in its latest form, with switches for
// the variants built on it.
//
// F: 24px arcs from the opposite pivot to the apex; soft band lines through the pivots,
//    stopping short of the arcs; a green comfort zone; the crossing dot in the band's
//    colour; a small white dot on each current value; the room name on one line at the
//    top with the readings in the corners below it; the verdict centred under the base.
// A: F with the face coloured the way the crossing dot would be at each spot.
// G: F with the band limits numbered at the arcs (the card's optional show_band_limits).
import { LitElement, css, html, svg } from "lit";
import { fmt, poly, type FakeHass } from "./geometry";
import {
  HUM_PIVOT,
  SPAN,
  TEMP_PIVOT,
  humArc,
  humPoint,
  readArch,
  tempArc,
  tempPoint,
  type ArchPoint,
} from "./arch";
import { icon, mdiThermometer, mdiWaterPercent } from "./icons";

const COLD = "var(--state-climate-cool-color)";
const WARM = "var(--state-climate-heat-color)";
const DRY = "var(--state-climate-dry-color)";
const HUMID = "var(--indigo-color)";
const OK = "var(--success-color)";

/** The crossing dot's colour: the temperature's band wins when both are off. */
function colourFor(tBand: string, hBand: string): string {
  if (tBand === "too warm") return WARM;
  if (tBand === "too cold") return COLD;
  if (hBand === "too dry") return DRY;
  if (hBand === "too humid") return HUMID;
  return OK;
}

/**
 * Every point a needle line passes through between two angles, as a fan from its pivot
 * reaching well past the arch; clipped to the arch, the fans cover the whole face.
 */
function fan(point: ArchPoint, a1: number, a2: number, pivot: number[]) {
  const steps = Math.max(2, Math.ceil(Math.abs(a2 - a1) / 5));
  const pts = Array.from({ length: steps + 1 }, (_, i) =>
    point(a1 + ((a2 - a1) * i) / steps, 3 * SPAN)
  );
  return `M${pivot[0]} ${pivot[1]} ${pts.map(([x, y]) => `L${x} ${y}`).join(" ")} Z`;
}

/** The pointed arch: the humidity arc up to the apex, the temperature arc back down. */
function archOutline() {
  const [ax, ay] = tempPoint(60);
  return `M${TEMP_PIVOT[0]} ${TEMP_PIVOT[1]} A${SPAN} ${SPAN} 0 0 1 ${ax} ${ay} A${SPAN} ${SPAN} 0 0 1 ${HUM_PIVOT[0]} ${HUM_PIVOT[1]} Z`;
}

let n = 0;

class ArchDial extends LitElement {
  static properties = {
    hass: { attribute: false },
    name: { attribute: false },
  };
  declare hass: FakeHass;
  declare name: string;
  protected colourFace = false;
  protected numbers = false;
  private id = `arch${n++}`;

  render() {
    const t = this.hass.states["sensor.room_temperature"];
    const h = this.hass.states["sensor.room_humidity"];
    const r = readArch(
      Number(t.state),
      Number(h.state),
      t.attributes.unit_of_measurement ?? "°C",
      0,
      60
    );
    const s = r.s;
    const f = fmt(r);
    const tDeg = (x: number) => (60 * (x - s.tMin)) / (s.tMax - s.tMin);
    const hDeg = (x: number) => (60 * (x - s.hMin)) / (s.hMax - s.hMin);
    // Band lines stop 4px short of the 24px arc, or further when a number sits there.
    const lineEnd = SPAN - 12 - (this.numbers ? 22 : 4);
    const bandLines = [
      ...[s.tLo, s.tHi].map(
        (x) => [TEMP_PIVOT, tempPoint(tDeg(x), lineEnd)] as const
      ),
      ...[s.hLo, s.hHi].map(
        (x) => [HUM_PIVOT, humPoint(hDeg(x), lineEnd)] as const
      ),
    ];
    const numbers = this.numbers
      ? [
          ...[s.tLo, s.tHi].map((x) => [tempPoint(tDeg(x), SPAN - 25), x]),
          ...[s.hLo, s.hHi].map((x) => [humPoint(hDeg(x), SPAN - 25), x]),
        ].map(
          ([p, x]) =>
            svg`<text class="number" x=${(p as number[])[0]} y=${(p as number[])[1]}>${x}</text>`
        )
      : "";
    // The face split into the nine band combinations, each in its crossing colour. The
    // outer bands run on past the scale ends so the colours fill the whole arch.
    const tSectors = [
      ["too cold", -40, tDeg(s.tLo)],
      ["comfortable", tDeg(s.tLo), tDeg(s.tHi)],
      ["too warm", tDeg(s.tHi), 160],
    ] as const;
    const hSectors = [
      ["too dry", -40, hDeg(s.hLo)],
      ["comfortable", hDeg(s.hLo), hDeg(s.hHi)],
      ["too humid", hDeg(s.hHi), 160],
    ] as const;
    const face = this.colourFace
      ? svg`
        <defs>
          ${tSectors.map(
            ([, a1, a2], i) =>
              svg`<clipPath id="${this.id}-t${i}"><path d=${fan(tempPoint, a1, a2, TEMP_PIVOT)} /></clipPath>`
          )}
          <clipPath id="${this.id}-arch"><path d=${archOutline()} /></clipPath>
        </defs>
        <g class="face" clip-path="url(#${this.id}-arch)">
          ${tSectors.map(([tBand], i) =>
            hSectors.map(
              ([hBand, a1, a2]) =>
                svg`<path clip-path="url(#${this.id}-t${i})" style="fill:${colourFor(tBand, hBand)}" d=${fan(humPoint, a1, a2, HUM_PIVOT)} />`
            )
          )}
        </g>`
      : "";
    const c = r.crossing!;
    return html`<ha-card>
      <div class="name">${this.name}</div>
      <div class="dial">
        <div class="reading left">${icon(mdiWaterPercent)}${f.h} %</div>
        <div class="reading right">
          ${icon(mdiThermometer)}${f.t} ${f.tUnit}
        </div>
        <svg class="face-svg" viewBox="0 30 320 296">
          ${face}
          <g class="tracks">
            <path class="track" d=${tempArc(0, 60)} />
            <path class="track" d=${humArc(0, 60)} />
          </g>
          ${bandLines.map(
            ([a, b]) =>
              svg`<line class="band" x1=${a[0]} y1=${a[1]} x2=${b[0]} y2=${b[1]} />`
          )}
          ${numbers}
          <path class="zone" d=${poly(r.zone)} />
          ${svg`
            <line class="needle" x1=${TEMP_PIVOT[0]} y1=${TEMP_PIVOT[1]} x2=${r.tTip[0]} y2=${r.tTip[1]} />
            <line class="needle" x1=${HUM_PIVOT[0]} y1=${HUM_PIVOT[1]} x2=${r.hTip[0]} y2=${r.hTip[1]} />
            <circle class="pivot" cx=${TEMP_PIVOT[0]} cy=${TEMP_PIVOT[1]} r="4" />
            <circle class="pivot" cx=${HUM_PIVOT[0]} cy=${HUM_PIVOT[1]} r="4" />
            <circle class="value" cx=${r.tTip[0]} cy=${r.tTip[1]} r="4" />
            <circle class="value" cx=${r.hTip[0]} cy=${r.hTip[1]} r="4" />
            <circle cx=${c[0]} cy=${c[1]} r="8" class="cross-border" />
            <circle cx=${c[0]} cy=${c[1]} r="6" style="fill:${colourFor(r.tBand, r.hBand)}" />
          `}
          <text class="verdict" x="160" y="316">${r.verdict}</text>
        </svg>
      </div>
    </ha-card>`;
  }

  static styles = css`
    .name {
      font-size: 16px;
      text-align: center;
      padding: 12px 16px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    /* The readings sit in the empty corners beside the apex, under the name. */
    .dial {
      position: relative;
    }
    .reading {
      position: absolute;
      /* Midway between the name and the arc below the reading (about y = 92 of the 30–326
         viewBox), so 21 % down the dial, centred on its own height. */
      top: 21%;
      transform: translateY(-50%);
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: 14px;
      color: var(--secondary-text-color);
      white-space: nowrap;
    }
    .left {
      left: 12px;
    }
    .right {
      right: 12px;
    }
    .icon {
      width: 16px;
      height: 16px;
      fill: currentColor;
    }
    .face-svg {
      display: block;
      width: 100%;
      padding: 0 12px 12px;
      box-sizing: border-box;
    }
    .face {
      opacity: 0.18;
    }
    /* One group opacity, so the arcs don't darken where they overlap at the apex. */
    .tracks {
      opacity: 0.3;
    }
    .track {
      fill: none;
      stroke: var(--disabled-color);
      stroke-width: 24;
      stroke-linecap: round;
    }
    .band {
      stroke: var(--secondary-text-color);
      stroke-width: 1;
      opacity: 0.3;
    }
    .number {
      font-size: 11px;
      fill: var(--secondary-text-color);
      text-anchor: middle;
      dominant-baseline: middle;
    }
    .zone {
      fill: var(--success-color);
      fill-opacity: 0.3;
      stroke: var(--success-color);
      stroke-width: 1.5;
      stroke-linejoin: round;
    }
    .needle {
      stroke: var(--primary-text-color);
      stroke-width: 2;
      stroke-linecap: round;
    }
    .pivot {
      fill: var(--primary-text-color);
    }
    /* The current value on its scale: small and white, like the thermostat's marker. */
    .value {
      fill: white;
      stroke: rgba(0, 0, 0, 0.2);
      stroke-width: 1;
    }
    .cross-border {
      fill: var(--card-background-color);
    }
    .verdict {
      text-anchor: middle;
      font-size: 14px;
      font-weight: 500;
      fill: var(--primary-text-color);
    }
  `;
}

customElements.define("variant-f", class extends ArchDial {});
customElements.define(
  "variant-a",
  class extends ArchDial {
    protected colourFace = true;
  }
);
customElements.define(
  "variant-g",
  class extends ArchDial {
    protected numbers = true;
  }
);
