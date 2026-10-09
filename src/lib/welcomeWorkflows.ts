import type { PluginId } from "@/lib/types";
import { currentUser, demoUsers } from "@/lib/currentUser";
import { userFacingProducts } from "@/lib/pluginCatalog";

export type WelcomeWorkflow = {
  id: string;
  title: string;
  description: string;
  widgetId?: string;
  /** Opens the existing saved dashboard widget with this action instead of building one. */
  savedAction?: string;
  productIds: PluginId[];
};

export const WELCOME_WORKFLOWS: WelcomeWorkflow[] = [
  {
    id: "project-designs",
    title: "Project designs",
    description: "View the designs in your WorksManager project.",
    savedAction: "worksmanager_design_list",
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
    for (const user of demoUsers) localStorage.removeItem(welcomeKey(user.id));
  } catch {
    // Ignore storage failures during demo reset.
  }
}

export function availableWelcomeWorkflows() {
  return WELCOME_WORKFLOWS;
}

export function productLabelsForWelcome(workflow: WelcomeWorkflow) {
  return userFacingProducts(workflow.productIds);
}

if (import.meta.env.DEV) {
  if (!WELCOME_WORKFLOWS.some((workflow) => workflow.id === "project-designs")) {
    console.error("welcome workflow self-check failed");
  }
}
