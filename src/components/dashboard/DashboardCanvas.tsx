import { Show, type JSX } from "solid-js";
import { CreateVclDesignCard } from "@/components/agent/CreateVclDesignCard";
import { PublishConnectToWmCard } from "@/components/agent/PublishConnectToWmCard";
import { ModusButton } from "@/components/modus/ModusButton";
import { AutoBidPluginCard } from "@/components/plugins/AutoBidPluginCard";
import { B2wEstimatePluginCard } from "@/components/plugins/B2wEstimatePluginCard";
import { ConnectPluginCard } from "@/components/plugins/ConnectPluginCard";
import { WorksManagerPluginCard } from "@/components/plugins/WorksManagerPluginCard";
import { DeviceManagementCard } from "@/components/plugins/DeviceManagementCard";
import { DesignWorkflowPanel } from "@/components/dashboard/DesignWorkflowPanel";
import { getActiveSavedWorkflow, openSavedWorkflowInChat, state } from "@/lib/mockStore";

const PANEL_VIEWS: Record<string, () => JSX.Element> = {
  design_workflow_unified: () => <DesignWorkflowPanel />,
  publish_connect_to_wm: () => <PublishConnectToWmCard />,
  create_design: () => <CreateVclDesignCard onCreated={() => undefined} />,
  create_vcl_design: () => <CreateVclDesignCard onCreated={() => undefined} />,
  connect_file_browser: () => <ConnectPluginCard />,
  worksmanager_design_list: () => {
    const saved = getActiveSavedWorkflow();
    const projectId = saved?.config?.projectId;
    const projectName = projectId ? state.projects.find((project) => project.id === projectId)?.name : undefined;
    return <WorksManagerPluginCard projectId={projectId} projectName={projectName} layout={saved?.config?.layout} />;
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
