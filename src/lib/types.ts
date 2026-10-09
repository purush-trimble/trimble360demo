export type PluginId = "connect" | "worksmanager" | "b2westimate" | "autobid";

export interface ConnectAccount {
  id: string;
  name: string;
  region: string;
}
export interface ConnectFile {
  id: string;
  accountId: string;
  name: string;
  extension: string;
  size: string;
  updatedAt: string;
}
export interface WorksManagerAccount {
  id: string;
  name: string;
}
export interface WorksManagerProject {
  id: string;
  accountId: string;
  name: string;
  status: string;
}
export interface B2wEstimate {
  id: string;
  accountId: string;
  name: string;
  project: string;
  status: string;
  total: string;
  updatedAt: string;
}
export interface AutoBid {
  id: string;
  accountId: string;
  title: string;
  client: string;
  amount: string;
  status: string;
  dueDate: string;
}
export interface Design {
  id: string;
  projectId: string;
  name: string;
  sourceFileIds: string[];
  status: string;
  createdAt: string;
}
export interface Entitlement {
  userId: string;
  pluginId: PluginId;
  subscriptionAccountId: string;
  plan: string;
  active: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messageIds: string[];
  createdAt: string;
  updatedAt: string;
}

/** Agent workflow pinned from chat for quick reuse. */
export interface SavedWorkflow {
  id: string;
  name: string;
  description: string;
  prompt: string;
  action: string;
  productIds: PluginId[];
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

/** One product feature rendered on the job dashboard. */
export interface DashboardPanel {
  id: string;
  name: string;
  action: string;
}

export interface Dashboard {
  id: string;
  name: string;
  panels: DashboardPanel[];
}

export type ThemePreference = "light" | "dark" | "system";
export type DensityPreference = "comfortable" | "compact";

export type PluginConnectionStatus = "disconnected" | "pending" | "connected" | "error";

export interface PluginConnection {
  pluginId: PluginId;
  status: PluginConnectionStatus;
  fchid?: string;
  lastError?: string;
  connectedAt?: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: ThemePreference;
  density: DensityPreference;
  /** When true, sidebar and profile expose navigation to the Plugins page */
  pluginsMenuVisible: boolean;
}
