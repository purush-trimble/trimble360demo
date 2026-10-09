import type { PluginId } from "@/lib/types";
import { currentUser } from "@/lib/currentUser";
import { getEntitlements } from "@/lib/mockStore";
import { userFacingProducts } from "@/lib/pluginCatalog";

export type WelcomeWorkflow = {
  id: string;
  title: string;
  description: string;
  widgetId: string;
  productIds: PluginId[];
};

export const WELCOME_WORKFLOWS: WelcomeWorkflow[] = [
  {
    id: "create-design",
    title: "Create a design",
    description: "Turn your project files into a machine-ready design.",
    widgetId: "design-to-field",
    productIds: ["worksmanager"],
  },
  {
    id: "create-vcl-design",
    title: "Create a VCL design",
    description: "Import a VCL file and prepare it for the right project, medium, and device.",
    widgetId: "vcl-design",
    productIds: ["worksmanager"],
  },
];

const welcomeKey = (userId: string) => `trimble360-welcomed-${userId}`;

export function hasSeenWelcome(userId = currentUser.id) {
  try {
    return localStorage.getItem(welcomeKey(userId)) === "1";
  } catch {
    return false;
  }
}

export function markWelcomed(userId = currentUser.id) {
  try {
    localStorage.setItem(welcomeKey(userId), "1");
  } catch {
    // The in-memory route still works if storage is unavailable.
  }
}

export function clearWelcomeState() {
  try {
    for (const user of ["demo1", "demo2"]) localStorage.removeItem(welcomeKey(user));
  } catch {
    // Ignore storage failures during demo reset.
  }
}

export function availableWelcomeWorkflows() {
  const licensed = new Set(getEntitlements().filter((item) => item.active).map((item) => item.pluginId));
  return WELCOME_WORKFLOWS.filter((workflow) => workflow.productIds.every((id) => licensed.has(id)));
}

export function productLabelsForWelcome(workflow: WelcomeWorkflow) {
  const licensed = new Set(getEntitlements().filter((item) => item.active).map((item) => item.pluginId));
  return userFacingProducts(workflow.productIds.filter((id) => licensed.has(id)));
}

if (import.meta.env.DEV) {
  if (!WELCOME_WORKFLOWS.some((workflow) => workflow.id === "create-design")) {
    console.error("welcome workflow self-check failed");
  }
}
