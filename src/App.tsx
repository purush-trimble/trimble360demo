import { createMemo, createSignal, Show } from "solid-js";
import { ChatWindow } from "@/components/ChatWindow";
import { LoginPage } from "@/components/LoginPage";
import { ChatSidebar } from "@/components/layout/ChatSidebar";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import { PluginsPage } from "@/components/plugins/PluginsPage";
import { ModusButton } from "@/components/modus/ModusButton";
import { isAuthenticated, signOut } from "@/lib/auth";
import { isPluginConnected, listConnectablePluginIds, state } from "@/lib/mockStore";

type AppView = "workspace" | "plugins";

export default function App() {
  return (
    <Show when={isAuthenticated()} fallback={<LoginPage />}>
      <Workspace />
    </Show>
  );
}

function Workspace() {
  const [chatMenuOpen, setChatMenuOpen] = createSignal(true);
  const [view, setView] = createSignal<AppView>("workspace");

  const connectedPlugins = createMemo(() => listConnectablePluginIds().filter((id) => isPluginConnected(id)));

  const showPluginsNav = () => state.preferences.pluginsMenuVisible;

  return (
    <div class="byop-app min-h-screen bg-[var(--modus-wc-color-base-page)] text-[var(--modus-wc-color-base-content)]">
      <header class="byop-topbar">
        <button
          type="button"
          class="byop-icon-button byop-menu-toggle"
          aria-label={chatMenuOpen() ? "Close chat menu" : "Open chat menu"}
          title={chatMenuOpen() ? "Close chat menu" : "Open chat menu"}
          onClick={() => setChatMenuOpen((open) => !open)}
        >
          ☰
        </button>
        <div class="byop-brand">
          <span class="byop-brand-mark">BY</span>
          <span>
            <strong class="block text-sm">Build Your Own Product</strong>
            <span class="block text-xs opacity-60">Trimble workspace</span>
          </span>
        </div>
        <div class="byop-topbar-actions">
          <Show when={showPluginsNav()}>
            <ModusButton variant="text" onClick={() => setView("plugins")}>Plugins</ModusButton>
          </Show>
          <ProfileMenu onOpenPlugins={() => setView("plugins")} />
          <ModusButton variant="outlined" onClick={signOut}>
            Sign out
          </ModusButton>
        </div>
      </header>
      <div class="byop-shell flex h-[calc(100vh-64px)] w-full">
        <Show when={view() === "workspace"}>
          <div class={`byop-chat-sidebar shrink-0 flex ${chatMenuOpen() ? "is-open" : "is-collapsed"}`}>
            <ChatSidebar
              open={chatMenuOpen()}
              onToggleOpen={() => setChatMenuOpen((open) => !open)}
              connectedProducts={connectedPlugins()}
              showPluginsNav={showPluginsNav()}
              onOpenPlugins={() => setView("plugins")}
            />
          </div>
        </Show>
        <Show
          when={view() === "workspace"}
          fallback={
            <div class="flex min-w-0 flex-1">
              <PluginsPage onBack={() => setView("workspace")} />
            </div>
          }
        >
          <main class="byop-view-enter flex min-w-0 flex-1 flex-col gap-4 p-4 lg:p-7">
            <div class="byop-main-header">
              <span class="byop-main-header-mark">+</span>
              <div>
                <p class="text-xs font-bold uppercase tracking-wider text-[var(--modus-wc-color-primary)]">Licensed product workspace</p>
                <h2 class="text-2xl font-bold tracking-tight">Compose workflows across Trimble products</h2>
                <p class="mt-1 text-sm opacity-65">Describe an outcome and BYOP will assemble the right product steps.</p>
              </div>
            </div>
            <ChatWindow
              mountedPlugins={connectedPlugins()}
              connectedPlugins={connectedPlugins()}
              onCreated={() => undefined}
            />
          </main>
        </Show>
      </div>
    </div>
  );
}
