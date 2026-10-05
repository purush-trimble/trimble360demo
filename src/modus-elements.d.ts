import type { JSX as SolidJSX } from "solid-js";

type ModusAttrs = {
  class?: string;
  variant?: string;
  disabled?: boolean;
  initials?: string;
  children?: SolidJSX.Element;
};

declare module "solid-js" {
  namespace JSX {
    interface IntrinsicElements {
      "modus-wc-button": ModusAttrs & { "on:buttonClick"?: (event: CustomEvent) => void };
      "modus-wc-card": ModusAttrs;
      "modus-wc-avatar": ModusAttrs;
      "modus-wc-navbar": ModusAttrs;
    }
  }
}

export {};
