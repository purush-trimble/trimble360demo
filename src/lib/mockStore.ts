import { createStore } from "solid-js/store";
import entitlementsSeed from "@/mock-data/entitlements.json";
import chatMessagesSeed from "@/mock-data/chat-messages.json";
import connectFilesSeed from "@/mock-data/connect-files.json";
import worksmanagerDesignsSeed from "@/mock-data/worksmanager-designs.json";
import worksmanagerProjectsSeed from "@/mock-data/worksmanager-projects.json";
import b2wEstimatesSeed from "@/mock-data/b2w-estimates.json";
import autobidsSeed from "@/mock-data/autobids.json";
import devicesSeed from "@/mock-data/devices.json";
import { parseDesignLayout } from "@/lib/agent/intents";
import { resolveIntent } from "@/lib/agent/intentRouter";
import { currentUser, demoUsers, userName } from "@/lib/currentUser";
import { dashboardPanelsForFeatures } from "@/lib/workProfileCatalog";
import type { ChatMessage } from "@/lib/agent/types";
import { normalizeWorksManagerPlan } from "@/lib/pluginCatalog";
import type {
  Conversation,
  Dashboard,
  Design,
  Entitlement,
  PluginConnection,
  PluginId,
  DesignListLayout,
  SavedWorkflow,
  UserPreferences,
  AutoBid,
  B2wEstimate,
  WorksManagerProject,
  Device,
} from "@/lib/types";

const STORAGE_KEY = "byop-demo-v2";

type Persisted = {
  entitlements: Entitlement[];
  messages: ChatMessage[];
  designs: Design[];
  devices?: Device[];
  conversations: Conversation[];
  activeConversationId: string;
  savedWorkflows: SavedWorkflow[];
  activeSavedWorkflowId?: string;
  preferences: UserPreferences;
  pluginConnections: PluginConnection[];
  dashboards?: Dashboard[];
  activeDashboardId?: string;
  starterWorkflowsSeeded?: boolean;
};

type ProjectScopedAction = "worksmanager_design_list" | "device_management";

function findSavedWorkflowForPrompt(prompt: string, action: ProjectScopedAction): SavedWorkflow | undefined {
  const key = prompt.trim().toLowerCase();
  const active = state.savedWorkflows.find((workflow) => workflow.id === state.activeSavedWorkflowId);
  if (active && active.action === action && active.prompt.trim().toLowerCase() === key) return active;
  return state.savedWorkflows.find((workflow) => workflow.action === action && workflow.prompt.trim().toLowerCase() === key);
}

function buildProjectScopedUiAction(
  targetAction: ProjectScopedAction,
  projectId: string,
  workflowId?: string,
  layout?: DesignListLayout,
): NonNullable<ChatMessage["uiAction"]> {
  const project = state.projects.find((item) => item.id === projectId);
  const projectName = project?.name ?? "Project";
  const saved = workflowId ? state.savedWorkflows.find((workflow) => workflow.id === workflowId) : undefined;
  const config = { ...saved?.config, projectId, ...(layout ? { layout } : {}) };
  if (targetAction === "worksmanager_design_list") {
    return { type: "worksmanager_design_list", accountId: "wm-demo", projectId, projectName, config, workflowId };
  }
  return { type: "device_management", projectId, projectName, config, workflowId };
}

function findDesignsEditContext(): { projectId?: string; workflowId?: string; layout: DesignListLayout } {
  const selected = state.savedWorkflows.find((workflow) => workflow.id === state.activeSavedWorkflowId);
  const fallback = getActiveSavedWorkflow();
  const active = selected?.action === "worksmanager_design_list" ? selected : fallback?.action === "worksmanager_design_list" ? fallback : undefined;
  if (active) return { projectId: active.config?.projectId, workflowId: active.id, layout: active.config?.layout === "cards" ? "cards" : "table" };
  const conversation = getActiveConversation();
  for (const id of [...(conversation?.messageIds ?? [])].reverse()) {
    const action = state.messages.find((message) => message.id === id)?.uiAction;
    if (action?.type !== "worksmanager_design_list") continue;
    return {
      projectId: action.projectId ?? action.config?.projectId,
      workflowId: action.workflowId,
      layout: action.config?.layout === "cards" ? "cards" : "table",
    };
  }
  return { layout: "table" };
}

