export type PluginId = "connect" | "worksmanager";

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

export interface SavedWidget {
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

export type ThemePreference = "light" | "dark" | "system";
export type DensityPreference = "comfortable" | "compact";

export interface UserPreferences {
  theme: ThemePreference;
  density: DensityPreference;
}
