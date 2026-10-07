import { createSignal, onMount } from "solid-js";
import { getB2wEstimates } from "@/lib/mockStore";
import type { B2wEstimate } from "@/lib/types";

const statusColor: Record<string, string> = {
  Draft: "text-slate-600",
  "In review": "text-amber-700",
  Approved: "text-emerald-700",
};

export function B2wEstimatePluginCard() {
  const [estimates, setEstimates] = createSignal<B2wEstimate[]>([]);
  onMount(() => setEstimates(getB2wEstimates("b2w-demo")));

  return (
    <modus-wc-card class="block">
      <div class="p-5">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-wider text-slate-500">B2W Estimate</p>
            <h3 class="text-lg font-semibold">Estimates</h3>
          </div>
          <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Ready</span>
        </div>
        <div class="mt-2 space-y-2">
          {estimates().map((est) => (
            <div class="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <span>
                <strong class="block text-sm">{est.name}</strong>
                <span class="text-xs text-slate-500">
                  {est.project} · Updated {est.updatedAt}
                </span>
              </span>
              <span class="flex items-center gap-3 text-right">
                <span class="text-sm font-semibold">{est.total}</span>
                <span class={`text-xs font-semibold ${statusColor[est.status] ?? ""}`}>{est.status}</span>
              </span>
            </div>
          ))}
          {!estimates().length && <p class="text-sm text-slate-500">No estimates found.</p>}
        </div>
      </div>
    </modus-wc-card>
  );
}
