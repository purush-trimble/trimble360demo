import type { PluginId } from "@/lib/types";

export function EntitlementUpsellCard(props: { pluginId: PluginId; reason: string }) {
  return (
    <modus-wc-card class="block">
      <div class="p-5">
        <div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <strong>{props.pluginId === "connect" ? "Trimble Connect" : "WorksManager"} plugin unavailable</strong>
          <p class="mt-1 text-sm">
            {props.reason === "not_added"
              ? "Add this subscribed plugin from the launcher to continue."
              : "Enable the mock subscription in the subscriptions panel to continue."}
          </p>
        </div>
      </div>
    </modus-wc-card>
  );
}
