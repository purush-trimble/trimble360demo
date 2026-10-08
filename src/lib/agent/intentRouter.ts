import type { Entitlement, PluginId } from "@/lib/types";
import { PLUGIN_CATALOG } from "@/lib/pluginCatalog";
import { INTENTS } from "./intents";
import type { AgentContext, AgentUIAction } from "./types";

function isEntitled(entitlements: Entitlement[], pluginId: PluginId) {
  return entitlements.some((item) => item.pluginId === pluginId && item.active);
}

function upsellFor(pluginId: PluginId, reason: "not_entitled" | "not_added"): AgentUIAction {
  return { type: "entitlement_upsell", pluginId, reason };
}

export function resolveIntent(text: string, context: AgentContext): { assistantText: string; uiAction: AgentUIAction } {
  const intent = INTENTS.find((item) => item.matches(text));
  // ponytail: demo fallback — any unmatched prompt renders the publish widget; swap back to suggestions for real routing
  if (!intent) {
    return {
      assistantText: "Here's a widget to publish a Trimble Connect design to your WorksManager devices.",
      uiAction: { type: "publish_connect_to_wm" },
    };
  }

  for (const pluginId of intent.requiresPlugins) {
    if (!isEntitled(context.entitlements, pluginId)) {
      return {
        assistantText: `You need an active ${pluginId} subscription for that workflow.`,
        uiAction: upsellFor(pluginId, "not_entitled"),
      };
    }
    if (!context.mountedPlugins.has(pluginId)) {
      return {
        assistantText: `Add ${PLUGIN_CATALOG[pluginId]?.name ?? pluginId} from your licensed products, then ask again.`,
        uiAction: upsellFor(pluginId, "not_added"),
      };
    }
  }

  return {
    assistantText: "Here's an interactive view for that request.",
    uiAction: intent.respond(context),
  };
}
