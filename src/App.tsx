import { createMemo, createSignal, Show } from "solid-js";
import { ChatWindow } from "@/components/ChatWindow";
import { DashboardCanvas } from "@/components/dashboard/DashboardCanvas";
import { LoginPage } from "@/components/LoginPage";
import { WelcomePage } from "@/components/WelcomePage";
import { ChatSidebar } from "@/components/layout/ChatSidebar";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import { isAuthenticated } from "@/lib/auth";
import {
  beginPluginConnect,
  completePluginConnect,
  isPluginConnected,
  listConnectablePluginIds,
  saveWorkflow,
} from "@/lib/mockStore";
import { markWelcomed, hasSeenWelcome, type WelcomeWorkflow } from "@/lib/welcomeWorkflows";
import { promptsFor, selectionFromWidget, widgetById } from "@/lib/workProfileCatalog";
import { workspaceSlice } from "@/lib/workProfiles";
import { saveWorkProfile } from "@/lib/workProfiles";

type AppView = "workspace" | "welcome";

export default function App() {
  return (
    <Show when={isAuthenticated()} fallback={<LoginPage />}>
      <Workspace />
    </Show>
  );
}

function Workspace() {
  const [chatMenuOpen, setChatMenuOpen] = createSignal(true);
  const [view, setView] = createSignal<AppView>(hasSeenWelcome() ? "workspace" : "welcome");
  const [tab, setTab] = createSignal<"chats" | "dashboard">(hasSeenWelcome() ? "chats" : "dashboard");

  const slice = createMemo(() => workspaceSlice());

  const scopedPlugins = createMemo(() => {
    const allowed = slice()?.productIds;
    if (!allowed?.length) return listConnectablePluginIds().filter((id) => isPluginConnected(id));
    return listConnectablePluginIds().filter((id) => isPluginConnected(id) && allowed.includes(id));
  });

  const suggestedPrompts = createMemo(() => promptsFor(slice()?.featureIds ?? []));

  function continueToChat() {
    markWelcomed();
    setTab("chats");
    setView("workspace");
  }

  function launchWorkflow(workflow: WelcomeWorkflow) {
    const widget = widgetById(workflow.widgetId);
    if (!widget) return continueToChat();
    for (const pluginId of listConnectablePluginIds()) {
      if (isPluginConnected(pluginId)) continue;
      const result = beginPluginConnect(pluginId, `FCHID-DEMO-${pluginId.toUpperCase()}-88442211`);
      if (result.ok) completePluginConnect(pluginId);
    }
    const selected = selectionFromWidget("acct-morgan", widget);
    if (!workspaceSlice()) {
      saveWorkProfile({
        name: selected.name,
        accountId: "acct-morgan",
        projectId: "proj-north-ridge",
        solutionIds: selected.solutionIds,
        featureIds: selected.featureIds,
        productIds: selected.productIds,
        widgetId: selected.widgetId,
      });
    }
    markWelcomed();
    saveWorkflow({
      name: selected.name,
      description: widget.valueStory,
      prompt: selected.featureIds.includes("create_vcl_design") ? "create a VCL design" : "create a design",
      action: selected.featureIds.includes("create_vcl_design") ? "create_vcl_design" : "create_design",
      productIds: selected.productIds,
    });
    setTab("dashboard");
    setView("workspace");
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
          <img class="byop-brand-mark" src="/logo360.svg" alt="Trimble 360" />
          <span>
            <strong class="block text-sm">Trimble 360</strong>
            <span class="block text-xs opacity-60">Role-ready project handbook</span>
          </span>
        </div>
        <div class="byop-topbar-actions">
          <ProfileMenu />
        </div>
      </header>
      <Show when={view() === "welcome"}>
        <WelcomePage onLaunch={launchWorkflow} onContinueToChat={continueToChat} />
      </Show>
      <Show when={view() !== "welcome"}>
        <div class="byop-shell flex h-[calc(100vh-64px)] w-full">
          <Show when={view() === "workspace"}>
            <div class={`byop-chat-sidebar shrink-0 flex ${chatMenuOpen() ? "is-open" : "is-collapsed"}`}>
              <ChatSidebar
                open={chatMenuOpen()}
                onToggleOpen={() => setChatMenuOpen((open) => !open)}
                connectedProducts={scopedPlugins()}
                activeTab={tab()}
                onTabChange={setTab}
              />
            </div>
          </Show>
          <Show when={tab() === "chats"} fallback={<DashboardCanvas allowedFeatureIds={slice()?.featureIds} onEdit={() => setTab("chats")} />}>
            <main class="byop-view-enter flex min-w-0 flex-1 flex-col gap-4 overflow-hidden p-4 lg:p-7">
              <ChatWindow
                mountedPlugins={scopedPlugins()}
                connectedPlugins={scopedPlugins()}
                suggestedPrompts={suggestedPrompts()}
                allowedFeatureIds={slice()?.featureIds}
                onCreated={() => undefined}
              />
            </main>
          </Show>
        </div>
      </Show>
    </div>
  );
}
