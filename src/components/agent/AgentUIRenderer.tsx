import type { AgentUIAction } from "@/lib/agent/types";
import { ConnectPluginCard } from "@/components/plugins/ConnectPluginCard";
import { WorksManagerPluginCard } from "@/components/plugins/WorksManagerPluginCard";
import { CreateDesignCard } from "./CreateDesignCard";
import { EntitlementUpsellCard } from "./EntitlementUpsellCard";
import { SuggestionChips } from "./SuggestionChips";

export function AgentUIRenderer(props: {
  action: AgentUIAction;
  onPrompt: (prompt: string) => void;
  onCreated: () => void;
}) {
  switch (props.action.type) {
    case "create_design":
      return <CreateDesignCard onCreated={props.onCreated} />;
    case "connect_file_browser":
      return <ConnectPluginCard />;
    case "worksmanager_design_list":
      return <WorksManagerPluginCard />;
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
