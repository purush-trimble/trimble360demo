import type { AgentUIAction } from "@/lib/agent/types";
import { ConnectPluginCard } from "@/components/plugins/ConnectPluginCard";
import { WorksManagerPluginCard } from "@/components/plugins/WorksManagerPluginCard";
import { CreateDesignCard } from "./CreateDesignCard";
import { EntitlementUpsellCard } from "./EntitlementUpsellCard";
import { PublishConnectToWmCard } from "./PublishConnectToWmCard";
import { SaveWidgetButton } from "./SaveWidgetButton";
import { SuggestionChips } from "./SuggestionChips";

export function AgentUIRenderer(props: {
  action: AgentUIAction;
  onPrompt: (prompt: string) => void;
  onCreated: () => void;
}) {
  switch (props.action.type) {
    case "create_design":
      return (
        <div class="space-y-2">
          <CreateDesignCard onCreated={props.onCreated} />
          <SaveWidgetButton
            name="Create design"
            description="Import from Connect and create a WorksManager design"
            prompt="create a design"
            action="create_design"
            productIds={["worksmanager", "connect"]}
          />
        </div>
      );
    case "connect_file_browser":
      return (
        <div class="space-y-2">
          <ConnectPluginCard />
          <SaveWidgetButton
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
          <WorksManagerPluginCard />
          <SaveWidgetButton
            name="WorksManager designs"
            description="View designs in a WorksManager project"
            prompt="show my designs"
            action="worksmanager_design_list"
            productIds={["worksmanager"]}
          />
        </div>
      );
    case "publish_connect_to_wm":
      return (
        <PublishConnectToWmCard
          connectAccountId={props.action.connectAccountId}
          wmAccountId={props.action.wmAccountId}
          defaultPrompt="Publish a Connect design to WorksManager"
        />
      );
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
