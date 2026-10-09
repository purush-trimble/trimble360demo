import type { AgentUIAction } from "./types";

export const DEFAULT_PROMPTS = [
  "Publish a Connect design to WorksManager",
  "Create a design",
  "Show my Connect files",
  "Show my designs",
  "Show my devices",
  "Show my B2W estimates",
  "Show my AutoBid bids",
];

type Intent = {
  featureId: string;
  matches: (text: string) => boolean;
  respond: () => AgentUIAction;
};

export const INTENTS: Intent[] = [
  {
    featureId: "publish_to_wm",
    matches: (text) =>
      /\b(publish|push|send)\b/i.test(text) &&
      (/\bconnect\b/i.test(text) || /\bdesign\b/i.test(text) || /\bfile\b/i.test(text)) &&
      (/\bworksmanager\b/i.test(text) || /\bwm\b/i.test(text) || /\bproject\b/i.test(text)),
    respond: () => ({ type: "publish_connect_to_wm" }),
  },
  {
    featureId: "create_vcl_design",
    matches: (text) => /\b(create|new|make)\b.*\bvcl\b.*\bdesign\b|\bvcl\b.*\bdesign\b.*\b(create|new|make)\b/i.test(text),
    respond: () => ({ type: "create_vcl_design" }),
  },
  {
    featureId: "create_design",
    matches: (text) => /\b(create|new|make)\b.*\bdesign\b/i.test(text) && !/\bvcl\b/i.test(text),
    respond: () => ({ type: "create_design", accountId: "wm-demo", suggestedName: "North Ridge imported design" }),
  },
  {
    featureId: "connect_files",
    matches: (text) => /(connect).*(file|browse|list)|\b(list|show|browse)\b.*\bfiles?\b/i.test(text),
    respond: () => ({ type: "connect_file_browser", accountId: "connect-demo" }),
  },
  {
    featureId: "wm_designs",
    matches: (text) => /\b(show|list|view|need|want|display)\b.*\b(project\s+)?designs?\b/i.test(text),
    respond: () => ({ type: "worksmanager_design_list", accountId: "wm-demo" }),
  },
  {
    featureId: "wm_devices",
    matches: (text) => /\b(show|list|view|need|want|display)\b.*\b(project\s+)?(devices?|equipment)\b/i.test(text),
    respond: () => ({ type: "device_management" }),
  },
  {
    featureId: "b2w_estimates",
    matches: (text) =>
      /(show|list|view).*\b(estimates?|b2w)\b|\b(b2w|estimate)\b.*(show|list|view)/i.test(text),
    respond: () => ({ type: "b2westimate_list", accountId: "b2w-demo" }),
  },
  {
    featureId: "autobid_bids",
    matches: (text) =>
      /(show|list|view).*\b(bids?|autobid)\b|\b(autobid|bids?)\b.*(show|list|view)/i.test(text),
    respond: () => ({ type: "autobid_list", accountId: "autobid-demo" }),
  },
];
