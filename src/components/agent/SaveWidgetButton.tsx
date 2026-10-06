import { ModusButton } from "@/components/modus/ModusButton";
import { saveWidget } from "@/lib/mockStore";
import type { PluginId } from "@/lib/types";

export function SaveWidgetButton(props: {
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
        saveWidget({
          name: props.name,
          description: props.description,
          prompt: props.prompt,
          action: props.action,
          productIds: props.productIds,
        })
      }
    >
      Save widget
    </ModusButton>
  );
}
