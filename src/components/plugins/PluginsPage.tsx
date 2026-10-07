import { createSignal, For, Show } from "solid-js";
import { ModusButton } from "@/components/modus/ModusButton";
import { PLUGIN_CATALOG } from "@/lib/pluginCatalog";
import {
  beginPluginConnect,
  completePluginConnect,
  disconnectPlugin,
  getEntitlements,
  getPluginConnection,
  listConnectablePluginIds,
} from "@/lib/mockStore";
import type { PluginConnectionStatus, PluginId } from "@/lib/types";
import { currentUser } from "@/lib/currentUser";

const statusLabel: Record<PluginConnectionStatus, string> = {
  disconnected: "Not connected",
  pending: "Connecting…",
  connected: "Connected",
  error: "Connection failed",
};

function maskFchid(value: string) {
  if (value.length <= 8) return value;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

function PluginLicenseCard(props: {
  pluginId: PluginId;
  plan: string;
  draft: string;
  onDraft: (value: string) => void;
}) {
  const meta = PLUGIN_CATALOG[props.pluginId];
  const connection = () => getPluginConnection(props.pluginId);
  const status = () => connection()?.status ?? "disconnected";
  const isPending = () => status() === "pending";

  function connect() {
    const value = props.draft;
    const result = beginPluginConnect(props.pluginId, value);
    if (!result.ok) return;
    window.setTimeout(() => completePluginConnect(props.pluginId), 1100);
  }

  return (
    <modus-wc-card class="byop-plugin-card">
      <div class="byop-plugin-card-body">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-xs font-bold uppercase tracking-wider opacity-60">{meta.vendor}</p>
            <h3 class="text-lg font-semibold">{meta.name}</h3>
            <p class="mt-1 text-sm opacity-70">{meta.description}</p>
          </div>
          <span class={`byop-plugin-status is-${status()}`}>{statusLabel[status()]}</span>
        </div>
        <dl class="byop-plugin-meta mt-4">
          <div>
            <dt>Plan</dt>
            <dd>{props.plan}</dd>
          </div>
          <Show when={connection()?.fchid && status() === "connected"}>
            <div>
              <dt>FCHID</dt>
              <dd>{maskFchid(connection()!.fchid!)}</dd>
            </div>
          </Show>
        </dl>

        <Show when={status() === "error" && connection()?.lastError}>
          <p class="byop-plugin-error mt-3 text-sm" role="alert">{connection()!.lastError}</p>
        </Show>

        <Show when={status() === "disconnected" || status() === "error"}>
          <label class="mt-4 block">
            <span class="mb-1 block text-xs font-semibold uppercase opacity-60">Federation ID</span>
            <input
              class="byop-input w-full"
              placeholder="FCHID-…"
              value={props.draft}
              disabled={isPending()}
              onInput={(e) => props.onDraft(e.currentTarget.value)}
            />
            <span class="mt-1 block text-xs opacity-60">{meta.fchidHint}</span>
          </label>
        </Show>

        <div class="byop-plugin-card-actions">
          <Show when={status() === "disconnected" || status() === "error"}>
            <ModusButton variant="filled" disabled={isPending()} onClick={connect}>
              {isPending() ? "Connecting…" : "Connect plugin"}
            </ModusButton>
          </Show>

          <Show when={status() === "pending"}>
            <div class="byop-plugin-pending" aria-live="polite">
              <span class="byop-spinner" aria-hidden="true" />
              Verifying FCHID with Trimble identity…
            </div>
          </Show>

          <Show when={status() === "connected"}>
            <ModusButton variant="outlined" onClick={() => disconnectPlugin(props.pluginId)}>
              Disconnect
            </ModusButton>
          </Show>
        </div>
      </div>
    </modus-wc-card>
  );
}

export function PluginsPage(props: { onBack: () => void }) {
  const [draftFchid, setDraftFchid] = createSignal<Partial<Record<PluginId, string>>>({});
  const licensed = () => listConnectablePluginIds();

  const planFor = (id: PluginId) =>
    getEntitlements().find((e) => e.userId === currentUser.id && e.pluginId === id)?.plan ?? "Licensed";

  return (
    <div class="byop-plugins-page byop-view-enter flex min-h-0 flex-1 flex-col gap-6 p-4 lg:p-7">
      <header class="byop-plugins-header">
        <button type="button" class="byop-plugins-back" onClick={props.onBack}>
          <span aria-hidden="true">←</span>
          Back to workspace
        </button>
        <div class="byop-main-header byop-plugins-header-main">
          <span class="byop-main-header-mark byop-plugins-header-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              <circle cx="12" cy="12" r="3.2" />
            </svg>
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-bold uppercase tracking-wider text-[var(--modus-wc-color-primary)]">Integrations</p>
            <h2 class="text-2xl font-bold tracking-tight">Plugins</h2>
            <p class="mt-1 max-w-2xl text-sm opacity-65">
              Connect licensed Trimble products with your federation ID (FCHID). Connected plugins can be mounted in chat workflows.
            </p>
          </div>
          <span class="byop-plugins-count shrink-0 self-start">{licensed().length} licensed</span>
        </div>
      </header>

      <div class="byop-plugins-grid">
        <For each={licensed()}>
          {(pluginId) => (
            <PluginLicenseCard
              pluginId={pluginId}
              plan={planFor(pluginId)}
              draft={draftFchid()[pluginId] ?? ""}
              onDraft={(value) => setDraftFchid((prev) => ({ ...prev, [pluginId]: value }))}
            />
          )}
        </For>
      </div>

      <Show when={!licensed().length}>
        <div class="byop-empty-state p-6 text-sm">
          <p class="font-semibold">No licensed plugins</p>
          <p class="mt-1 opacity-70">Your account does not have active product entitlements in this demo.</p>
        </div>
      </Show>
    </div>
  );
}
