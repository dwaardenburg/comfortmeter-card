// The card's preview page, for development only: a stand-in `ha-card` and thermostat
// card, and the built card at a set of readings, in Home Assistant's light and dark
// themes, and the edge cases in preview/scenarios.ts. Every change to how the card looks
// is checked here.
import { LitElement, css, html, svg } from "lit";
import type { HomeAssistant } from "../src/home-assistant";
import {
  captionFor,
  configFor,
  edgeCases,
  hassFor,
  looks,
  type Scenario,
} from "./scenarios";

/** A stand-in for Home Assistant's own `ha-card`, which only exists inside the frontend. */
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

const mdiThermometer =
  "M15 13V5A3 3 0 0 0 9 5V13A5 5 0 1 0 15 13M12 4A1 1 0 0 1 13 5V8H11V5A1 1 0 0 1 12 4Z";

/** A point on the thermostat's 270° arc, at an SVG angle (0° right, clockwise). */
function arcPoint(deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [160 + 145 * Math.cos(rad), 160 + 145 * Math.sin(rad)];
}

/** A stand-in for Home Assistant's thermostat card, drawn with its numbers. */
class ThermostatStandIn extends LitElement {
  render() {
    const end = 135 + (270 * (21.5 - 7)) / 28;
    const [hx, hy] = arcPoint(end);
    const [sx, sy] = arcPoint(135);
    const [ex, ey] = arcPoint(45);
    const [cx, cy] = arcPoint(135 + (270 * (25 - 7)) / 28);
    return html`<ha-card>
      <div class="name">Living room</div>
      <div class="wrap">
        <svg viewBox="0 0 320 320">
          ${svg`<path class="track" d="M${sx} ${sy} A145 145 0 1 1 ${ex} ${ey}" />
          <path class="value" d="M${sx} ${sy} A145 145 0 ${end - 135 > 180 ? 1 : 0} 1 ${hx} ${hy}" />
          <circle class="current" cx=${cx} cy=${cy} r="4" />
          <circle cx=${hx} cy=${hy} r="9" fill="white" />
          <circle cx=${hx} cy=${hy} r="6" fill="var(--state-climate-heat-color)" />`}
        </svg>
        <div class="middle">
          <div class="label">Heat</div>
          <div class="big">
            21<span class="sup"><span>.5</span><span>°C</span></span>
          </div>
          <div class="secondary">
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d=${mdiThermometer} />
            </svg>
            25 °C
          </div>
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

type CardElement = HTMLElement & {
  setConfig(config: unknown): void;
  hass: HomeAssistant;
};

/** A cell with the card in a scenario, or the error its configuration throws. */
function cellFor(scenario: Scenario): HTMLElement {
  const cell = document.createElement("div");
  cell.className = "cell";
  if (scenario.width) cell.style.width = `${scenario.width}px`;
  const card = document.createElement("comfortmeter-card") as CardElement;
  try {
    card.setConfig(configFor(scenario));
    card.hass = hassFor(scenario);
    cell.append(card);
  } catch (error) {
    const rejected = document.createElement("p");
    rejected.className = "rejected";
    rejected.textContent = `setConfig: ${(error as Error).message}`;
    cell.append(rejected);
  }
  const caption = document.createElement("p");
  caption.textContent = captionFor(scenario);
  cell.append(caption);
  return cell;
}

function render() {
  for (const theme of ["light", "dark"]) {
    const looksRow = document.querySelector(`#${theme} .looks`);
    const edgeRow = document.querySelector(`#${theme} .edge`);
    if (!looksRow || !edgeRow) continue;
    const stand = document.createElement("div");
    stand.className = "cell";
    stand.innerHTML = `<thermostat-stand-in></thermostat-stand-in><p>thermostat stand-in</p>`;
    looksRow.append(stand);
    looksRow.append(...looks.map(cellFor));
    edgeRow.append(...edgeCases.map(cellFor));
  }
}

customElements.whenDefined("comfortmeter-card").then(render);
