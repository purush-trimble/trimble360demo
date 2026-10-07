import { createStore } from "solid-js/store";
import entitlementsSeed from "@/mock-data/entitlements.json";
import chatMessagesSeed from "@/mock-data/chat-messages.json";
import connectFilesSeed from "@/mock-data/connect-files.json";
import worksmanagerDesignsSeed from "@/mock-data/worksmanager-designs.json";
import worksmanagerProjectsSeed from "@/mock-data/worksmanager-projects.json";
import b2wEstimatesSeed from "@/mock-data/b2w-estimates.json";
import autobidsSeed from "@/mock-data/autobids.json";
import { currentUser } from "@/lib/currentUser";
import { resolveIntent } from "@/lib/agent/intentRouter";
import type { ChatMessage } from "@/lib/agent/types";
import { normalizeWorksManagerPlan, validateFchid } from "@/lib/pluginCatalog";
import type {
  Conversation,
  Design,
  Entitlement,
  PluginConnection,
  PluginId,
  SavedWidget,
  UserPreferences,
  AutoBid,
  B2wEstimate,
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
  pluginConnections: PluginConnection[];
};

const defaultPreferences: UserPreferences = { theme: "system", density: "comfortable", pluginsMenuVisible: true };

function defaultPluginConnections(): PluginConnection[] {
  const now = new Date().toISOString();
  return [
    {
      pluginId: "connect",
      status: "connected",
      fchid: "FCHID-DEMO-88442211",
      connectedAt: now,
      updatedAt: now,
    },
    {
      pluginId: "worksmanager",
      status: "disconnected",
      updatedAt: now,
    },
    {
      pluginId: "b2westimate",
      status: "disconnected",
      updatedAt: now,
    },
    {
      pluginId: "autobid",
      status: "disconnected",
      updatedAt: now,
    },
  ];
}

function normalizePreferences(prefs: Partial<UserPreferences> | undefined): UserPreferences {
  return {
    theme: prefs?.theme ?? defaultPreferences.theme,
    density: prefs?.density ?? defaultPreferences.density,
    pluginsMenuVisible: prefs?.pluginsMenuVisible ?? defaultPreferences.pluginsMenuVisible,
  };
}

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
      pluginConnections: defaultPluginConnections(),
    };
  } catch {
    return null;
  }
}

function migratePluginId(id: string): PluginId {
  if (id === "workorders") return "b2westimate";
  return id as PluginId;
}

function normalizeEntitlementRow(e: Entitlement): Entitlement {
  const pluginId = migratePluginId(e.pluginId as string);
  const plan = pluginId === "worksmanager" ? normalizeWorksManagerPlan(e.plan) : e.plan;
  const subscriptionAccountId = e.pluginId === "workorders" ? "b2w-demo" : e.subscriptionAccountId;
  return { ...e, pluginId, plan, subscriptionAccountId };
}

/** ponytail: O(n²) scan; upgrade path = versioned persist blob + single migration */
function mergeEntitlementsFromSeed(stored: Entitlement[]): Entitlement[] {
  const seed = entitlementsSeed as Entitlement[];
  const merged = [...stored];
  for (const row of seed) {
    if (!merged.some((e) => e.userId === row.userId && e.pluginId === row.pluginId)) merged.push(row);
  }
  return merged;
}

function mergePluginConnectionsFromDefaults(stored: PluginConnection[]): PluginConnection[] {
  const merged = stored.map((c) => ({ ...c, pluginId: migratePluginId(c.pluginId as string) }));
  for (const def of defaultPluginConnections()) {
    if (!merged.some((c) => c.pluginId === def.pluginId)) merged.push(def);
  }
  return merged;
}

function normalizePersisted(raw: Persisted): Persisted {
  const entitlements = mergeEntitlementsFromSeed((raw.entitlements ?? []).map(normalizeEntitlementRow));
  const pluginConnections = mergePluginConnectionsFromDefaults(raw.pluginConnections ?? []);
  return {
    ...raw,
    entitlements,
    pluginConnections: pluginConnections.length ? pluginConnections : defaultPluginConnections(),
    preferences: normalizePreferences(raw.preferences),
  };
}

function loadPersisted(): Persisted | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizePersisted(JSON.parse(raw) as Persisted);
  } catch {
    // ignore
  }
  const migrated = migrateFromV1();
  return migrated ? normalizePersisted(migrated) : null;
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
  b2wEstimates: b2wEstimatesSeed as B2wEstimate[],
  autobids: autobidsSeed as AutoBid[],
  conversations: initialConv,
  activeConversationId: persisted?.activeConversationId ?? initialConv[0]?.id ?? "",
  widgets: (persisted?.widgets ?? []) as SavedWidget[],
  preferences: normalizePreferences(persisted?.preferences),
  pluginConnections: persisted?.pluginConnections ?? defaultPluginConnections(),
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
    pluginConnections: state.pluginConnections,
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
    pluginConnections: defaultPluginConnections(),
  });
}

export function getPluginConnections() {
  return state.pluginConnections;
}

export function getPluginConnection(pluginId: PluginId) {
  return state.pluginConnections.find((c) => c.pluginId === pluginId);
}

export function isPluginConnected(pluginId: PluginId) {
  return getPluginConnection(pluginId)?.status === "connected";
}

export function listConnectablePluginIds(): PluginId[] {
  return getEntitlements()
    .filter((e) => e.active)
    .map((e) => e.pluginId);
}

export function beginPluginConnect(pluginId: PluginId, fchid: string) {
  const check = validateFchid(fchid);
  const now = new Date().toISOString();
  const index = state.pluginConnections.findIndex((c) => c.pluginId === pluginId);
  if (!check.ok) {
    const errorRow: PluginConnection = {
      pluginId,
      status: "error",
      fchid: fchid.trim(),
      lastError: check.message,
      updatedAt: now,
    };
    if (index >= 0) setState("pluginConnections", index, errorRow);
    else setState("pluginConnections", (rows) => [...rows, errorRow]);
    persist();
    return { ok: false as const, message: check.message };
  }
  const pending: PluginConnection = {
    pluginId,
    status: "pending",
    fchid: check.value,
    lastError: undefined,
    updatedAt: now,
  };
  if (index >= 0) setState("pluginConnections", index, pending);
  else setState("pluginConnections", (rows) => [...rows, pending]);
  persist();
  return { ok: true as const, pluginId };
}

export function completePluginConnect(pluginId: PluginId) {
  const index = state.pluginConnections.findIndex((c) => c.pluginId === pluginId);
  if (index < 0) return;
  const row = state.pluginConnections[index];
  if (row.status !== "pending") return;
  const now = new Date().toISOString();
  setState("pluginConnections", index, {
    ...row,
    status: "connected",
    connectedAt: now,
    updatedAt: now,
    lastError: undefined,
  });
  persist();
}

export function disconnectPlugin(pluginId: PluginId) {
  const index = state.pluginConnections.findIndex((c) => c.pluginId === pluginId);
  const now = new Date().toISOString();
  const disconnected: PluginConnection = {
    pluginId,
    status: "disconnected",
    updatedAt: now,
  };
  if (index >= 0) setState("pluginConnections", index, disconnected);
  else setState("pluginConnections", (rows) => [...rows, disconnected]);
  persist();
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

export function getB2wEstimates(accountId: string) {
  return state.b2wEstimates.filter((est) => est.accountId === accountId);
}

export function getAutoBids(accountId: string) {
  return state.autobids.filter((bid) => bid.accountId === accountId);
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
