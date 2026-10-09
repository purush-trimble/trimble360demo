import { INTENTS } from "./intents";
import type { AgentUIAction } from "./types";

export function resolveIntent(text: string): { assistantText: string; uiAction?: AgentUIAction } {
  const intent = INTENTS.find((item) => item.matches(text));
  // ponytail: demo fallback — any unmatched prompt renders publish panel; swap back to suggestions for real routing
  if (!intent) {
    return {
      assistantText: "Here's how to publish a Trimble Connect design to your WorksManager devices.",
      uiAction: { type: "publish_connect_to_wm" },
    };
  }

  return {
    assistantText: "Here's an interactive view for that request.",
    uiAction: intent.respond(),
  };
}

if (import.meta.env.DEV) {
  const vcl = resolveIntent("create a vcl design");
  const design = resolveIntent("create a design");
  const designs = resolveIntent("show my designs");
  if (vcl.uiAction?.type !== "create_vcl_design" || design.uiAction?.type !== "create_vcl_design" || designs.uiAction?.type !== "worksmanager_design_list") {
    console.error("resolveIntent self-check failed");
  }
}
