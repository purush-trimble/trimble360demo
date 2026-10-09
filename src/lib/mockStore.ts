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
import { dashboardPanelsForFeatures } from "@/lib/workProfileCatalog";
import type { ChatMessage } from "@/lib/agent/types";
import { normalizeWorksManagerPlan, validateFchid } from "@/lib/pluginCatalog";
import type {
  Conversation,
  Dashboard,
  Design,
  Entitlement,
  PluginConnection,
  PluginId,
  SavedWorkflow,
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
  savedWorkflows: SavedWorkflow[];
  activeSavedWorkflowId?: string;
  preferences: UserPreferences;
  pluginConnections: PluginConnection[];
  dashboards?: Dashboard[];
  activeDashboardId?: string;
  activeSavedWorkflowId?: string;
};

function defaultDashboards(): Dashboard[] {
  return [
    {
      id: "dashboard-1",
      name: "Site Operations",
      panels: [
        { id: "dw-1", name: "Publish design to WorksManager", action: "publish_connect_to_wm" },
        { id: "dw-2", name: "WorksManager designs", action: "worksmanager_design_list" },
      ],
    },
    {
      id: "dashboard-2",
      name: "Estimating & Bids",
      panels: [
        { id: "dw-3", name: "B2W estimates", action: "b2westimate_list" },
        { id: "dw-4", name: "AutoBid bids", action: "autobid_list" },
      ],
    },
    { id: "dashboard-3", name: "Field Coordination", panels: [] },
  ];
}

type LegacyDashboard = Dashboard & { widgets?: Dashboard["panels"] };

function normalizeDashboard(raw: LegacyDashboard): Dashboard {
  return { id: raw.id, name: raw.name, panels: raw.panels ?? raw.widgets ?? [] };
}

const defaultPreferences: UserPreferences = { theme: "system", density: "comfortable", pluginsMenuVisible: false };

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
      savedWorkflows: [],
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
  const subscriptionAccountId = (e.pluginId as string) === "workorders" ? "b2w-demo" : e.subscriptionAccountId;
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

function normalizePersisted(raw: Persisted & { widgets?: SavedWorkflow[]; dashboards?: LegacyDashboard[] }): Persisted {
  const entitlements = mergeEntitlementsFromSeed((raw.entitlements ?? []).map(normalizeEntitlementRow));
  const pluginConnections = mergePluginConnectionsFromDefaults(raw.pluginConnections ?? []);
  return {
    ...raw,
    entitlements,
    savedWorkflows: raw.savedWorkflows ?? raw.widgets ?? [],
    activeSavedWorkflowId: raw.activeSavedWorkflowId,
    dashboards: (raw.dashboards ?? defaultDashboards()).map(normalizeDashboard),
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
  savedWorkflows: (persisted?.savedWorkflows ?? []) as SavedWorkflow[],
  activeSavedWorkflowId: persisted?.activeSavedWorkflowId ?? "",
  preferences: normalizePreferences(persisted?.preferences),
  pluginConnections: persisted?.pluginConnections ?? defaultPluginConnections(),
  dashboards: persisted?.dashboards ?? defaultDashboards(),
  activeDashboardId: persisted?.activeDashboardId ?? "dashboard-1",
});

function snapshot(): Persisted {
  return {
    entitlements: state.entitlements,
    messages: state.messages,
    designs: state.designs,
    conversations: state.conversations,
    activeConversationId: state.activeConversationId,
    savedWorkflows: state.savedWorkflows,
    activeSavedWorkflowId: state.activeSavedWorkflowId,
    preferences: state.preferences,
    pluginConnections: state.pluginConnections,
    dashboards: state.dashboards,
    activeDashboardId: state.activeDashboardId,
  };
}

function persist() {
  savePersisted(snapshot());
}

export { state };

export function resetDemoStorage() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem("trimble360-demo-v1");
  localStorage.removeItem("trimble360-welcomed-demo1");
  localStorage.removeItem("trimble360-welcomed-demo2");
  const messages = chatMessagesSeed as ChatMessage[];
  const { conversations, activeId } = buildInitialConversation(messages);
  setState({
    entitlements: entitlementsSeed as Entitlement[],
    messages,
    designs: worksmanagerDesignsSeed as Design[],
    conversations,
    activeConversationId: activeId,
    savedWorkflows: [],
    activeSavedWorkflowId: "",
    preferences: defaultPreferences,
    pluginConnections: defaultPluginConnections(),
    dashboards: defaultDashboards(),
    activeDashboardId: "dashboard-1",
  });
}

export function getActiveDashboard() {
  return state.dashboards.find((d) => d.id === state.activeDashboardId) ?? state.dashboards[0];
}

export function selectDashboard(id: string) {
  setState("activeDashboardId", id);
  persist();
}

/** Opens a job view dashboard that mirrors the work profile's feature mix. */
export function openProfileDashboard(name: string, featureIds: string[]) {
  const tiles = dashboardPanelsForFeatures(featureIds);
  const dashboard: Dashboard = {
    id: `dashboard-${Date.now()}`,
    name: name.trim() || "Job view",
    panels: tiles.map((tile, index) => ({
      id: `dw-${Date.now()}-${index}`,
      name: tile.name,
      action: tile.action,
    })),
  };
  setState("dashboards", (items) => [dashboard, ...items]);
  selectDashboard(dashboard.id);
}

export function createDashboard() {
  const dashboard: Dashboard = { id: `dashboard-${Date.now()}`, name: `Job view ${state.dashboards.length + 1}`, panels: [] };
  setState("dashboards", (items) => [...items, dashboard]);
  selectDashboard(dashboard.id);
}

