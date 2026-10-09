import { createSignal, For, Show, type JSX } from "solid-js";
import { CreateDesignCard } from "@/components/agent/CreateDesignCard";
import { CreateVclDesignCard } from "@/components/agent/CreateVclDesignCard";
import { PublishConnectToWmCard } from "@/components/agent/PublishConnectToWmCard";
import { ModusButton } from "@/components/modus/ModusButton";
import { AutoBidPluginCard } from "@/components/plugins/AutoBidPluginCard";
import { B2wEstimatePluginCard } from "@/components/plugins/B2wEstimatePluginCard";
import { ConnectPluginCard } from "@/components/plugins/ConnectPluginCard";
import { WorksManagerPluginCard } from "@/components/plugins/WorksManagerPluginCard";
import { DeviceManagementCard } from "@/components/plugins/DeviceManagementCard";
import { DesignWorkflowPanel } from "@/components/dashboard/DesignWorkflowPanel";
import {
  DESIGN_WORKFLOW_ACTION,
  FEATURE_ACTION,
  featureById,
} from "@/lib/workProfileCatalog";
import { getActiveSavedWorkflow, openSavedWorkflowInChat, state } from "@/lib/mockStore";

const PANEL_VIEWS: Record<string, () => JSX.Element> = {
  design_workflow_unified: () => <DesignWorkflowPanel />,
  publish_connect_to_wm: () => <PublishConnectToWmCard />,
  create_design: () => <CreateDesignCard onCreated={() => undefined} />,
  create_vcl_design: () => <CreateVclDesignCard onCreated={() => undefined} />,
  connect_file_browser: () => <ConnectPluginCard />,
  worksmanager_design_list: () => {
    const saved = getActiveSavedWorkflow();
    const projectId = saved?.config?.projectId;
    const projectName = projectId ? state.projects.find((project) => project.id === projectId)?.name : undefined;
    return <WorksManagerPluginCard projectId={projectId} projectName={projectName} />;
  },
  device_management: () => {
    const saved = getActiveSavedWorkflow();
    const projectId = saved?.config?.projectId;
    const projectName = projectId ? state.projects.find((project) => project.id === projectId)?.name : undefined;
    return <DeviceManagementCard projectId={projectId} projectName={projectName} />;
  },
  b2westimate_list: () => <B2wEstimatePluginCard />,
  autobid_list: () => <AutoBidPluginCard />,
};

const FEATURE_PANELS = [
  {
    id: "panel-design-workflow",
    featureId: "create_design",
    name: "Create, compare, publish",
    description: "Create a design, compare field designs, and publish in one flow",
    action: DESIGN_WORKFLOW_ACTION,
    bundleOnly: true,
  },
  { id: "panel-publish", featureId: "publish_to_wm", name: "Publish to the field", description: "Send a Connect file to WorksManager devices", action: "publish_connect_to_wm", bundleOnly: false },
  { id: "panel-create", featureId: "create_design", name: "Create a design", description: "Start a field design from shared project files", action: "create_design", bundleOnly: false },
  { id: "panel-vcl", featureId: "create_vcl_design", name: "Create a VCL design", description: "Import and prepare a VCL file for a field device", action: "create_vcl_design", bundleOnly: false },
  { id: "panel-connect", featureId: "connect_files", name: "Browse project files", description: "Open shared Connect files for this job", action: "connect_file_browser", bundleOnly: false },
  { id: "panel-wm", featureId: "wm_designs", name: "Field designs", description: "Review designs this job builds from", action: "worksmanager_design_list", bundleOnly: false },
  { id: "panel-devices", featureId: "wm_devices", name: "Project devices", description: "View device types and manage assigned equipment", action: "device_management", bundleOnly: false },
  { id: "panel-b2w", featureId: "b2w_estimates", name: "Estimates", description: "Review the estimate behind this bid", action: "b2westimate_list", bundleOnly: false },
  { id: "panel-autobid", featureId: "autobid_bids", name: "Bids", description: "Track bid packages and due dates", action: "autobid_list", bundleOnly: false },
];

