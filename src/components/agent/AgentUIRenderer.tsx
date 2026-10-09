import type { AgentUIAction } from "@/lib/agent/types";
import { createSignal } from "solid-js";
import { ConnectPluginCard } from "@/components/plugins/ConnectPluginCard";
import { WorksManagerPluginCard } from "@/components/plugins/WorksManagerPluginCard";
import { DeviceManagementCard } from "@/components/plugins/DeviceManagementCard";
import { B2wEstimatePluginCard } from "@/components/plugins/B2wEstimatePluginCard";
import { AutoBidPluginCard } from "@/components/plugins/AutoBidPluginCard";
import { CreateDesignCard } from "./CreateDesignCard";
import { CreateVclDesignCard } from "./CreateVclDesignCard";
import { EntitlementUpsellCard } from "./EntitlementUpsellCard";
import { PublishConnectToWmCard } from "./PublishConnectToWmCard";
import { SaveWorkflowButton } from "./SaveWorkflowButton";
import { SuggestionChips } from "./SuggestionChips";
import { ProjectPickerCard } from "./ProjectPickerCard";

export function AgentUIRenderer(props: {
  action: AgentUIAction;
  onPrompt: (prompt: string) => void;
  onCreated: () => void;
  onProjectSelected: (projectId: string) => void;
}) {
  switch (props.action.type) {
    case "create_design":
      return (
        <div class="space-y-2">
          <CreateDesignCard onCreated={props.onCreated} />
          <SaveWorkflowButton
            name="Create design"
            description="Import from Connect and create a WorksManager design"
            prompt="create a design"
            action="create_design"
            productIds={["worksmanager", "connect"]}
            workflowId={props.action.workflowId}
            config={props.action.config}
          />
        </div>
      );
    case "create_vcl_design":
      {
      const [config, setConfig] = createSignal(props.action.config);
      return (
        <div class="space-y-2">
          <CreateVclDesignCard initialConfig={config()} onConfigChange={(next) => setConfig((current) => ({ ...current, ...next }))} onCreated={props.onCreated} />
          <SaveWorkflowButton
            name="Create a VCL design"
            description="Import a VCL file and target it to the right project and field device"
            prompt="create a VCL design"
            action="create_vcl_design"
            productIds={["connect", "worksmanager"]}
            workflowId={props.action.workflowId}
            config={config()}
          />
        </div>
      );
      }
    case "connect_file_browser":
      return (
        <div class="space-y-2">
          <ConnectPluginCard />
          <SaveWorkflowButton
            name="Browse Connect files"
            description="List and select Connect project files"
            prompt="show my Connect files"
            action="connect_file_browser"
            productIds={["connect"]}
          />
        </div>
      );
    case "worksmanager_design_list":
      return (
        <div class="space-y-2">
          <WorksManagerPluginCard projectId={props.action.projectId} projectName={props.action.projectName} />
          <SaveWorkflowButton
            name="WorksManager designs"
            description="View designs in a WorksManager project"
            prompt="show my designs"
            action="worksmanager_design_list"
            productIds={["worksmanager"]}
            workflowId={props.action.workflowId}
            config={{ ...props.action.config, projectId: props.action.projectId ?? props.action.config?.projectId }}
          />
        </div>
      );
    case "device_management":
      return (
        <div class="space-y-2">
          <DeviceManagementCard projectId={props.action.projectId} projectName={props.action.projectName} />
          <SaveWorkflowButton
            name="Project devices"
            description="View and manage devices assigned to this project"
            prompt="show my devices"
            action="device_management"
            productIds={["worksmanager"]}
            workflowId={props.action.workflowId}
            config={{ ...props.action.config, projectId: props.action.projectId ?? props.action.config?.projectId }}
          />
        </div>
      );
    case "project_loading":
      return <div class="flex items-center gap-2 text-sm opacity-70" role="status"><span class="byop-spinner" aria-hidden="true" />Fetching projects…</div>;
    case "project_processing":
      return <div class="flex items-center gap-2 text-sm opacity-70" role="status"><span class="byop-spinner" aria-hidden="true" />Analyzing {props.action.projectName}…</div>;
    case "project_picker":
      return <ProjectPickerCard projects={props.action.projects} targetAction={props.action.targetAction} onSelect={props.onProjectSelected} />;
    case "b2westimate_list":
      return (
        <div class="space-y-2">
          <B2wEstimatePluginCard />
          <SaveWorkflowButton
            name="B2W estimates"
            description="View construction estimates"
            prompt="show my B2W estimates"
            action="b2westimate_list"
            productIds={["b2westimate"]}
          />
        </div>
      );
    case "autobid_list":
      return (
        <div class="space-y-2">
          <AutoBidPluginCard />
          <SaveWorkflowButton
            name="AutoBid bids"
            description="View and track competitive bids"
            prompt="show my AutoBid bids"
            action="autobid_list"
            productIds={["autobid"]}
          />
        </div>
      );
    case "publish_connect_to_wm":
      return <PublishConnectToWmCard defaultPrompt="Publish a Connect design to WorksManager" />;
    case "entitlement_upsell":
      return <EntitlementUpsellCard pluginId={props.action.pluginId} reason={props.action.reason} />;
    case "suggestions":
      return <SuggestionChips prompts={props.action.prompts} onSelect={props.onPrompt} />;
    case "text":
      return <p>{props.action.message}</p>;
    default:
      return null;
  }
}
