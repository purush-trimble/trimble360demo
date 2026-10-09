import { ModusButton } from "@/components/modus/ModusButton";
import { saveWorkflow } from "@/lib/mockStore";
import { createEffect, createSignal } from "solid-js";
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
  const [saved, setSaved] = createSignal(false);

  createEffect(() => {
    JSON.stringify(props.config);
    setSaved(false);
  });

  function handleSave() {
    saveWorkflow({
      name: props.name,
      description: props.description,
      prompt: props.prompt,
      action: props.action,
      productIds: props.productIds,
      workflowId: props.workflowId,
      config: props.config,
    });
    setSaved(true);
  }

  return (
    <ModusButton
      variant="text"
      disabled={saved()}
      onClick={handleSave}
    >
      {saved() ? "Saved" : props.workflowId ? "Save changes" : "Save workflow"}
    </ModusButton>
  );
}
