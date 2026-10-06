import type { AgentContext, AgentUIAction } from "./types";

export const DEFAULT_PROMPTS = [
  "Publish a Connect design to WorksManager",
  "Create a design",
  "Show my Connect files",
  "Show my designs",
];

type Intent = {
  requiresPlugins: ("connect" | "worksmanager")[];
  matches: (text: string) => boolean;
  respond: (_context: AgentContext) => AgentUIAction;
};

export const INTENTS: Intent[] = [
  {
    requiresPlugins: ["connect", "worksmanager"],
    matches: (text) =>
      /\b(publish|push|send)\b/i.test(text) &&
      (/\bconnect\b/i.test(text) || /\bdesign\b/i.test(text) || /\bfile\b/i.test(text)) &&
      (/\bworksmanager\b/i.test(text) || /\bwm\b/i.test(text) || /\bproject\b/i.test(text)),
    respond: () => ({
      type: "publish_connect_to_wm",
      connectAccountId: "connect-demo",
      wmAccountId: "wm-demo",
    }),
  },
  {
    requiresPlugins: ["worksmanager"],
    matches: (text) => /\b(create|new|make)\b.*\bdesign\b/i.test(text),
    respond: () => ({ type: "create_design", accountId: "wm-demo", suggestedName: "North Ridge imported design" }),
  },
  {
    requiresPlugins: ["connect"],
    matches: (text) => /(connect).*(file|browse|list)|\b(list|show|browse)\b.*\bfiles?\b/i.test(text),
    respond: () => ({ type: "connect_file_browser", accountId: "connect-demo" }),
  },
  {
    requiresPlugins: ["worksmanager"],
    matches: (text) => /(show|list|worksmanager).*\bdesigns?\b/i.test(text),
    respond: () => ({ type: "worksmanager_design_list", accountId: "wm-demo" }),
  },
];
