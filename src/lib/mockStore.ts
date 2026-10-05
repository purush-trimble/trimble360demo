import { createStore } from "solid-js/store";
import entitlementsSeed from "@/mock-data/entitlements.json";
import chatMessagesSeed from "@/mock-data/chat-messages.json";
import connectFilesSeed from "@/mock-data/connect-files.json";
import worksmanagerDesignsSeed from "@/mock-data/worksmanager-designs.json";
import worksmanagerProjectsSeed from "@/mock-data/worksmanager-projects.json";
import { currentUser } from "@/lib/currentUser";
import { resolveIntent } from "@/lib/agent/intentRouter";
import type { ChatMessage } from "@/lib/agent/types";
import type { Design, Entitlement, PluginId, WorksManagerProject } from "@/lib/types";

const STORAGE_KEY = "trimble360-demo-v1";

type Persisted = {
  entitlements: Entitlement[];
  messages: ChatMessage[];
  designs: Design[];
};

function loadPersisted(): Persisted | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Persisted;
  } catch {
    return null;
  }
}

function savePersisted(state: Persisted) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const persisted = loadPersisted();

const [state, setState] = createStore({
  entitlements: (persisted?.entitlements ?? entitlementsSeed) as Entitlement[],
  messages: (persisted?.messages ?? chatMessagesSeed) as ChatMessage[],
  designs: (persisted?.designs ?? worksmanagerDesignsSeed) as Design[],
  connectFiles: connectFilesSeed,
  projects: worksmanagerProjectsSeed as WorksManagerProject[],
});

function persist() {
  savePersisted({
    entitlements: state.entitlements,
    messages: state.messages,
    designs: state.designs,
  });
}

export { state };

export function resetDemoStorage() {
  localStorage.removeItem(STORAGE_KEY);
  setState({
    entitlements: entitlementsSeed as Entitlement[],
    messages: chatMessagesSeed as ChatMessage[],
    designs: worksmanagerDesignsSeed as Design[],
  });
}

export function getEntitlements() {
  return state.entitlements.filter((item) => item.userId === currentUser.id);
}

export function toggleEntitlement(pluginId: PluginId) {
  const index = state.entitlements.findIndex((item) => item.userId === currentUser.id && item.pluginId === pluginId);
  if (index < 0) return null;
  const next = { ...state.entitlements[index], active: !state.entitlements[index].active };
  setState("entitlements", index, next);
  persist();
  return next;
}

export function getMessages() {
  return state.messages;
}

export function sendMessage(text: string, mountedPlugins: PluginId[]) {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const entitlements = getEntitlements();
  const result = resolveIntent(trimmed, {
    mountedPlugins: new Set(mountedPlugins),
    entitlements,
  });
  const now = new Date().toISOString();
  const userMessage: ChatMessage = { id: `message-${Date.now()}`, role: "user", text: trimmed, createdAt: now };
  const assistantMessage: ChatMessage = {
    id: `message-${Date.now()}-assistant`,
    role: "assistant",
    text: result.assistantText,
    uiAction: result.uiAction,
    createdAt: new Date().toISOString(),
  };
  setState("messages", (messages) => [...messages, userMessage, assistantMessage]);
  persist();
  return { userMessage, assistantMessage };
}

export function getConnectFiles(accountId: string) {
  return state.connectFiles.filter((file) => file.accountId === accountId);
}

export function getProjects(accountId: string) {
  return state.projects.filter((project) => project.accountId === accountId);
}

export function getDesigns(projectId: string) {
  return state.designs.filter((design) => design.projectId === projectId);
}

export function createDesign(input: { projectId: string; name?: string; sourceFileIds: string[] }) {
  const design: Design = {
    id: `design-${Date.now()}`,
    projectId: input.projectId,
    name: input.name?.trim() || "Imported Connect design",
    sourceFileIds: input.sourceFileIds,
    status: "Ready",
    createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  };
  setState("designs", (designs) => [...designs, design]);
  persist();
  return design;
}