function AddPanelModal(props: { onClose: () => void }) {
  const [query, setQuery] = createSignal("");

  const panels = () => {
    const q = query().trim().toLowerCase();
    const catalog = FEATURE_PANELS.filter((panel) => {
      return !panel.bundleOnly;
    });
    const all = [...catalog.map((panel) => ({ ...panel, saved: false })), ...state.savedWorkflows.map((workflow) => ({ ...workflow, saved: true, featureId: "" }))];
    return all.filter((panel) => PANEL_VIEWS[panel.action] && `${panel.name} ${panel.description}`.toLowerCase().includes(q));
  };

  return (
    <div class="byop-modal-root" role="presentation" onKeyDown={(e) => e.key === "Escape" && props.onClose()}>
      <button type="button" class="byop-modal-backdrop" aria-label="Close panel picker" onClick={props.onClose} />
      <div class="byop-modal-panel" role="dialog" aria-modal="true" aria-labelledby="add-panel-title">
        <div class="byop-modal-header byop-modal-header--panels">
          <div class="min-w-0">
            <h2 id="add-panel-title" class="text-base font-semibold">Add tool panel</h2>
            <p class="byop-modal-subtitle">Choose the tools you want in this saved workflow.</p>
          </div>
          <button type="button" class="byop-icon-button" aria-label="Close" title="Close" onClick={props.onClose}>
            ×
          </button>
        </div>
        <div class="byop-modal-body flex flex-col gap-3">
          <input
            class="byop-input w-full"
            aria-label="Search tools"
            placeholder="Search tools"
            value={query()}
            onInput={(e) => setQuery(e.currentTarget.value)}
            autofocus
          />
          <div class="min-h-0 flex-1 space-y-2 overflow-y-auto">
            <For each={panels()} fallback={<p class="text-sm opacity-60">No tools match your search.</p>}>
              {(panel) => (
                <button
                  type="button"
                  class="flex w-full items-center gap-3 rounded-lg border border-[var(--modus-wc-color-base-200)] p-3 text-left hover:bg-[var(--modus-wc-color-base-200)]"
                  onClick={() => {
                    addDashboardPanel({ name: panel.name, action: panel.action });
                    props.onClose();
                  }}
                >
                  <span class="min-w-0 flex-1">
                    <strong class="block text-sm">{panel.name}</strong>
                    <span class="block text-xs opacity-65">{panel.description}</span>
                  </span>
                  <Show when={panel.saved}>
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

export function DashboardCanvas(props: { onEdit?: () => void }) {
  const workflow = () => getActiveSavedWorkflow();

  return (
    <main class="byop-view-enter flex min-w-0 flex-1 flex-col gap-4 overflow-hidden p-4 lg:p-7">
      <div class="flex shrink-0 items-center justify-between gap-3">
        <div>
          <p class="text-xs font-bold uppercase tracking-wider text-[var(--modus-wc-color-primary)]">Saved workflow</p>
          <h2 class="text-xl font-bold tracking-tight">{workflow()?.name ?? "Saved widgets"}</h2>
          <p class="text-sm opacity-65">{workflow()?.description ?? "Choose a saved widget from the sidebar."}</p>
        </div>
        <Show when={workflow()}>
          <ModusButton onClick={() => { openSavedWorkflowInChat(workflow()!.id); props.onEdit?.(); }}>Edit in new chat</ModusButton>
        </Show>
      </div>
      <div class="byop-canvas min-h-0 flex-1 overflow-y-auto rounded-2xl border border-[var(--modus-wc-color-base-200)] p-4">
        <Show
          when={workflow()}
          fallback={
            <div class="grid h-full place-items-center text-center">
              <div>
                <p class="font-semibold">No saved widget selected</p>
                <p class="text-sm opacity-70">Choose one from the Saved workflows list.</p>
              </div>
            </div>
          }
        >
          <section class="byop-message-card" aria-label={workflow()!.name}>
            <p class="mb-3 text-xs font-semibold uppercase tracking-wide opacity-60">{workflow()!.description}</p>
            {PANEL_VIEWS[workflow()!.action]?.()}
          </section>
        </Show>
      </div>
    </main>
  );
}
