import type { PluginId } from "@/lib/types";

export type PluginCatalogEntry = {
  id: PluginId;
  name: string;
  vendor: string;
  description: string;
  requiresFchid: boolean;
  fchidHint: string;
};

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
  },
};

export function listPluginCatalog(): PluginCatalogEntry[] {
  return Object.values(PLUGIN_CATALOG);
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
}
