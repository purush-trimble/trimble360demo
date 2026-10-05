/* @refresh reload */
import { render } from "solid-js/web";
import "./index.css";
import App from "./App.tsx";
import { initModus } from "./modus-init";
import { resetDemoStorage } from "./lib/mockStore";

initModus();

if (new URLSearchParams(window.location.search).has("reset")) {
  resetDemoStorage();
  window.history.replaceState({}, "", window.location.pathname);
}

const root = document.getElementById("root");
render(() => <App />, root!);
