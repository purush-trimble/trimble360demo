import { defineCustomElements } from "@trimble-oss/moduswebcomponents/loader";

let initialized = false;

export function initModus() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  defineCustomElements();
}