function persistProjectOnSavedWorkflow(workflowId: string | undefined, projectId: string) {
  if (!workflowId) return;
  const index = state.savedWorkflows.findIndex((workflow) => workflow.id === workflowId);
  if (index < 0) return;
  setState("savedWorkflows", index, "config", { ...state.savedWorkflows[index].config, projectId });
  setState("savedWorkflows", index, "updatedAt", new Date().toISOString());
}

function scheduleProjectPicker(assistantMessageId: string, targetAction: ProjectScopedAction) {
  setTimeout(() => {
    replaceAssistantMessage(
      assistantMessageId,
      "Select a project so I can load the requested workspace data.",
      { type: "project_picker", targetAction, projects: getProjects("wm-demo") },
    );
  }, 700);
}

function scheduleProjectScopedResult(
  assistantMessageId: string,
  targetAction: ProjectScopedAction,
  projectId: string,
  workflowId?: string,
) {
  setTimeout(() => {
    const project = state.projects.find((item) => item.id === projectId);
    const projectName = project?.name ?? "Project";
    replaceAssistantMessage(
      assistantMessageId,
      `Here are the ${targetAction === "worksmanager_design_list" ? "designs" : "devices"} for ${projectName}.`,
      buildProjectScopedUiAction(targetAction, projectId, workflowId),
    );
  }, 700);
}

