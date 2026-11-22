// jsdom has no ResizeObserver, which every browser Home Assistant supports has. The card
// only uses it to measure its header, and jsdom lays nothing out, so a stand-in that
// never calls back is enough.
const nothingToObserve = () => undefined;
globalThis.ResizeObserver ??= class {
  observe = nothingToObserve;
  unobserve = nothingToObserve;
  disconnect = nothingToObserve;
};
