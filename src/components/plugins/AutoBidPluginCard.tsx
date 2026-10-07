import { createSignal, onMount } from "solid-js";
import { getAutoBids } from "@/lib/mockStore";
import type { AutoBid } from "@/lib/types";

const statusColor: Record<string, string> = {
  Draft: "text-slate-600",
  Submitted: "text-blue-700",
  Won: "text-emerald-700",
};

export function AutoBidPluginCard() {
  const [bids, setBids] = createSignal<AutoBid[]>([]);
  onMount(() => setBids(getAutoBids("autobid-demo")));

  return (
    <modus-wc-card class="block">
      <div class="p-5">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-wider text-slate-500">AutoBid</p>
            <h3 class="text-lg font-semibold">Bids</h3>
          </div>
          <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Ready</span>
        </div>
        <div class="mt-2 space-y-2">
          {bids().map((bid) => (
            <div class="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <span>
                <strong class="block text-sm">{bid.title}</strong>
                <span class="text-xs text-slate-500">
                  {bid.client} · Due {bid.dueDate}
                </span>
              </span>
              <span class="flex items-center gap-3 text-right">
                <span class="text-sm font-semibold">{bid.amount}</span>
                <span class={`text-xs font-semibold ${statusColor[bid.status] ?? ""}`}>{bid.status}</span>
              </span>
            </div>
          ))}
          {!bids().length && <p class="text-sm text-slate-500">No bids found.</p>}
        </div>
      </div>
    </modus-wc-card>
  );
}
