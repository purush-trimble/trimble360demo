import { ModusButton } from "@/components/modus/ModusButton";
import { saveWorkflow } from "@/lib/mockStore";
import type { PluginId } from "@/lib/types";

export function SaveWorkflowButton(props: {
  name: string;
  description: string;
  prompt: string;
  action: string;
  productIds: PluginId[];
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
        })
      }
    >
      Save workflow
    </ModusButton>
  );
}
