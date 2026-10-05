import type { Entitlement } from "@/lib/types";
import { DEFAULT_PROMPTS, INTENTS } from "./intents";
import type { AgentContext, AgentUIAction } from "./types";

export function resolveIntent(text: string, context: AgentContext): { assistantText: string; uiAction: AgentUIAction } {
  const intent = INTENTS.find((item) => item.matches(text));
  if (!intent) {
    return { assistantText: "I can help with one of these actions:", uiAction: { type: "suggestions", prompts: DEFAULT_PROMPTS } };
  }
  const entitled = context.entitlements.some((item: Entitlement) => item.pluginId === intent.requiresPlugin && item.active);
  if (!entitled) {
    return {
      assistantText: `You need an active ${intent.requiresPlugin} subscription for that.`,
      uiAction: { type: "entitlement_upsell", pluginId: intent.requiresPlugin, reason: "not_entitled" },
    };
  }
  if (!context.mountedPlugins.has(intent.requiresPlugin)) {
    return {
      assistantText: `Add the ${intent.requiresPlugin} plugin first, then ask again.`,
      uiAction: { type: "entitlement_upsell", pluginId: intent.requiresPlugin, reason: "not_added" },
    };
  }
  return { assistantText: "Here's an interactive view for that request.", uiAction: intent.respond(context) };
}
