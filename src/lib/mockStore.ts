import { createStore } from "solid-js/store";
import entitlementsSeed from "@/mock-data/entitlements.json";
import chatMessagesSeed from "@/mock-data/chat-messages.json";
import connectFilesSeed from "@/mock-data/connect-files.json";
import worksmanagerDesignsSeed from "@/mock-data/worksmanager-designs.json";
import worksmanagerProjectsSeed from "@/mock-data/worksmanager-projects.json";
import { currentUser } from "@/lib/currentUser";
import { resolveIntent } from "@/lib/agent/intentRouter";
import type { ChatMessage } from "@/lib/agent/types";
import type {
  Conversation,
  Design,
  Entitlement,
  PluginId,
  SavedWidget,
  UserPreferences,
  WorksManagerProject,
} from "@/lib/types";

const STORAGE_KEY = "byop-demo-v2";

type Persisted = {
  entitlements: Entitlement[];
  messages: ChatMessage[];
  designs: Design[];
  conversations: Conversation[];
  activeConversationId: string;
  widgets: SavedWidget[];
  preferences: UserPreferences;
};

const defaultPreferences: UserPreferences = { theme: "system", density: "comfortable" };

function buildInitialConversation(messages: ChatMessage[]): { conversations: Conversation[]; activeId: string } {
  const id = "conversation-demo";
  const conversation: Conversation = {
    id,
    title: messages[0]?.text?.slice(0, 48) || "New conversation",
    messageIds: messages.map((m) => m.id),
    createdAt: messages[0]?.createdAt ?? new Date().toISOString(),
    updatedAt: messages.at(-1)?.createdAt ?? new Date().toISOString(),
  };
  return { conversations: [conversation], activeId: id };
}

function migrateFromV1(): Persisted | null {
  try {
    const raw = localStorage.getItem("trimble360-demo-v1");
    if (!raw) return null;
    const old = JSON.parse(raw) as { entitlements: Entitlement[]; messages: ChatMessage[]; designs: Design[] };
    const { conversations, activeId } = buildInitialConversation(old.messages ?? []);
    return {
      entitlements: old.entitlements,
      messages: old.messages,
      designs: old.designs,
      conversations,
      activeConversationId: activeId,
      widgets: [],
      preferences: defaultPreferences,
    };
  } catch {
    return null;
  }
}

function loadPersisted(): Persisted | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Persisted;
  } catch {
    // ignore
  }
  return migrateFromV1();
}

function savePersisted(data: Persisted) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const persisted = loadPersisted();
const initialMessages = (persisted?.messages ?? chatMessagesSeed) as ChatMessage[];
const initialConv =
  persisted?.conversations ??
  buildInitialConversation(initialMessages.length ? initialMessages : []).conversations;

const [state, setState] = createStore({
  entitlements: (persisted?.entitlements ?? entitlementsSeed) as Entitlement[],
  messages: initialMessages,
  designs: (persisted?.designs ?? worksmanagerDesignsSeed) as Design[],
  connectFiles: connectFilesSeed,
  projects: worksmanagerProjectsSeed as WorksManagerProject[],
  conversations: initialConv,
  activeConversationId: persisted?.activeConversationId ?? initialConv[0]?.id ?? "",
  widgets: (persisted?.widgets ?? []) as SavedWidget[],
  preferences: persisted?.preferences ?? defaultPreferences,
});

function snapshot(): Persisted {
  return {
    entitlements: state.entitlements,
    messages: state.messages,
    designs: state.designs,
    conversations: state.conversations,
    activeConversationId: state.activeConversationId,
    widgets: state.widgets,
    preferences: state.preferences,
  };
}

function persist() {
  savePersisted(snapshot());
}

export { state };

