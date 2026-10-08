import { createSignal, For, Show, type JSX } from "solid-js";
import { CreateDesignCard } from "@/components/agent/CreateDesignCard";
import { PublishConnectToWmCard } from "@/components/agent/PublishConnectToWmCard";
import { ModusButton } from "@/components/modus/ModusButton";
import { AutoBidPluginCard } from "@/components/plugins/AutoBidPluginCard";
import { B2wEstimatePluginCard } from "@/components/plugins/B2wEstimatePluginCard";
import { ConnectPluginCard } from "@/components/plugins/ConnectPluginCard";
import { WorksManagerPluginCard } from "@/components/plugins/WorksManagerPluginCard";
import { addDashboardWidget, getActiveDashboard, removeDashboardWidget, state } from "@/lib/mockStore";

const WIDGET_VIEWS: Record<string, () => JSX.Element> = {
  publish_connect_to_wm: () => <PublishConnectToWmCard />,
  create_design: () => <CreateDesignCard onCreated={() => undefined} />,
  connect_file_browser: () => <ConnectPluginCard />,
  worksmanager_design_list: () => <WorksManagerPluginCard />,
  b2westimate_list: () => <B2wEstimatePluginCard />,
  autobid_list: () => <AutoBidPluginCard />,
};

const BUILT_IN_WIDGETS = [
  { id: "builtin-publish", name: "Publish design to WorksManager", description: "Publish a Trimble Connect design to WorksManager devices", action: "publish_connect_to_wm" },
  { id: "builtin-create", name: "Create design", description: "Import from Connect and create a WorksManager design", action: "create_design" },
  { id: "builtin-connect", name: "Browse Connect files", description: "List and select Connect project files", action: "connect_file_browser" },
  { id: "builtin-wm", name: "WorksManager designs", description: "View designs in a WorksManager project", action: "worksmanager_design_list" },
  { id: "builtin-b2w", name: "B2W estimates", description: "View construction estimates", action: "b2westimate_list" },
  { id: "builtin-autobid", name: "AutoBid bids", description: "View and track competitive bids", action: "autobid_list" },
];

function AddWidgetModal(props: { onClose: () => void }) {
  const [query, setQuery] = createSignal("");
  const widgets = () => {
    const q = query().trim().toLowerCase();
    const all = [...BUILT_IN_WIDGETS.map((w) => ({ ...w, saved: false })), ...state.widgets.map((w) => ({ ...w, saved: true }))];
    return all.filter((w) => WIDGET_VIEWS[w.action] && `${w.name} ${w.description}`.toLowerCase().includes(q));
  };

  return (
    <div class="byop-modal-root" role="presentation" onKeyDown={(e) => e.key === "Escape" && props.onClose()}>
      <button type="button" class="byop-modal-backdrop" aria-label="Close widget library" onClick={props.onClose} />
      <div class="byop-modal-panel" role="dialog" aria-modal="true" aria-labelledby="add-widget-title">
        <div class="byop-modal-header byop-modal-header--widgets">
          <div class="min-w-0">
            <h2 id="add-widget-title" class="text-base font-semibold">Add widget</h2>
            <p class="byop-modal-subtitle">Pick a widget to place on this dashboard.</p>
          </div>
          <button type="button" class="byop-icon-button" aria-label="Close" title="Close" onClick={props.onClose}>
            ×
          </button>
        </div>
        <div class="byop-modal-body flex flex-col gap-3">
          <input
            class="byop-input w-full"
            aria-label="Search widgets"
            placeholder="Search widgets"
            value={query()}
            onInput={(e) => setQuery(e.currentTarget.value)}
            autofocus
          />
          <div class="min-h-0 flex-1 space-y-2 overflow-y-auto">
            <For each={widgets()} fallback={<p class="text-sm opacity-60">No widgets match your search.</p>}>
              {(w) => (
                <button
                  type="button"
                  class="flex w-full items-center gap-3 rounded-lg border border-[var(--modus-wc-color-base-200)] p-3 text-left hover:bg-[var(--modus-wc-color-base-200)]"
                  onClick={() => {
                    addDashboardWidget({ name: w.name, action: w.action });
                    props.onClose();
                  }}
                >
                  <span class="min-w-0 flex-1">
                    <strong class="block text-sm">{w.name}</strong>
                    <span class="block text-xs opacity-65">{w.description}</span>
                  </span>
                  <Show when={w.saved}>
                    <span class="rounded-full border border-[var(--modus-wc-color-base-300)] px-2 py-0.5 text-xs opacity-70">Saved</span>
                  </Show>
                  <span aria-hidden="true" class="text-lg opacity-60">+</span>
                </button>
              )}
            </For>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardCanvas() {
  const [adding, setAdding] = createSignal(false);
  const dashboard = () => getActiveDashboard();

  return (
    <main class="byop-view-enter flex min-w-0 flex-1 flex-col gap-4 overflow-hidden p-4 lg:p-7">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-xs font-bold uppercase tracking-wider text-[var(--modus-wc-color-primary)]">Dashboard</p>
          <h2 class="text-2xl font-bold tracking-tight">{dashboard()?.name}</h2>
        </div>
        <ModusButton onClick={() => setAdding(true)}>+ Add widget</ModusButton>
      </div>
      <div class="byop-canvas min-h-0 flex-1 overflow-y-auto rounded-2xl border border-[var(--modus-wc-color-base-200)] p-4">
        <Show
          when={dashboard()?.widgets.length}
          fallback={
            <div class="grid h-full place-items-center text-center">
              <div>
                <p class="font-semibold">This dashboard is empty</p>
                <p class="mb-3 text-sm opacity-70">Add widgets to build your view.</p>
                <ModusButton variant="outlined" onClick={() => setAdding(true)}>
                  + Add widget
                </ModusButton>
              </div>
            </div>
          }
        >
          <div class="grid gap-4 xl:grid-cols-2">
            <For each={dashboard()?.widgets}>
              {(w) => (
                <section class="byop-message-card relative" aria-label={w.name}>
                  <button
                    type="button"
                    class="byop-widget-remove"
                    aria-label={`Remove ${w.name}`}
                    title="Remove widget"
                    onClick={() => removeDashboardWidget(w.id)}
                  >
                    ×
                  </button>
                  {WIDGET_VIEWS[w.action]?.()}
                </section>
              )}
            </For>
          </div>
        </Show>
      </div>
      <Show when={adding()}>
        <AddWidgetModal onClose={() => setAdding(false)} />
      </Show>
    </main>
  );
}
