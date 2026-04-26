// A-Frame attaches itself to window. Declare the surface we use.
// Loose typing on purpose — A-Frame's component API is dynamic and the
// upstream @types/aframe package lags real releases.
export {};

declare global {
  interface Window {
    AFRAME?: {
      registerComponent: (name: string, def: unknown) => void;
      [key: string]: unknown;
    };
  }
}
