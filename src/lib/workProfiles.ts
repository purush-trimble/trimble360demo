import { createStore } from "solid-js/store";
import { currentUser } from "@/lib/currentUser";
import { openProfileDashboard } from "@/lib/mockStore";
import { accountById, featuresForSolutions, productsUsedBy, projectById, projectsForAccount, suggestedSelection } from "@/lib/workProfileCatalog";
import type { PluginId } from "@/lib/types";

export type WorkScope = "project" | "account";

/** Saved mix of account, project, solutions, and product features for one job activity. */
export interface WorkProfile {
  id: string;
  name: string;
  userId: string;
  accountId: string;
  projectId: string;
  solutionIds: string[];
  productIds: PluginId[];
  featureIds: string[];
  createdAt: string;
}

const STORAGE_KEY = "byop-work-profiles-v1";
const LEGACY_STORAGE_KEY = "byop-personas-v1";

type PersistedWorkProfiles = {
  profiles: WorkProfile[];
  activeId: string;
  scope: WorkScope;
  focusAccountId: string;
  focusProjectId: string;
};

function load(): PersistedWorkProfiles {
  const empty: PersistedWorkProfiles = { profiles: [], activeId: "", scope: "project", focusAccountId: "", focusProjectId: "" };
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<PersistedWorkProfiles & { personas?: WorkProfile[] }>;
    const profiles = (Array.isArray(parsed.profiles) ? parsed.profiles : Array.isArray(parsed.personas) ? parsed.personas : []).map((profile) => {
      const { roleId: _legacyRole, ...rest } = profile as WorkProfile & { roleId?: string };
      return { ...rest, solutionIds: rest.solutionIds ?? [] };
    });
    const activeId = profiles.some((profile) => profile.id === parsed.activeId) ? (parsed.activeId ?? "") : (profiles[0]?.id ?? "");
    return {
      profiles,
      activeId,
      scope: parsed.scope === "account" ? "account" : "project",
      focusAccountId: parsed.focusAccountId ?? "",
      focusProjectId: parsed.focusProjectId ?? "",
    };
  } catch {
    return empty;
  }
}

const initial = load();
const [workProfileState, setWorkProfileState] = createStore({
  profiles: initial.profiles,
  activeId: initial.activeId,
  scope: initial.scope,
  focusAccountId: initial.focusAccountId,
  focusProjectId: initial.focusProjectId,
});

function persist() {
  const data: PersistedWorkProfiles = {
    profiles: workProfileState.profiles,
    activeId: workProfileState.activeId,
    scope: workProfileState.scope,
    focusAccountId: workProfileState.focusAccountId,
    focusProjectId: workProfileState.focusProjectId,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function activeWorkProfile() {
  return workProfileState.profiles.find((profile) => profile.id === workProfileState.activeId);
}

/** What the open workspace is allowed to use. Project scope is one job; account scope is every licensed solution. */
export function workspaceSlice() {
  const profile = activeWorkProfile();
  if (!profile) return null;
  const accountId = workProfileState.focusAccountId || profile.accountId;
  const account = accountById(accountId);
  if (!account) return null;
  const projects = projectsForAccount(accountId);
  const fallbackProject = accountId === profile.accountId ? profile.projectId : (projects[0]?.id ?? "");
  const projectId = projects.some((project) => project.id === (workProfileState.focusProjectId || fallbackProject))
    ? workProfileState.focusProjectId || fallbackProject
    : fallbackProject;

  if (workProfileState.scope === "account") {
    const solutionIds = [...account.solutionIds];
    const featureIds = featuresForSolutions(solutionIds).map((feature) => feature.id);
    return {
      scope: "account" as const,
      accountId,
      projectId,
      solutionIds,
      featureIds,
      productIds: productsUsedBy(featureIds),
      usingSavedWorkProfile: false,
    };
  }

  if (accountId === profile.accountId && projectId === profile.projectId) {
    return {
      scope: "project" as const,
      accountId,
      projectId,
      solutionIds: profile.solutionIds,
      featureIds: profile.featureIds,
      productIds: profile.productIds,
      usingSavedWorkProfile: true,
    };
  }

  const suggested = suggestedSelection(accountId, projectId);
  return {
    scope: "project" as const,
    accountId,
    projectId,
    solutionIds: suggested.solutionIds,
    featureIds: suggested.featureIds,
    productIds: suggested.productIds,
    usingSavedWorkProfile: false,
  };
}

export { workProfileState };

export function saveWorkProfile(input: Omit<WorkProfile, "id" | "userId" | "createdAt">) {
  const profile: WorkProfile = {
    ...input,
    name: input.name.trim() || "Work profile",
    id: `work-profile-${Date.now()}`,
    userId: currentUser.id,
    createdAt: new Date().toISOString(),
  };
  setWorkProfileState("profiles", (items) => [profile, ...items]);
  setWorkProfileState({
    activeId: profile.id,
    scope: "project",
    focusAccountId: "",
    focusProjectId: "",
  });
  persist();
  openProfileDashboard(profile.name, profile.featureIds);
  return profile;
}

export function selectWorkProfile(id: string) {
  const profile = workProfileState.profiles.find((item) => item.id === id);
  if (!profile) return;
  setWorkProfileState({
    activeId: id,
    scope: "project",
    focusAccountId: "",
    focusProjectId: "",
  });
  persist();
  openProfileDashboard(profile.name, profile.featureIds);
}

export function setWorkScope(scope: WorkScope) {
  const profile = activeWorkProfile();
  if (!profile) return;
  const accountId = workProfileState.focusAccountId || profile.accountId;
  const projects = projectsForAccount(accountId);
  const projectId = projects.some((project) => project.id === workProfileState.focusProjectId)
    ? workProfileState.focusProjectId
    : accountId === profile.accountId
      ? profile.projectId
      : (projects[0]?.id ?? "");
  setWorkProfileState({
    scope,
    focusAccountId: accountId,
    focusProjectId: projectId,
  });
  persist();
}

export function focusProject(projectId: string) {
  const slice = workspaceSlice();
  const project = projectById(projectId);
  if (!slice || !project || project.accountId !== slice.accountId) return;
  const saved = workProfileState.profiles.find(
    (profile) => profile.accountId === project.accountId && profile.projectId === projectId,
  );
  if (saved) {
    setWorkProfileState({
      activeId: saved.id,
      scope: "project",
      focusAccountId: "",
      focusProjectId: "",
    });
    persist();
    return;
  }
  setWorkProfileState({
    scope: "project",
    focusAccountId: project.accountId,
    focusProjectId: projectId,
  });
  persist();
}

export function focusAccount(accountId: string) {
  if (!accountById(accountId)) return;
  const projects = projectsForAccount(accountId);
  setWorkProfileState({
    scope: "account",
    focusAccountId: accountId,
    focusProjectId: projects[0]?.id ?? "",
  });
  persist();
}

export function deleteWorkProfile(id: string) {
  setWorkProfileState("profiles", (items) => items.filter((profile) => profile.id !== id));
  if (workProfileState.activeId === id) setWorkProfileState("activeId", workProfileState.profiles[0]?.id ?? "");
  persist();
}

export function resetWorkProfiles() {
  setWorkProfileState({ profiles: [], activeId: "", scope: "project", focusAccountId: "", focusProjectId: "" });
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Demo still resets in memory if storage is blocked.
  }
}
