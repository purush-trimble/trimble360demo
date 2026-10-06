import { createMemo, createSignal, Show } from "solid-js";
import { ChatWindow } from "@/components/ChatWindow";
import { LoginPage } from "@/components/LoginPage";
import { ChatSidebar } from "@/components/layout/ChatSidebar";
import { SavedWidgetsPanel } from "@/components/layout/SavedWidgetsPanel";
import { ThemeSettings } from "@/components/layout/ThemeSettings";
import { ModusButton } from "@/components/modus/ModusButton";
import { isAuthenticated, signOut } from "@/lib/auth";
import { currentUser } from "@/lib/currentUser";
import { sendMessage, state } from "@/lib/mockStore";
import type { PluginId } from "@/lib/types";

export default function App() {
  return (
    <Show when={isAuthenticated()} fallback={<LoginPage />}>
      <Workspace />
    </Show>
  );
}

function Workspace() {
  const [mounted, setMounted] = createSignal<PluginId[]>([]);
  const [chatMenuOpen, setChatMenuOpen] = createSignal(true);
  const [showWidgets, setShowWidgets] = createSignal(true);
  const entitlements = createMemo(() => state.entitlements.filter((item) => item.userId === currentUser.id));
  const licensedProducts = createMemo(() =>
    entitlements()
      .filter((e) => e.active)
      .map((e) => e.pluginId),
  );
  function toggleProduct(id: PluginId) {
    setMounted((items) => (items.includes(id) ? items.filter((x) => x !== id) : [...items, id]));
  }

  function runWidgetPrompt(prompt: string) {
    sendMessage(prompt, mounted());
  }

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
          <ThemeSettings />
          <span class="text-sm">{currentUser.name}</span>
          <modus-wc-avatar initials={currentUser.initials} />
          <ModusButton variant="outlined" onClick={() => setShowWidgets((v) => !v)}>
            {showWidgets() ? "Hide widgets" : "Show widgets"}
          </ModusButton>
          <ModusButton variant="outlined" onClick={signOut}>
            Sign out
          </ModusButton>
        </div>
      </header>
      <div class="byop-shell flex h-[calc(100vh-64px)] w-full">
        <div class={`byop-chat-sidebar shrink-0 flex ${chatMenuOpen() ? "is-open" : "is-collapsed"}`}>
          <ChatSidebar
            open={chatMenuOpen()}
            onToggleOpen={() => setChatMenuOpen((open) => !open)}
            mounted={mounted()}
            licensedProducts={licensedProducts()}
            onToggleProduct={toggleProduct}
          />
        </div>
        <main class="flex min-w-0 flex-1 flex-col gap-4 p-4 lg:p-7">
          <div class="byop-main-header">
            <span class="byop-main-header-mark">+</span>
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-[var(--modus-wc-color-primary)]">Licensed product workspace</p>
              <h2 class="text-2xl font-bold tracking-tight">Compose workflows across Trimble products</h2>
              <p class="mt-1 text-sm opacity-65">Describe an outcome and BYOP will assemble the right product steps.</p>
            </div>
          </div>
          <ChatWindow mountedPlugins={mounted()} onCreated={() => undefined} />
        </main>
        <Show when={showWidgets()}>
          <div class="hidden w-80 shrink-0 xl:flex">
            <SavedWidgetsPanel onRunPrompt={runWidgetPrompt} />
          </div>
        </Show>
      </div>
    </div>
  );
}
