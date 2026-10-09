import type { PluginId } from "@/lib/types";

export const WORKSMANAGER_PLANS = ["Core", "Pro"] as const;
export type WorksManagerPlan = (typeof WORKSMANAGER_PLANS)[number];

export type PluginCatalogEntry = {
  id: PluginId;
  name: string;
  vendor: string;
  description: string;
  /** When set, only these plan labels are valid for this product (demo licensing). */
  plans?: readonly WorksManagerPlan[];
};

export function normalizeWorksManagerPlan(plan: string): WorksManagerPlan {
  const stripped = plan.replace(/^WorksManager\s+/i, "").trim();
  if (stripped === "Core" || stripped === "Pro") return stripped;
  if (/pro|advanced/i.test(stripped)) return "Pro";
  return "Core";
}

export const PLUGIN_CATALOG: Record<PluginId, PluginCatalogEntry> = {
  connect: {
    id: "connect",
    name: "Trimble Connect",
    vendor: "Trimble",
    description: "Browse project files and publish designs into downstream workflows.",
  },
  worksmanager: {
    id: "worksmanager",
    name: "WorksManager",
    vendor: "Trimble",
    description: "Manage field designs, projects, and machine-ready deliverables.",
    plans: WORKSMANAGER_PLANS,
  },
  b2westimate: {
    id: "b2westimate",
    name: "B2W Estimate",
    vendor: "Trimble",
    description: "Build and manage construction estimates with integrated takeoff and cost data.",
  },
  autobid: {
    id: "autobid",
    name: "AutoBid",
    vendor: "Trimble",
    description: "Generate, submit, and track competitive bids with automated pricing workflows.",
  },
};

export function listPluginCatalog(): PluginCatalogEntry[] {
  return Object.values(PLUGIN_CATALOG);
}

export function userFacingProducts(pluginIds: PluginId[]): string[] {
  return [...new Set(pluginIds)].map((id) => PLUGIN_CATALOG[id].name);
}

if (import.meta.env.DEV) {
  if (normalizeWorksManagerPlan("WorksManager Advanced") !== "Pro" || normalizeWorksManagerPlan("Core") !== "Core") {
    console.error("normalizeWorksManagerPlan self-check failed");
  }
}
