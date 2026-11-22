// Throwaway prototype for #2: the preview page. A stand-in ha-card and thermostat card,
// the fake readings, the variant switcher and the state panel.
import { LitElement, css, html, svg } from "lit";
import { pt, trackPath, type FakeHass } from "./geometry";
import { readArch } from "./arch";
import { icon, mdiThermometer } from "./icons";
import "./variant-f";

customElements.define(
  "ha-card",
  class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" }).innerHTML =
        `<style>:host{display:block;
        background:var(--card-background-color);border-radius:12px;
        border:1px solid var(--divider-color);color:var(--primary-text-color);
        overflow:hidden}</style><slot></slot>`;
    }
  }
);

/** A stand-in for Home Assistant's thermostat card, using its numbers. */
class ThermostatStandIn extends LitElement {
  render() {
    const k = (21.5 - 7) / 28;
    const end = 135 + 270 * k;
    const [hx, hy] = pt(end);
    const [sx, sy] = pt(135);
    const [cx, cy] = pt(135 + 270 * ((25 - 7) / 28));
    return html`<ha-card>
      <div class="name">Living room</div>
      <div class="wrap">
        <svg viewBox="0 0 320 320">
          <path class="track" d=${trackPath()} />
          ${svg`<path class="value" d="M${sx} ${sy} A145 145 0 ${end - 135 > 180 ? 1 : 0} 1 ${hx} ${hy}" />
          <circle class="current" cx=${cx} cy=${cy} r="4" />
          <circle cx=${hx} cy=${hy} r="9" fill="white" />
          <circle cx=${hx} cy=${hy} r="6" fill="var(--state-climate-heat-color)" />`}
        </svg>
        <div class="middle">
          <div class="label">Heat</div>
          <div class="big">
            21<span class="sup"><span>.5</span><span>°C</span></span>
          </div>
          <div class="secondary">${icon(mdiThermometer)} 25 °C</div>
        </div>
      </div>
      <div class="buttons"><span>−</span><span>+</span></div>
    </ha-card>`;
  }
  static styles = css`
    .name {
      text-align: center;
      font-size: 16px;
      padding: 12px 0 0;
    }
    .wrap {
      position: relative;
      padding: 4px 12px 0;
    }
    svg {
      display: block;
      width: 100%;
    }
    .track,
    .value {
      fill: none;
      stroke-width: 24;
      stroke-linecap: round;
    }
    .track {
      stroke: var(--disabled-color);
      stroke-opacity: 0.3;
    }
    .value {
      stroke: var(--state-climate-heat-color);
    }
    .current {
      fill: var(--primary-text-color);
      opacity: 0.5;
    }
    .middle {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .label {
      font-size: 14px;
      color: var(--secondary-text-color);
    }
    .big {
      font-size: 57px;
      line-height: 1.12;
      letter-spacing: -0.25px;
      display: flex;
    }
    .sup {
      display: flex;
      flex-direction: column;
      font-size: 0.42em;
      padding-top: 8px;
      line-height: 1.2;
    }
    .secondary {
      font-size: 14px;
      color: var(--secondary-text-color);
      display: flex;
      align-items: center;
      gap: 2px;
    }
    .icon {
      width: 16px;
      height: 16px;
      fill: currentColor;
    }
    .buttons {
      display: flex;
      justify-content: center;
      gap: 24px;
      padding: 0 0 16px;
      margin-top: -36px;
      position: relative;
    }
    .buttons span {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1px solid var(--divider-color);
      display: grid;
      place-items: center;
      font-size: 20px;
    }
  `;
}
customElements.define("thermostat-stand-in", ThermostatStandIn);

const scenarios = [
  { name: "comfortable", t: 21.5, h: 48, unit: "°C" },
  { name: "too warm and humid", t: 26.3, h: 68, unit: "°C" },
  { name: "cold, pinned below 10 °C", t: 8.0, h: 37, unit: "°C" },
  {
    name: "°F sensor, long room name",
    t: 71.6,
    h: 55,
    unit: "°F",
    room: "Master bedroom on the second floor, east side",
  },
  { name: "both at minimum (known cost)", t: 9.0, h: 18, unit: "°C" },
];

const hassFor = (sc: (typeof scenarios)[number]): FakeHass => ({
  states: {
    "sensor.room_temperature": {
      state: String(sc.t),
      attributes: { unit_of_measurement: sc.unit },
    },
    "sensor.room_humidity": {
      state: String(sc.h),
      attributes: { unit_of_measurement: "%" },
    },
  },
});

const variants = [
  {
    key: "A",
    tag: "variant-a",
    name: "debug: zone colours",
  },
  { key: "F", tag: "variant-f", name: "full arcs, band lines, room name" },
  { key: "G", tag: "variant-g", name: "F with numbered comfort limits" },
];

const asked = variants.findIndex(
  (v) => v.key === new URLSearchParams(location.search).get("variant")
);
let current = asked < 0 ? variants.findIndex((v) => v.key === "F") : asked;

function render() {
  const v = variants[current];
  for (const theme of ["light", "dark"]) {
    const row = document.querySelector(`#${theme} .row`)!;
    row.innerHTML = "";
    const th = document.createElement("div");
    th.className = "cell";
    th.innerHTML = `<thermostat-stand-in></thermostat-stand-in><p>thermostat stand-in</p>`;
    row.append(th);
    for (const sc of scenarios) {
      const cell = document.createElement("div");
      cell.className = "cell";
      const el = document.createElement(v.tag) as HTMLElement & {
        hass: FakeHass;
      };
      el.hass = hassFor(sc);
      (el as unknown as { name: string }).name =
        "room" in sc ? sc.room : "Living room";
      const p = document.createElement("p");
      p.textContent = `${sc.t} ${sc.unit}, ${sc.h} % · ${sc.name}`;
      cell.append(el, p);
      row.append(cell);
    }
  }
  document.querySelector("#label")!.textContent = `${v.key} (${v.name})`;
  const f = (n: number) => n.toFixed(1);
  document.querySelector("#state")!.textContent =
    `variant ${v.key}: ${v.name}\n\n` +
    scenarios
      .map((sc) => {
        const r = readArch(sc.t, sc.h, sc.unit, 0, 60);
        return [
          `${sc.t} ${sc.unit}, ${sc.h} %  (${sc.name})`,
          `  scales      ${r.s.tMin}–${r.s.tMax} ${sc.unit}, ${r.s.hMin}–${r.s.hMax} %; comfortable ${r.s.tLo}–${r.s.tHi} ${sc.unit}, ${r.s.hLo}–${r.s.hHi} %`,
          `  angles      temperature ${f(r.tA)}°, humidity ${f(r.hA)}°`,
          `  crossing    ${r.crossing ? `(${f(r.crossing[0])}, ${f(r.crossing[1])})` : "none: needles on one line"}`,
          `  bands       ${r.tBand}, ${r.hBand} → "${r.verdict}"`,
          `  zone        ${r.zone.map((p) => `(${f(p[0])}, ${f(p[1])})`).join(" ")}`,
        ].join("\n");
      })
      .join("\n\n");
  const url = new URL(location.href);
  url.searchParams.set("variant", v.key);
  history.replaceState(null, "", url);
}

function step(d: number) {
  current = (current + d + variants.length) % variants.length;
  render();
}
document.querySelector("#prev")!.addEventListener("click", () => step(-1));
document.querySelector("#next")!.addEventListener("click", () => step(1));
addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") step(-1);
  if (e.key === "ArrowRight") step(1);
});
render();
