import { ModusButton } from "@/components/modus/ModusButton";
import { saveWorkflow } from "@/lib/mockStore";
import type { PluginId } from "@/lib/types";
import type { SavedWorkflowConfig } from "@/lib/types";

export function SaveWorkflowButton(props: {
  name: string;
  description: string;
  prompt: string;
  action: string;
  productIds: PluginId[];
  workflowId?: string;
  config?: SavedWorkflowConfig;
}) {
  return (
    <ModusButton
      variant="text"
      onClick={() =>
        saveWorkflow({
          name: props.name,
          description: props.description,
          prompt: props.prompt,
          action: props.action,
          productIds: props.productIds,
          workflowId: props.workflowId,
          config: props.config,
        })
      }
    >
      {props.workflowId ? "Save changes" : "Save workflow"}
    </ModusButton>
  );
}