export function resetDemoStorage() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem("trimble360-demo-v1");
  const messages = chatMessagesSeed as ChatMessage[];
  const { conversations, activeId } = buildInitialConversation(messages);
  setState({
    entitlements: entitlementsSeed as Entitlement[],
    messages,
    designs: worksmanagerDesignsSeed as Design[],
    conversations,
    activeConversationId: activeId,
    widgets: [],
    preferences: defaultPreferences,
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

export function getActiveConversationId() {
  return state.activeConversationId;
}

export function getActiveConversation() {
  return state.conversations.find((c) => c.id === state.activeConversationId);
}

export function getActiveMessages(): ChatMessage[] {
  const conv = getActiveConversation();
  if (!conv) return [];
  const map = new Map(state.messages.map((m) => [m.id, m]));
  return conv.messageIds.map((id) => map.get(id)).filter(Boolean) as ChatMessage[];
}

export function listConversations() {
  return [...state.conversations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function createConversation() {
  const now = new Date().toISOString();
  const id = `conversation-${Date.now()}`;
  const conversation: Conversation = {
    id,
    title: "New conversation",
    messageIds: [],
    createdAt: now,
    updatedAt: now,
  };
  setState("conversations", (items) => [conversation, ...items]);
  setState("activeConversationId", id);
  persist();
  return conversation;
}

export function selectConversation(id: string) {
  if (!state.conversations.some((c) => c.id === id)) return;
  setState("activeConversationId", id);
  persist();
}

export function renameConversation(id: string, title: string) {
  const index = state.conversations.findIndex((c) => c.id === id);
  if (index < 0) return;
  const trimmed = title.trim();
  if (!trimmed) return;
  setState("conversations", index, "title", trimmed);
  setState("conversations", index, "updatedAt", new Date().toISOString());
  persist();
}

export function deleteConversation(id: string) {
  const conv = state.conversations.find((c) => c.id === id);
  if (!conv) return;
  const removeIds = new Set(conv.messageIds);
  setState("messages", (messages) => messages.filter((m) => !removeIds.has(m.id)));
  setState("conversations", (items) => items.filter((c) => c.id !== id));
  if (state.activeConversationId === id) {
    const next = state.conversations[0]?.id ?? "";
    setState("activeConversationId", next);
    if (!next) createConversation();
  }
  persist();
}

export function searchConversations(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return listConversations();
  return listConversations().filter((c) => c.title.toLowerCase().includes(q));
}

export function sendMessage(text: string, mountedPlugins: PluginId[]) {
  const trimmed = text.trim();
  if (!trimmed) return null;
  let conversationId = state.activeConversationId;
  if (!conversationId || !state.conversations.some((c) => c.id === conversationId)) {
    createConversation();
    conversationId = state.activeConversationId;
  }
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
  const convIndex = state.conversations.findIndex((c) => c.id === conversationId);
  if (convIndex >= 0) {
    const conv = state.conversations[convIndex];
    const title =
      conv.title === "New conversation" ? trimmed.slice(0, 48) : conv.title;
    setState("conversations", convIndex, {
      ...conv,
      title,
      messageIds: [...conv.messageIds, userMessage.id, assistantMessage.id],
      updatedAt: assistantMessage.createdAt,
    });
  }
  persist();
  return { userMessage, assistantMessage };
}

export function saveWidget(input: {
  name: string;
  description: string;
  prompt: string;
  action: string;
  productIds: PluginId[];
}) {
  const now = new Date().toISOString();
  const widget: SavedWidget = {
    id: `widget-${Date.now()}`,
    name: input.name.trim() || "Saved workflow",
    description: input.description,
    prompt: input.prompt,
    action: input.action,
    productIds: input.productIds,
    favorite: false,
    createdAt: now,
    updatedAt: now,
  };
  setState("widgets", (items) => [widget, ...items]);
  persist();
  return widget;
}

export function toggleWidgetFavorite(id: string) {
  const index = state.widgets.findIndex((w) => w.id === id);
  if (index < 0) return;
  setState("widgets", index, "favorite", !state.widgets[index].favorite);
  setState("widgets", index, "updatedAt", new Date().toISOString());
  persist();
}

export function deleteWidget(id: string) {
  setState("widgets", (items) => items.filter((w) => w.id !== id));
  persist();
}

export function setPreferences(next: Partial<UserPreferences>) {
  setState("preferences", (prefs) => ({ ...prefs, ...next }));
  persist();
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

export function publishConnectToWorksManager(input: {
  projectId: string;
  sourceFileIds: string[];
  designName?: string;
}) {
  return createDesign({
    projectId: input.projectId,
    name: input.designName,
    sourceFileIds: input.sourceFileIds,
  });
}
