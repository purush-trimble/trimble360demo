import { createMemo, createSignal, Show } from "solid-js";
import logo360 from "@/assets/logo360.svg";
import { ChatWindow } from "@/components/ChatWindow";
import { DashboardCanvas } from "@/components/dashboard/DashboardCanvas";
import { LoginPage } from "@/components/LoginPage";
import { WelcomePage } from "@/components/WelcomePage";
import { ChatSidebar } from "@/components/layout/ChatSidebar";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import { isAuthenticated } from "@/lib/auth";
import { saveWorkflow } from "@/lib/mockStore";
import { markWelcomed, hasSeenWelcome, type WelcomeWorkflow } from "@/lib/welcomeWorkflows";
import { currentUser } from "@/lib/currentUser";
import { selectionFromWidget, widgetById } from "@/lib/workProfileCatalog";

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

  const suggestedPrompts = createMemo(() => currentUser.prompts);

  function continueToChat() {
    markWelcomed();
    setTab("chats");
    setView("workspace");
  }

  function launchWorkflow(workflow: WelcomeWorkflow) {
    const widget = widgetById(workflow.widgetId);
    if (!widget) return continueToChat();
    const selected = selectionFromWidget("acct-morgan", widget);
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
    <div class="byop-app flex min-h-screen flex-col bg-[var(--modus-wc-color-base-page)] text-[var(--modus-wc-color-base-content)]">
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
          <img class="byop-brand-mark" src={logo360} alt="Trimble 360" />
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
        <div class="byop-shell flex min-h-0 flex-1 w-full">
          <Show when={view() === "workspace"}>
            <div class={`byop-chat-sidebar shrink-0 flex ${chatMenuOpen() ? "is-open" : "is-collapsed"}`}>
              <ChatSidebar
                open={chatMenuOpen()}
                onToggleOpen={() => setChatMenuOpen((open) => !open)}
                activeTab={tab()}
                onTabChange={setTab}
              />
            </div>
          </Show>
          <Show when={tab() === "chats"} fallback={<DashboardCanvas onEdit={() => setTab("chats")} />}>
            <main class="byop-view-enter flex min-w-0 flex-1 flex-col gap-4 overflow-hidden p-4 lg:p-7">
              <ChatWindow
                suggestedPrompts={suggestedPrompts()}
                onCreated={() => undefined}
              />
            </main>
          </Show>
        </div>
      </Show>
    </div>
  );
}
