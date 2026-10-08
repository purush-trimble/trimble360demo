import { createMemo, createSignal, Show } from "solid-js";
import { ChatWindow } from "@/components/ChatWindow";
import { DashboardCanvas } from "@/components/dashboard/DashboardCanvas";
import { LoginPage } from "@/components/LoginPage";
import { ChatSidebar } from "@/components/layout/ChatSidebar";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import { WorkProfileSetup } from "@/components/WorkProfileSetup";
import { WorkContextBar } from "@/components/WorkContextBar";
import { PluginsPage } from "@/components/plugins/PluginsPage";
import { ModusButton } from "@/components/modus/ModusButton";
import { isAuthenticated, signOut } from "@/lib/auth";
import { isPluginConnected, listConnectablePluginIds, state } from "@/lib/mockStore";
import { promptsFor } from "@/lib/workProfileCatalog";
import { activeWorkProfile, workspaceSlice } from "@/lib/workProfiles";

type AppView = "workspace" | "plugins" | "profile-setup";

export default function App() {
  return (
    <Show when={isAuthenticated()} fallback={<LoginPage />}>
      <Workspace />
    </Show>
  );
}

function Workspace() {
  const [chatMenuOpen, setChatMenuOpen] = createSignal(true);
  const [view, setView] = createSignal<AppView>(workspaceSlice() ? "workspace" : "profile-setup");
  const [tab, setTab] = createSignal<"chats" | "dashboard">("dashboard");

  const slice = createMemo(() => workspaceSlice());
  const profile = createMemo(() => activeWorkProfile());

  const scopedPlugins = createMemo(() => {
    const allowed = slice()?.productIds;
    if (!allowed?.length) return listConnectablePluginIds().filter((id) => isPluginConnected(id));
    return listConnectablePluginIds().filter((id) => isPluginConnected(id) && allowed.includes(id));
  });

  const suggestedPrompts = createMemo(() => promptsFor(slice()?.featureIds ?? []));

  const showPluginsNav = () => state.preferences.pluginsMenuVisible;

  function openProfileSetup() {
    setView("profile-setup");
  }

  function finishProfileSetup() {
    setView("workspace");
    setTab("dashboard");
  }

  return (
    <div class="byop-app min-h-screen bg-[var(--modus-wc-color-base-page)] text-[var(--modus-wc-color-base-content)]">
      <header class="byop-topbar">
        <Show when={view() === "workspace"}>
          <button
            type="button"
            class="byop-icon-button byop-menu-toggle"
            aria-label={chatMenuOpen() ? "Close chat menu" : "Open chat menu"}
            title={chatMenuOpen() ? "Close chat menu" : "Open chat menu"}
            onClick={() => setChatMenuOpen((open) => !open)}
          >
            ☰
          </button>
        </Show>
        <div class="byop-brand">
          <span class="byop-brand-mark">360</span>
          <span>
            <strong class="block text-sm">Trimble 360</strong>
            <span class="block text-xs opacity-60">Role-ready project handbook</span>
          </span>
        </div>
        <div class="byop-topbar-actions">
          <Show when={view() === "workspace" && slice()}>
            <ModusButton variant="outlined" onClick={openProfileSetup}>
              Work profiles
            </ModusButton>
          </Show>
          <ProfileMenu onOpenPlugins={() => setView("plugins")} />
          <ModusButton variant="outlined" onClick={signOut}>
            Sign out
          </ModusButton>
        </div>
      </header>
      <Show when={view() === "profile-setup"}>
        <WorkProfileSetup onDone={finishProfileSetup} onCancel={slice() ? finishProfileSetup : undefined} />
      </Show>
      <Show when={view() !== "profile-setup"}>
        <div class="byop-shell flex h-[calc(100vh-64px)] w-full">
          <Show when={view() === "workspace"}>
            <div class={`byop-chat-sidebar shrink-0 flex ${chatMenuOpen() ? "is-open" : "is-collapsed"}`}>
              <ChatSidebar
                open={chatMenuOpen()}
                onToggleOpen={() => setChatMenuOpen((open) => !open)}
                connectedProducts={scopedPlugins()}
                showPluginsNav={showPluginsNav()}
                onOpenPlugins={() => setView("plugins")}
                activeTab={tab()}
                onTabChange={setTab}
              />
            </div>
          </Show>
          <Show
            when={view() === "workspace"}
            fallback={
              <div class="flex min-w-0 flex-1">
                <PluginsPage onBack={() => setView(slice() ? "workspace" : "profile-setup")} />
              </div>
            }
          >
            <Show when={tab() === "chats"} fallback={<DashboardCanvas allowedFeatureIds={slice()?.featureIds} workProfileName={profile()?.name} />}>
              <main class="byop-view-enter flex min-w-0 flex-1 flex-col gap-4 overflow-hidden p-4 lg:p-7">
                <div class="byop-main-header shrink-0">
                  <WorkContextBar profileName={profile()?.name ?? "Work profile"} />
                </div>
                <ChatWindow
                  mountedPlugins={scopedPlugins()}
                  connectedPlugins={scopedPlugins()}
                  suggestedPrompts={suggestedPrompts()}
                  allowedFeatureIds={slice()?.featureIds}
                  onCreated={() => undefined}
                />
              </main>
            </Show>
          </Show>
        </div>
      </Show>
    </div>
  );
}
