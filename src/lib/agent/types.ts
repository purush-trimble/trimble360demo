import type { PluginId, Entitlement } from "@/lib/types";

export type AgentUIAction =
  | { type: "create_design"; accountId: string; suggestedName?: string }
  | { type: "connect_file_browser"; accountId: string }
  | { type: "worksmanager_design_list"; accountId: string }
  | { type: "b2westimate_list"; accountId: string }
  | { type: "autobid_list"; accountId: string }
  | { type: "publish_connect_to_wm"; connectAccountId: string; wmAccountId: string }
  | { type: "entitlement_upsell"; pluginId: PluginId; reason: "not_entitled" | "not_added" }
  | { type: "suggestions"; prompts: string[] }
  | { type: "text"; message: string };

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  uiAction?: AgentUIAction;
  createdAt: string;
}

export interface AgentContext {
  mountedPlugins: Set<PluginId>;
  entitlements: Entitlement[];
}
