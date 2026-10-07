import { ModusButton } from "@/components/modus/ModusButton";
import { PLUGIN_CATALOG } from "@/lib/pluginCatalog";
import type { Entitlement, PluginId } from "@/lib/types";

export function PluginLauncher(props: {
  entitlements: Entitlement[];
  mounted: PluginId[];
  onAdd: (id: PluginId) => void;
}) {
  return (
    <div class="flex flex-wrap gap-2">
      {props.entitlements
        .filter((item) => item.active)
        .map((item) => (
          <ModusButton
            variant={props.mounted.includes(item.pluginId) ? "filled" : "outlined"}
            onClick={() => props.onAdd(item.pluginId)}
          >
            {props.mounted.includes(item.pluginId) ? "✓ " : "+ "}
            {PLUGIN_CATALOG[item.pluginId]?.name ?? item.pluginId}
          </ModusButton>
        ))}
    </div>
  );
}
