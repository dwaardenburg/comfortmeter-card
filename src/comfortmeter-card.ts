import { LitElement, css, html, nothing, svg } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { comfortLevel, zoneColour, zoneOf } from "./comfort";
import {
  parseConfig,
  scalesFor,
  stubConfig,
  type ComfortmeterCardConfig,
} from "./config";
import {
  humidityScalePath,
  layoutDial,
  polygonPath,
  temperatureScalePath,
  type Needle,
  type Scales,
  VIEW_BOX,
} from "./dial";
import { configForm } from "./editor";
import { headerLayout, type HeaderLayout } from "./header";
import type { HassEntity, HomeAssistant } from "./home-assistant";
import { icon, mdiThermometer, mdiWaterPercent } from "./icons";
import { readingOf, shownReading } from "./reading";

/**
 * The comfortmeter card: a temperature and a humidity needle on one dial, crossing over
 * the comfort zone. See documents/design/comfortmeter-dial.md.
 */
@customElement("comfortmeter-card")
export class ComfortmeterCard extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: ComfortmeterCardConfig;

  @state() private _headerLayout: HeaderLayout = "inline";

  @query(".header") private _header?: HTMLElement;

  /** Measures the header again when it, or a reading in it, changes size. */
  private _headerObserver = new ResizeObserver(() => this._layOutHeader());

  public setConfig(config: unknown): void {
    this._config = parseConfig(config);
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this._headerObserver.disconnect();
  }

  protected updated(): void {
    const header = this._header;
    if (!header) return;
    this._headerObserver.disconnect();
    this._headerObserver.observe(header);
    for (const reading of header.querySelectorAll(".reading")) {
      this._headerObserver.observe(reading);
    }
    this._layOutHeader();
  }

  /** Chooses the header's layout from the widths its name and readings want. */
  private _layOutHeader(): void {
    const header = this._header;
    if (!header || header.clientWidth === 0) return;
    const style = getComputedStyle(header);
    const width = (selector: string) =>
      header.querySelector(selector)?.getBoundingClientRect().width ?? 0;
    const layout = headerLayout({
      available:
        header.clientWidth -
        parseFloat(style.paddingLeft) -
        parseFloat(style.paddingRight),
      name: header.querySelector(".name")?.scrollWidth ?? 0,
      humidity: width(".reading.humidity"),
      temperature: width(".reading.temperature"),
      gap: parseFloat(style.columnGap),
    });
    if (layout !== this._headerLayout) this._headerLayout = layout;
  }

  /** The masonry view's height, in rows of about 50px. */
  public getCardSize(): number {
    return 6;
  }

  /**
   * The sections view's size: a full section wide and at least half, as the thermostat
   * card, so the comfort level under the dial stays readable; as tall as the dial needs.
   */
  public getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 6 };
  }

  /** The visual editor, drawn by Home Assistant from a form schema. */
  public static getConfigForm() {
    return configForm();
  }

  /** The card picker's first configuration: the first temperature and humidity sensors. */
  public static getStubConfig(hass: HomeAssistant) {
    return stubConfig(hass.states);
  }

  protected render() {
    if (!this._config || !this.hass) return nothing;
    const temperature = this.hass.states[this._config.temperature_entity];
    const humidity = this.hass.states[this._config.humidity_entity];
    let scales: Scales;
    try {
      scales = scalesFor(
        this._config,
        temperature?.attributes.unit_of_measurement
      );
    } catch (error) {
      return html`<ha-card>
        <p class="warning">${(error as Error).message}</p>
      </ha-card>`;
    }
    const readings = {
      temperature: readingOf(temperature),
      humidity: readingOf(humidity),
    };
    const dial = layoutDial(readings, scales, {
      showComfortLimits: this._config.show_comfort_limits,
    });
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
    const hass = this.hass;
    const shown = (entity: HassEntity | undefined) =>
      shownReading(hass, entity);
    return html`
      <ha-card>
        <div class="face">
          <div class="header ${this._headerLayout}">
            <div class="reading humidity">
              ${icon(mdiWaterPercent)}<span>${shown(humidity)}</span>
            </div>
            ${
              this._config.name
                ? html`<div class="name">${this._config.name}</div>`
                : nothing
            }
            <div class="reading temperature">
              ${icon(mdiThermometer)}<span>${shown(temperature)}</span>
            </div>
          </div>
          <svg
            class="dial"
            viewBox=${VIEW_BOX}
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
            ${dial.comfortLimits.map(
              ({ value, at }) =>
                svg`<text class="comfort-limit" x=${at[0]} y=${at[1]}>${value}</text>`
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
        </div>
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
    /* The header and the dial keep the thermostat dial's size on a wide card. */
    .face {
      max-width: 344px;
      margin: 0 auto;
    }
    /* The thermostat card's title row: 8px above and below a 24px line. The readings sit
       at its ends, where the thermostat keeps its more-info button, and keep the row
       when there is no name. The layouts are chosen by headerLayout(). */
    .header {
      display: grid;
      grid-template-columns: auto 1fr auto;
      grid-template-areas: "humidity name temperature";
      align-items: center;
      column-gap: 8px;
      padding: 8px 12px;
      line-height: 24px;
    }
    /* The readings' line takes no height: they hang into the empty corners beside the
       apex, in front of the dial, so the dial keeps its place under the name. */
    .header.stacked {
      grid-template-columns: 1fr 1fr;
      grid-template-areas:
        "name name"
        "humidity temperature";
    }
    .header.stacked .reading {
      position: relative;
      z-index: 1;
      margin-bottom: -24px;
    }
    .header.narrow {
      grid-template-columns: 1fr;
      grid-template-areas:
        "name"
        "humidity"
        "temperature";
    }
    /* As wide as its words, up to its cell, so its scrollWidth is the name's full width. */
    .name {
      grid-area: name;
      justify-self: center;
      max-width: 100%;
      min-width: 0;
      font-size: 16px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .reading {
      display: flex;
      align-items: center;
      gap: 2px;
      white-space: nowrap;
      font-size: 14px;
      color: var(--secondary-text-color);
    }
    .reading.humidity {
      grid-area: humidity;
      justify-self: start;
    }
    .reading.temperature {
      grid-area: temperature;
      justify-self: end;
    }
    .narrow .reading.humidity,
    .narrow .reading.temperature {
      justify-self: center;
    }
    .icon {
      width: 16px;
      height: 16px;
      fill: currentColor;
      flex: none;
    }
    .dial {
      display: block;
      width: 100%;
      /* The thermostat slider's 8px, below the header's 8px. */
      padding: 8px 12px 12px;
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
    .comfort-limit {
      font-size: 11px;
      fill: var(--secondary-text-color);
      text-anchor: middle;
      dominant-baseline: middle;
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
    .warning {
      margin: 0;
      padding: 16px;
      color: var(--error-color);
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
