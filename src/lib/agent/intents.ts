import type { AgentContext, AgentUIAction } from "./types";

export const DEFAULT_PROMPTS = ["Create a design", "Show my Connect files", "Show my designs"];

type Intent = {
  requiresPlugin: "connect" | "worksmanager";
  matches: (text: string) => boolean;
  respond: (context: AgentContext) => AgentUIAction;
};

export const INTENTS: Intent[] = [
  {
    requiresPlugin: "worksmanager",
    matches: (text) => /\b(create|new|make)\b.*\bdesign\b/i.test(text),
    respond: () => ({ type: "create_design", accountId: "wm-demo", suggestedName: "North Ridge imported design" }),
  },
  {
    requiresPlugin: "connect",
    matches: (text) => /(connect).*(file|browse|list)|\b(list|show|browse)\b.*\bfiles?\b/i.test(text),
    respond: () => ({ type: "connect_file_browser", accountId: "connect-demo" }),
  },
  {
    requiresPlugin: "worksmanager",
    matches: (text) => /(show|list|worksmanager).*\bdesigns?\b/i.test(text),
    respond: () => ({ type: "worksmanager_design_list", accountId: "wm-demo" }),
  },
];
