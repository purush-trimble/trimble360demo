import type { PluginId } from "@/lib/types";

export const WORKSMANAGER_PLANS = ["Core", "Pro"] as const;
export type WorksManagerPlan = (typeof WORKSMANAGER_PLANS)[number];

export type PluginCatalogEntry = {
  id: PluginId;
  name: string;
  vendor: string;
  description: string;
  requiresFchid: boolean;
  fchidHint: string;
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
    requiresFchid: true,
    fchidHint: "Enter your Trimble Connect federation ID (FCHID), e.g. FCHID-ACME-88442211",
  },
  worksmanager: {
    id: "worksmanager",
    name: "WorksManager",
    vendor: "Trimble",
    description: "Manage field designs, projects, and machine-ready deliverables.",
    requiresFchid: true,
    fchidHint: "Enter your WorksManager federation ID (FCHID) from Admin → Integrations.",
    plans: WORKSMANAGER_PLANS,
  },
  b2westimate: {
    id: "b2westimate",
    name: "B2W Estimate",
    vendor: "Trimble",
    description: "Build and manage construction estimates with integrated takeoff and cost data.",
    requiresFchid: true,
    fchidHint: "Enter your B2W Estimate federation ID (FCHID) from Admin → Integrations.",
  },
  autobid: {
    id: "autobid",
    name: "AutoBid",
    vendor: "Trimble",
    description: "Generate, submit, and track competitive bids with automated pricing workflows.",
    requiresFchid: true,
    fchidHint: "Enter your AutoBid federation ID (FCHID) from Admin → Integrations.",
  },
};

export function listPluginCatalog(): PluginCatalogEntry[] {
  return Object.values(PLUGIN_CATALOG);
}

export function userFacingProducts(pluginIds: PluginId[]): string[] {
  return [...new Set(pluginIds)].map((id) => PLUGIN_CATALOG[id].name);
}

/** ponytail: naive format check; upgrade path = real Trimble identity API */
export function validateFchid(raw: string): { ok: true; value: string } | { ok: false; message: string } {
  const value = raw.trim();
  if (!value) return { ok: false, message: "FCHID is required to connect this plugin." };
  if (value.length < 12) return { ok: false, message: "FCHID looks too short. Check the value from your admin console." };
  if (/invalid|error|0000/i.test(value)) return { ok: false, message: "This FCHID could not be verified. Try another ID." };
  return { ok: true, value };
}

if (import.meta.env.DEV) {
  const sample = validateFchid("FCHID-DEMO-88442211");
  const empty = validateFchid("");
  if (!sample.ok || empty.ok) console.error("validateFchid self-check failed");
  if (normalizeWorksManagerPlan("WorksManager Advanced") !== "Pro" || normalizeWorksManagerPlan("Core") !== "Core") {
    console.error("normalizeWorksManagerPlan self-check failed");
  }
}
