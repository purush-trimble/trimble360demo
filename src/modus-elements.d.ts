import type { JSX as SolidJSX } from "solid-js";

type ModusAttrs = {
  class?: string;
  variant?: string;
  disabled?: boolean;
  initials?: string;
  children?: SolidJSX.Element;
};

type ModusEventHandlers = {
  "on:buttonClick"?: (event: CustomEvent) => void;
  "on:inputChange"?: (event: CustomEvent) => void;
};

declare module "solid-js" {
  namespace JSX {
    interface IntrinsicElements {
      "modus-wc-button": ModusAttrs &
        ModusEventHandlers & {
          type?: "button" | "submit" | "reset";
          color?: string;
          "full-width"?: boolean;
        };
      "modus-wc-card": ModusAttrs & {
        bordered?: boolean;
        padding?: "compact" | "comfortable";
      };
      "modus-wc-avatar": ModusAttrs;
      "modus-wc-navbar": ModusAttrs;
      "modus-wc-text-input": ModusAttrs &
        ModusEventHandlers & {
          label?: string;
          type?: "email" | "password" | "search" | "tel" | "text" | "url";
          name?: string;
          placeholder?: string;
          required?: boolean;
          autocomplete?: string;
          value?: string;
        };
      "modus-wc-checkbox": ModusAttrs &
        ModusEventHandlers & {
          label?: string;
          name?: string;
          value?: boolean;
        };
      "modus-wc-alert": ModusAttrs & {
        "alert-title"?: string;
        "alert-description"?: string;
        role?: string;
      };
      "modus-wc-logo": ModusAttrs & {
        name?: string;
        emblem?: boolean;
        alt?: string;
        "custom-class"?: string;
      };
    }
  }
}

export {};
