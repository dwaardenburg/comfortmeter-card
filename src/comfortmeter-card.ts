import { LitElement, css, html, nothing, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { comfortLevel, zoneColour, zoneOf } from "./comfort";
import { parseConfig, type ComfortmeterCardConfig } from "./config";
import {
  defaultScales,
  humidityScalePath,
  layoutDial,
  polygonPath,
  temperatureScalePath,
  type Needle,
} from "./dial";
import type { HassEntity, HomeAssistant } from "./home-assistant";

/**
 * The comfortmeter card: a temperature and a humidity needle on one dial, crossing over
 * the comfort zone. See documents/design/comfortmeter-dial.md.
 */
@customElement("comfortmeter-card")
export class ComfortmeterCard extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: ComfortmeterCardConfig;

  public setConfig(config: unknown): void {
    this._config = parseConfig(config);
  }

  public getCardSize(): number {
    return 3;
  }

  protected render() {
    if (!this._config || !this.hass) return nothing;
    const temperature = this.hass.states[this._config.temperature_entity];
    const humidity = this.hass.states[this._config.humidity_entity];
    const scales = defaultScales(temperature?.attributes.unit_of_measurement);
    const readings = {
      temperature: numberOf(temperature),
      humidity: numberOf(humidity),
    };
    const dial = layoutDial(readings, scales);
    const zone =
      readings.temperature !== undefined && readings.humidity !== undefined
        ? zoneOf(
            {
              temperature: readings.temperature,
              humidity: readings.humidity,
            },
            scales
          )
        : undefined;
    const level = zone ? comfortLevel(zone) : undefined;
    return html`
      <ha-card>
        <svg
          class="dial"
          viewBox="0 30 320 296"
          role="img"
          aria-label=${level ?? "Comfortmeter"}
        >
          <g class="scales">
            <path class="scale" d=${temperatureScalePath()} />
            <path class="scale" d=${humidityScalePath()} />
          </g>
          ${dial.bandLines.map(
            ({ pivot, end }) =>
              svg`<line class="band-line" x1=${pivot[0]} y1=${pivot[1]} x2=${end[0]} y2=${end[1]} />`
          )}
          <path class="comfort-zone" d=${polygonPath(dial.comfortZone)} />
          ${needles(dial.temperatureNeedle, dial.humidityNeedle)}
          ${
            dial.crossing && zone
              ? svg`<circle class="crossing-ring" cx=${dial.crossing[0]} cy=${dial.crossing[1]} r="7" />
                <circle class="crossing" cx=${dial.crossing[0]} cy=${dial.crossing[1]} r="6"
                  style=${`fill: ${zoneColour(zone)}`} />`
              : nothing
          }
          ${
            level
              ? svg`<text class="comfort-level" x="160" y="316">${level}</text>`
              : nothing
          }
        </svg>
      </ha-card>
    `;
  }

  static styles = css`
    :host {
      /* The needles' colour: the primary text colour at 75 %, mixed solid against the
         card so the needles don't darken where they cross. */
      --comfortmeter-needle-color: color-mix(
        in srgb,
        var(--primary-text-color) 75%,
        var(--card-background-color, white)
      );
    }
    .dial {
      display: block;
      width: 100%;
      padding: 0 12px 12px;
      box-sizing: border-box;
    }
    /* One group opacity, so the scales don't darken where they overlap at the apex. */
    .scales {
      opacity: 0.3;
    }
    .scale {
      fill: none;
      stroke: var(--control-circular-slider-background, var(--disabled-color));
      stroke-width: 24;
      stroke-linecap: round;
    }
    .band-line {
      stroke: var(--secondary-text-color);
      stroke-width: 1;
      opacity: 0.3;
    }
    .comfort-zone {
      fill: var(--success-color);
      fill-opacity: 0.3;
      stroke: var(--success-color);
      stroke-width: 1.5;
      stroke-linejoin: round;
    }
    .needle {
      stroke: var(--comfortmeter-needle-color);
      stroke-width: 2;
      stroke-linecap: round;
    }
    /* A hollow ring, so a pivot never looks like a marker in either theme. */
    .pivot {
      fill: var(--card-background-color);
      stroke: var(--comfortmeter-needle-color);
      stroke-width: 2;
    }
    /* The crossing's ring is in the needles' colour, like the pivots, so the crossing
       reads as a joint of the needles; its dot takes the zone's colour. */
    .marker,
    .crossing-ring {
      fill: var(--comfortmeter-needle-color);
    }
    /* Under the base, where the needles never reach. */
    .comfort-level {
      text-anchor: middle;
      font-size: 14px;
      font-weight: 500;
      fill: var(--primary-text-color);
    }
  `;
}

/**
 * The needles, then their pivots and markers on top, so a needle lying along the base
 * never covers the other needle's pivot. A needle whose reading is missing is left out.
 */
function needles(
  temperature: Needle | undefined,
  humidity: Needle | undefined
) {
  const shown: [string, Needle][] = [];
  if (temperature) shown.push(["temperature", temperature]);
  if (humidity) shown.push(["humidity", humidity]);
  return svg`
    ${shown.map(
      ([scale, { pivot, marker }]) =>
        svg`<line class="needle ${scale}" x1=${pivot[0]} y1=${pivot[1]} x2=${marker[0]} y2=${marker[1]} />`
    )}
    ${shown.map(
      ([, { pivot }]) =>
        svg`<circle class="pivot" cx=${pivot[0]} cy=${pivot[1]} r="4" />`
    )}
    ${shown.map(
      ([, { marker }]) =>
        svg`<circle class="marker" cx=${marker[0]} cy=${marker[1]} r="5" />`
    )}
  `;
}

function numberOf(entity: HassEntity | undefined): number | undefined {
  const reading = Number.parseFloat(entity?.state ?? "");
  return Number.isFinite(reading) ? reading : undefined;
}

declare global {
  interface HTMLElementTagNameMap {
    "comfortmeter-card": ComfortmeterCard;
  }
  interface Window {
    customCards?: { type: string; name: string; description: string }[];
  }
}

window.customCards ??= [];
window.customCards.push({
  type: "comfortmeter-card",
  name: "Comfortmeter",
  description:
    "Temperature and humidity as two crossing needles over a comfort zone.",
});
