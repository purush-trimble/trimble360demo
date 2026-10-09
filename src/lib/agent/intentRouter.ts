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

export function resolveIntent(text: string, context: AgentContext): { assistantText: string; uiAction?: AgentUIAction } {
  const intent = INTENTS.find((item) => item.matches(text));
  // ponytail: demo fallback — any unmatched prompt renders publish panel; swap back to suggestions for real routing
  if (!intent) {
    const fallback = INTENTS.find((item) => item.featureId === "publish_to_wm");
    if (context.allowedFeatureIds && fallback && !context.allowedFeatureIds.has(fallback.featureId)) {
      return {
        assistantText: "I did not recognize that. Use one of the quick actions below — they match your work profile.",
      };
    }
    return {
      assistantText: "Here's how to publish a Trimble Connect design to your WorksManager devices.",
      uiAction: { type: "publish_connect_to_wm" },
    };
  }

  if (context.allowedFeatureIds && !context.allowedFeatureIds.has(intent.featureId)) {
    return {
      assistantText: "That action is not part of your current work profile. Open Work profiles to add it, or use one of the quick actions below.",
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
