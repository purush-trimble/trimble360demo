import type { Entitlement } from "@/lib/types";

export function EntitlementsPanel(props: { entitlements: Entitlement[]; onToggle: (item: Entitlement) => void }) {
  return (
    <aside class="rounded-xl border border-[var(--modus-wc-color-base-200)] bg-[var(--modus-wc-color-base-100)] p-4 shadow-sm">
      <p class="mb-3 text-xs font-bold uppercase tracking-wider opacity-60">Mock subscriptions</p>
      {props.entitlements.map((item) => (
        <div class="flex items-center justify-between border-t border-[var(--modus-wc-color-base-200)] py-3">
          <span>
            <strong class="block text-sm">{item.pluginId === "connect" ? "Trimble Connect" : "WorksManager"}</strong>
            <span class="text-xs text-slate-500">{item.plan}</span>
          </span>
          <input type="checkbox" checked={item.active} onChange={() => props.onToggle(item)} />
        </div>
      ))}
    </aside>
  );
}