export function renameDashboard(id: string, name: string) {
  const index = state.dashboards.findIndex((d) => d.id === id);
  if (index < 0 || !name.trim()) return;
  setState("dashboards", index, "name", name.trim());
  persist();
}

export function deleteDashboard(id: string) {
  setState("dashboards", (items) => items.filter((d) => d.id !== id));
  if (!state.dashboards.length) return createDashboard();
  if (state.activeDashboardId === id) setState("activeDashboardId", state.dashboards[0].id);
  persist();
}

export function addDashboardPanel(input: { name: string; action: string }) {
  const index = state.dashboards.findIndex((d) => d.id === getActiveDashboard()?.id);
  if (index < 0) return;
  setState("dashboards", index, "panels", (panels) => [...panels, { id: `dw-${Date.now()}`, ...input }]);
  persist();
}

export function removeDashboardPanel(panelId: string) {
  const index = state.dashboards.findIndex((d) => d.id === getActiveDashboard()?.id);
  if (index < 0) return;
  setState("dashboards", index, "panels", (panels) => panels.filter((panel) => panel.id !== panelId));
  persist();
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

export function sendMessage(text: string, mountedPlugins: PluginId[], allowedFeatureIds?: string[]) {
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
    allowedFeatureIds: allowedFeatureIds?.length ? new Set(allowedFeatureIds) : undefined,
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

export function saveWorkflow(input: {
  name: string;
  description: string;
  prompt: string;
  action: string;
  productIds: PluginId[];
  workflowId?: string;
  config?: SavedWorkflow["config"];
}) {
  const now = new Date().toISOString();
  if (input.workflowId) {
    const index = state.savedWorkflows.findIndex((workflow) => workflow.id === input.workflowId);
    if (index >= 0) {
      setState("savedWorkflows", index, {
        name: input.name.trim() || state.savedWorkflows[index].name,
        description: input.description,
        prompt: input.prompt,
        action: input.action,
        productIds: input.productIds,
        config: input.config,
        updatedAt: now,
      });
      setState("activeSavedWorkflowId", input.workflowId);
      persist();
      return state.savedWorkflows[index];
    }
  }
  const workflow: SavedWorkflow = {
    id: `workflow-${Date.now()}`,
    name: input.name.trim() || "Saved workflow",
    description: input.description,
    prompt: input.prompt,
    action: input.action,
    productIds: input.productIds,
    favorite: false,
    createdAt: now,
    updatedAt: now,
    config: input.config,
  };
  setState("savedWorkflows", (items) => [workflow, ...items]);
  setState("activeSavedWorkflowId", workflow.id);
  persist();
  return workflow;
}

export function selectSavedWorkflow(id: string) {
  if (!state.savedWorkflows.some((workflow) => workflow.id === id)) return;
  setState("activeSavedWorkflowId", id);
  persist();
}

export function getActiveSavedWorkflow() {
  return state.savedWorkflows.find((workflow) => workflow.id === state.activeSavedWorkflowId) ?? state.savedWorkflows[0];
}

export function deleteSavedWorkflow(id: string) {
  setState("savedWorkflows", (items) => items.filter((workflow) => workflow.id !== id));
  if (state.activeSavedWorkflowId === id) setState("activeSavedWorkflowId", state.savedWorkflows[0]?.id ?? "");
  persist();
}

export function openSavedWorkflowInChat(id: string) {
  const workflow = state.savedWorkflows.find((item) => item.id === id);
  if (!workflow) return;
  createConversation();
  const now = new Date().toISOString();
  const uiAction = workflow.action === "create_vcl_design"
    ? { type: "create_vcl_design" as const, workflowId: workflow.id, config: workflow.config }
    : workflow.action === "create_design"
      ? { type: "create_design" as const, accountId: "wm-demo", workflowId: workflow.id, config: workflow.config }
      : workflow.action === "connect_file_browser"
        ? { type: "connect_file_browser" as const, accountId: "connect-demo" }
        : workflow.action === "worksmanager_design_list"
          ? { type: "worksmanager_design_list" as const, accountId: "wm-demo" }
          : workflow.action === "b2westimate_list"
            ? { type: "b2westimate_list" as const, accountId: "b2w-demo" }
            : workflow.action === "autobid_list"
              ? { type: "autobid_list" as const, accountId: "autobid-demo" }
              : workflow.action === "publish_connect_to_wm"
                ? { type: "publish_connect_to_wm" as const }
      : undefined;
  const assistantMessage: ChatMessage = {
    id: `message-${Date.now()}-assistant`,
    role: "assistant",
    text: `Edit your saved ${workflow.name} widget, then save the changes.`,
    uiAction,
    createdAt: now,
  };
  setState("messages", (messages) => [...messages, assistantMessage]);
  const index = state.conversations.findIndex((conversation) => conversation.id === state.activeConversationId);
  if (index >= 0) {
    setState("conversations", index, "messageIds", (ids) => [...ids, assistantMessage.id]);
    setState("conversations", index, "updatedAt", now);
  }
  setState("activeSavedWorkflowId", workflow.id);
  persist();
}

export function toggleWorkflowFavorite(id: string) {
  const index = state.savedWorkflows.findIndex((w) => w.id === id);
  if (index < 0) return;
  setState("savedWorkflows", index, "favorite", !state.savedWorkflows[index].favorite);
  setState("savedWorkflows", index, "updatedAt", new Date().toISOString());
  persist();
}

export function deleteWorkflow(id: string) {
  setState("savedWorkflows", (items) => items.filter((w) => w.id !== id));
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