const starterWorkflows: SavedWorkflow[] = [
  {
    id: "workflow-project-designs",
    name: "Project designs",
    description: "View designs in a WorksManager project",
    prompt: "show my designs",
    action: "worksmanager_design_list",
    productIds: ["worksmanager"],
    favorite: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    config: { projectId: "proj-north-ridge", layout: "table" },
  },
  {
    id: "workflow-vcl-design",
    name: "Create a VCL design",
    description: "Import and prepare a VCL file for a field device",
    prompt: "create a VCL design",
    action: "create_vcl_design",
    productIds: ["connect", "worksmanager"],
    favorite: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

function withStarterWorkflows(saved: SavedWorkflow[]) {
  const userWorkflows = saved.filter((workflow) => workflow.id !== "workflow-project-devices");
  const existingActions = new Set(userWorkflows.map((workflow) => workflow.action));
  return [...userWorkflows, ...starterWorkflows.filter((workflow) => !existingActions.has(workflow.action))];
}

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

function recoverStagedMessage(message: ChatMessage): ChatMessage {
  const action = message.uiAction;
  if (action?.type === "project_loading") {
    return {
      ...message,
      text: "Select a project so I can load the requested workspace data.",
      uiAction: { type: "project_picker", targetAction: action.targetAction, projects: worksmanagerProjectsSeed as WorksManagerProject[] },
    };
  }
  if (action?.type === "project_processing") {
    return {
      ...message,
      text: `Here are the ${action.targetAction === "worksmanager_design_list" ? "designs" : "devices"} for ${action.projectName}.`,
      uiAction: action.targetAction === "worksmanager_design_list"
        ? { type: "worksmanager_design_list", accountId: "wm-demo", projectId: action.projectId, projectName: action.projectName, config: { projectId: action.projectId } }
        : { type: "device_management", projectId: action.projectId, projectName: action.projectName, config: { projectId: action.projectId } },
    };
  }
  return message;
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
    savedWorkflows: withStarterWorkflows(raw.savedWorkflows ?? raw.widgets ?? []),
    starterWorkflowsSeeded: true,
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
const initialMessages = ((persisted?.messages ?? chatMessagesSeed) as ChatMessage[]).map(recoverStagedMessage);
const initialConv =
  persisted?.conversations ??
  buildInitialConversation(initialMessages.length ? initialMessages : []).conversations;

const [state, setState] = createStore({
  entitlements: (persisted?.entitlements ?? entitlementsSeed) as Entitlement[],
  messages: initialMessages,
  designs: (persisted?.designs ?? worksmanagerDesignsSeed) as Design[],
  devices: (persisted?.devices ?? devicesSeed) as Device[],
  connectFiles: connectFilesSeed,
  projects: worksmanagerProjectsSeed as WorksManagerProject[],
  b2wEstimates: b2wEstimatesSeed as B2wEstimate[],
  autobids: autobidsSeed as AutoBid[],
  conversations: initialConv,
  activeConversationId: persisted?.activeConversationId ?? initialConv[0]?.id ?? "",
  savedWorkflows: (persisted?.savedWorkflows ?? starterWorkflows) as SavedWorkflow[],
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
    devices: state.devices,
    conversations: state.conversations,
    activeConversationId: state.activeConversationId,
    savedWorkflows: state.savedWorkflows,
    starterWorkflowsSeeded: true,
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
  for (const user of demoUsers) localStorage.removeItem(`trimble360-welcomed-${user.id}`);
  const messages = chatMessagesSeed as ChatMessage[];
  const { conversations, activeId } = buildInitialConversation(messages);
  setState({
    entitlements: entitlementsSeed as Entitlement[],
    messages,
    designs: worksmanagerDesignsSeed as Design[],
    devices: devicesSeed as Device[],
    conversations,
    activeConversationId: activeId,
    savedWorkflows: [...starterWorkflows],
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

/** Opens a job view dashboard for a selected feature mix. */
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

function replaceAssistantMessage(messageId: string, text: string, uiAction: ChatMessage["uiAction"]) {
  const index = state.messages.findIndex((message) => message.id === messageId);
  if (index < 0) return;
  setState("messages", index, { text, uiAction, createdAt: new Date().toISOString() });
  persist();
}

export function sendMessage(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return null;
  let conversationId = state.activeConversationId;
  if (!conversationId || !state.conversations.some((c) => c.id === conversationId)) {
    createConversation();
    conversationId = state.activeConversationId;
  }
  const designsContext = findDesignsEditContext();
  const layoutRequest = parseDesignLayout(trimmed, designsContext.layout);
  const result = layoutRequest && designsContext.projectId
    ? {
      assistantText: layoutRequest === "cards"
        ? "Here's your project designs in a card layout. Save the workflow to keep this view."
        : "Here's your project designs as a table. Save the workflow to keep this view.",
      uiAction: buildProjectScopedUiAction("worksmanager_design_list", designsContext.projectId, designsContext.workflowId, layoutRequest),
    }
    : layoutRequest
      ? { assistantText: "Open the Project designs workflow, then ask me to change the layout.", uiAction: undefined }
      : resolveIntent(trimmed);
  const now = new Date().toISOString();
  const userMessage: ChatMessage = { id: `message-${Date.now()}`, role: "user", text: trimmed, createdAt: now };
  const alreadyScoped = (result.uiAction?.type === "worksmanager_design_list" || result.uiAction?.type === "device_management") && Boolean(result.uiAction.projectId);
  const stagedTarget = alreadyScoped
    ? undefined
    : result.uiAction?.type === "worksmanager_design_list" || result.uiAction?.type === "device_management"
      ? result.uiAction.type
      : undefined;
  const savedWorkflow = stagedTarget ? findSavedWorkflowForPrompt(trimmed, stagedTarget) : undefined;
  const savedProjectId = savedWorkflow?.config?.projectId;
  const assistantMessage: ChatMessage = {
    id: `message-${Date.now()}-assistant`,
    role: "assistant",
    text: stagedTarget
      ? savedProjectId
        ? `Loading ${savedWorkflow?.name ?? "workspace"}…`
        : "Fetching projects…"
      : result.assistantText,
    uiAction: stagedTarget
      ? savedProjectId
        ? {
          type: "project_processing",
          targetAction: stagedTarget,
          projectId: savedProjectId,
          projectName: state.projects.find((project) => project.id === savedProjectId)?.name ?? "Project",
        }
        : { type: "project_loading", targetAction: stagedTarget }
      : result.uiAction,
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
  if (stagedTarget && savedProjectId) {
    scheduleProjectScopedResult(assistantMessage.id, stagedTarget, savedProjectId, savedWorkflow?.id);
  } else if (stagedTarget) {
    scheduleProjectPicker(assistantMessage.id, stagedTarget);
  }
  return { userMessage, assistantMessage };
}

export function completeProjectSelection(projectId: string) {
  const conversation = state.conversations.find((item) => item.id === state.activeConversationId);
  const pickerMessage = conversation
    ? [...conversation.messageIds].reverse().map((id) => state.messages.find((message) => message.id === id)).find(
      (message): message is ChatMessage => message?.uiAction?.type === "project_picker",
    )
    : undefined;
  if (!pickerMessage || pickerMessage.uiAction?.type !== "project_picker") return;
  const project = state.projects.find((item) => item.id === projectId);
  if (!project) return;
  const targetAction = pickerMessage.uiAction.targetAction;
  const workflowId = state.savedWorkflows.find(
    (workflow) => workflow.id === state.activeSavedWorkflowId && workflow.action === targetAction,
  )?.id;
  persistProjectOnSavedWorkflow(workflowId, projectId);
  replaceAssistantMessage(
    pickerMessage.id,
    `Analyzing ${project.name}…`,
    { type: "project_processing", targetAction, projectId, projectName: project.name },
  );
  scheduleProjectScopedResult(pickerMessage.id, targetAction, projectId, workflowId);
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
  const normalizedPrompt = input.prompt.trim().toLowerCase();
  const sameConfig = (config?: SavedWorkflow["config"]) =>
    JSON.stringify(config ?? {}) === JSON.stringify(input.config ?? {});
  const index = state.savedWorkflows.findIndex((workflow) =>
    workflow.id === input.workflowId ||
    (
      workflow.action === input.action &&
      workflow.prompt.trim().toLowerCase() === normalizedPrompt &&
      sameConfig(workflow.config)
    ),
  );
  if (index >= 0) {
    const existing = state.savedWorkflows[index];
    setState("savedWorkflows", index, {
      name: input.name.trim() || existing.name,
      description: input.description,
      prompt: input.prompt,
      action: input.action,
      productIds: input.productIds,
      config: input.config ?? existing.config,
      updatedAt: now,
    });
    setState("activeSavedWorkflowId", existing.id);
    persist();
    return state.savedWorkflows[index];
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
  const projectScopedAction = workflow.action === "worksmanager_design_list" || workflow.action === "device_management"
    ? workflow.action as ProjectScopedAction
    : undefined;
  if (projectScopedAction && !workflow.config?.projectId) {
    const userMessage: ChatMessage = { id: `message-${Date.now()}`, role: "user", text: workflow.prompt, createdAt: now };
    const assistantMessage: ChatMessage = {
      id: `message-${Date.now()}-assistant`,
      role: "assistant",
      text: "Fetching projects…",
      uiAction: { type: "project_loading", targetAction: projectScopedAction },
      createdAt: now,
    };
    setState("messages", (messages) => [...messages, userMessage, assistantMessage]);
    const index = state.conversations.findIndex((conversation) => conversation.id === state.activeConversationId);
    if (index >= 0) {
      setState("conversations", index, "messageIds", (ids) => [...ids, userMessage.id, assistantMessage.id]);
      setState("conversations", index, "updatedAt", now);
    }
    setState("activeSavedWorkflowId", workflow.id);
    persist();
    scheduleProjectPicker(assistantMessage.id, projectScopedAction);
    return;
  }
  const uiAction = workflow.action === "create_vcl_design"
    ? { type: "create_vcl_design" as const, workflowId: workflow.id, config: workflow.config }
    : workflow.action === "create_design"
      ? { type: "create_design" as const, accountId: "wm-demo", workflowId: workflow.id, config: workflow.config }
      : workflow.action === "connect_file_browser"
        ? { type: "connect_file_browser" as const, accountId: "connect-demo" }
        : workflow.action === "worksmanager_design_list" && workflow.config?.projectId
          ? buildProjectScopedUiAction("worksmanager_design_list", workflow.config.projectId, workflow.id)
          : workflow.action === "b2westimate_list"
            ? { type: "b2westimate_list" as const, accountId: "b2w-demo" }
            : workflow.action === "autobid_list"
              ? { type: "autobid_list" as const, accountId: "autobid-demo" }
                : workflow.action === "device_management" && workflow.config?.projectId
                  ? buildProjectScopedUiAction("device_management", workflow.config.projectId, workflow.id)
              : workflow.action === "publish_connect_to_wm"
                ? { type: "publish_connect_to_wm" as const }
      : undefined;
  const assistantMessage: ChatMessage = {
    id: `message-${Date.now()}-assistant`,
    role: "assistant",
    text: workflow.action === "worksmanager_design_list"
      ? `Edit your saved ${workflow.name} widget, then save the changes. Ask me to switch to a card layout if you want a different view.`
      : `Edit your saved ${workflow.name} widget, then save the changes.`,
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
  if (state.activeSavedWorkflowId === id) setState("activeSavedWorkflowId", state.savedWorkflows[0]?.id ?? "");
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

export function getDevices(projectId: string) {
  return state.devices.filter((device) => device.projectId === projectId);
}

export function addDevice(input: Omit<Device, "id" | "status">) {
  if (state.devices.some((device) => device.serial.toLowerCase() === input.serial.trim().toLowerCase())) {
    return { ok: false as const, error: "A device with this serial number already exists." };
  }
  const device: Device = { ...input, id: `device-${Date.now()}`, serial: input.serial.trim(), status: "Offline" };
  setState("devices", (devices) => [...devices, device]);
  persist();
  return { ok: true as const, device };
}

const today = () => new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

type DesignResult = { ok: true; design: Design } | { ok: false; error: string };

/** Same name in the same project saves a new version instead of a duplicate. */
export function createDesign(input: { projectId: string; name?: string; sourceFileIds: string[] }): DesignResult {
  const name = input.name?.trim() || "Imported Connect design";
  const index = state.designs.findIndex((d) => d.projectId === input.projectId && d.name.trim().toLowerCase() === name.toLowerCase());
  if (index >= 0) {
    const existing = state.designs[index];
    if (existing.checkedOutBy && existing.checkedOutBy !== currentUser.id) {
      return { ok: false, error: `${userName(existing.checkedOutBy)} is updating "${existing.name}". Try again after they upload.` };
    }
    setState("designs", index, {
      sourceFileIds: input.sourceFileIds,
      version: (existing.version ?? 1) + 1,
      updatedBy: currentUser.id,
      updatedAt: today(),
      changeNote: "Re-created from the design wizard",
      checkedOutBy: undefined,
    });
    persist();
    return { ok: true, design: state.designs[index] };
  }
  const design: Design = {
    id: `design-${Date.now()}`,
    projectId: input.projectId,
    name,
    sourceFileIds: input.sourceFileIds,
    status: "Ready",
    createdAt: today(),
    version: 1,
    createdBy: currentUser.id,
  };
  setState("designs", (designs) => [...designs, design]);
  persist();
  return { ok: true, design };
}

function findDesign(id: string) {
  const index = state.designs.findIndex((d) => d.id === id);
  return { index, design: state.designs[index] as Design | undefined };
}

/** Locks the design for the current user so nobody else uploads a competing version. */
export function pullDesign(id: string): DesignResult {
  const { index, design } = findDesign(id);
  if (!design) return { ok: false, error: "Design not found." };
  if (design.checkedOutBy && design.checkedOutBy !== currentUser.id) {
    return { ok: false, error: `${userName(design.checkedOutBy)} already pulled this design.` };
  }
  setState("designs", index, "checkedOutBy", currentUser.id);
  persist();
  return { ok: true, design: state.designs[index] };
}

export function cancelDesignPull(id: string) {
  const { index, design } = findDesign(id);
  if (!design || design.checkedOutBy !== currentUser.id) return;
  setState("designs", index, "checkedOutBy", undefined);
  persist();
}

export function uploadDesignVersion(id: string, note: string): DesignResult {
  const { index, design } = findDesign(id);
  if (!design) return { ok: false, error: "Design not found." };
  if (design.checkedOutBy !== currentUser.id) return { ok: false, error: "Pull the design before uploading a new version." };
  setState("designs", index, {
    version: (design.version ?? 1) + 1,
    updatedBy: currentUser.id,
    updatedAt: today(),
    changeNote: note.trim() || undefined,
    checkedOutBy: undefined,
  });
  persist();
  return { ok: true, design: state.designs[index] };
}

// Keeps a second tab (the other admin) in sync without a reload.
window.addEventListener("storage", (event) => {
  if (event.key !== STORAGE_KEY || !event.newValue) return;
  try {
    const designs = (JSON.parse(event.newValue) as Persisted).designs;
    if (Array.isArray(designs)) setState("designs", designs);
  } catch {
    // ignore malformed writes
  }
});

if (import.meta.env.DEV) {
  const migratedStarters = withStarterWorkflows([starterWorkflows[0]]);
  if (migratedStarters.length !== 2 || migratedStarters[0]?.action !== "worksmanager_design_list" || migratedStarters[1]?.action !== "create_vcl_design") {
    console.error("starter workflow migration self-check failed", migratedStarters);
  }
  if (state.projects.length < 10 || state.projects.some((project) => !getDesigns(project.id).length || !getDevices(project.id).length)) {
    console.error("project mock coverage self-check failed", {
      projects: state.projects.length,
      missingData: state.projects.filter((project) => !getDesigns(project.id).length || !getDevices(project.id).length).map((project) => project.id),
    });
  }
}
