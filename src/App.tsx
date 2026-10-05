import { createMemo, createSignal, Show } from "solid-js";
import { ChatWindow } from "@/components/ChatWindow";
import { EntitlementsPanel } from "@/components/EntitlementsPanel";
import { LoginPage } from "@/components/LoginPage";
import { ModusButton } from "@/components/modus/ModusButton";
import { PluginLauncher } from "@/components/PluginLauncher";
import { isAuthenticated, signOut } from "@/lib/auth";
import { currentUser } from "@/lib/currentUser";
import { state, toggleEntitlement } from "@/lib/mockStore";
import type { Entitlement, PluginId } from "@/lib/types";

export default function App() {
  return (
    <Show when={isAuthenticated()} fallback={<LoginPage />}>
      <Workspace />
    </Show>
  );
}

function Workspace() {
  const [mounted, setMounted] = createSignal<PluginId[]>([]);
  const entitlements = createMemo(() =>
    state.entitlements.filter((item) => item.userId === currentUser.id),
  );

  function handleToggle(item: Entitlement) {
    const result = toggleEntitlement(item.pluginId);
    if (result && !result.active) {
      setMounted((items) => items.filter((id) => id !== result.pluginId));
    }
  }

  return (
    <div class="min-h-screen bg-slate-50 text-slate-900">
      <modus-wc-navbar>
        <div slot="start" class="font-semibold">Trimble 360</div>
        <div slot="end" class="flex items-center gap-3">
          <span class="text-sm">{currentUser.name}</span>
          <modus-wc-avatar initials={currentUser.initials} />
          <ModusButton variant="outlined" onClick={signOut}>
            Sign out
          </ModusButton>
        </div>
      </modus-wc-navbar>
      <main class="mx-auto flex w-full max-w-7xl flex-col gap-5 p-5 lg:p-8">
        <div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p class="text-sm font-semibold text-blue-700">Connected product workspace</p>
            <h2 class="text-3xl font-bold">Trimble 360</h2>
            <p class="mt-1 text-slate-600">Compose Connect and WorksManager workflows through chat.</p>
          </div>
          <PluginLauncher
            entitlements={entitlements()}
            mounted={mounted()}
            onAdd={(id) => setMounted((items) => (items.includes(id) ? items : [...items, id]))}
          />
        </div>
        <div class="grid gap-5 lg:grid-cols-[1fr_280px]">
          <ChatWindow mountedPlugins={mounted()} onCreated={() => undefined} />
          <EntitlementsPanel entitlements={entitlements()} onToggle={handleToggle} />
        </div>
      </main>
    </div>
  );
}
