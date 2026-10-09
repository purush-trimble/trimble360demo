import { createMemo, createSignal, For, Show } from "solid-js";
import { addDevice, state } from "@/lib/mockStore";

const COLORS = ["#2f80ed", "#27ae60", "#f2994a", "#9b51e0"];

export function DeviceManagementCard(props: { projectId?: string; projectName?: string }) {
  const [view, setView] = createSignal<"chart" | "table">("chart");
  const [adding, setAdding] = createSignal(false);
  const [error, setError] = createSignal("");
  const projectId = () => props.projectId ?? "proj-north-ridge";
  const projectName = createMemo(() => props.projectName ?? state.projects.find((project) => project.id === projectId())?.name ?? "Project");
  const devices = createMemo(() => state.devices.filter((device) => device.projectId === projectId()));
  const groups = createMemo(() => {
    const counts = new Map<string, number>();
    devices().forEach((device) => counts.set(device.type, (counts.get(device.type) ?? 0) + 1));
    return [...counts].map(([label, count], index) => ({ label, count, color: COLORS[index % COLORS.length] }));
  });
  const total = () => devices().length;

  function submit(event: SubmitEvent) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const result = addDevice({
      projectId: projectId(),
      name: String(data.get("name") ?? ""),
      type: String(data.get("type") ?? ""),
      model: String(data.get("model") ?? ""),
      serial: String(data.get("serial") ?? ""),
    });
    if (!result.ok) return setError(result.error);
    setError("");
    setAdding(false);
    form.reset();
  }

  return <modus-wc-card class="block"><div class="p-5">
    <div class="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div><p class="text-xs font-bold uppercase tracking-wider text-[var(--modus-wc-color-primary)]">Field operations</p><h3 class="text-lg font-semibold">Project devices</h3><p class="mt-1 text-sm opacity-65">Monitor and add equipment assigned to {projectName()}.</p></div>
      <button type="button" class="byop-primary-button" onClick={() => { setError(""); setAdding(true); }}>+ Add device</button>
    </div>
    <div class="mb-5 grid gap-3 sm:grid-cols-3">
      <div class="rounded-xl border p-3"><div class="text-xs uppercase opacity-60">Total devices</div><div class="mt-1 text-2xl font-bold">{total()}</div></div>
      <div class="rounded-xl border p-3"><div class="text-xs uppercase opacity-60">Online</div><div class="mt-1 text-2xl font-bold">{devices().filter((d) => d.status === "Online").length}</div></div>
      <div class="rounded-xl border p-3"><div class="text-xs uppercase opacity-60">Device types</div><div class="mt-1 text-2xl font-bold">{groups().length}</div></div>
    </div>
    <div class="mb-4 flex justify-end"><div class="byop-scope-toggle" role="group" aria-label="Device view"><button type="button" class={view() === "chart" ? "is-selected" : ""} aria-pressed={view() === "chart"} onClick={() => setView("chart")}>Type chart</button><button type="button" class={view() === "table" ? "is-selected" : ""} aria-pressed={view() === "table"} onClick={() => setView("table")}>Table</button></div></div>
    <Show when={view() === "chart"} fallback={<div class="overflow-x-auto rounded-xl border"><table class="w-full min-w-[650px] text-left text-sm"><thead class="bg-[var(--modus-wc-color-base-100)] text-xs uppercase opacity-70"><tr><th class="px-4 py-3">Device</th><th class="px-4 py-3">Type</th><th class="px-4 py-3">Model</th><th class="px-4 py-3">Serial</th><th class="px-4 py-3">Status</th></tr></thead><tbody class="divide-y divide-[var(--modus-wc-color-base-200)]"><For each={devices()}>{(device) => <tr><td class="px-4 py-3 font-semibold">{device.name}</td><td class="px-4 py-3">{device.type}</td><td class="px-4 py-3 opacity-70">{device.model}</td><td class="px-4 py-3 font-mono text-xs">{device.serial}</td><td class="px-4 py-3 text-xs font-semibold">{device.status}</td></tr>}</For></tbody></table></div>}>
      <div class="flex flex-col items-center gap-6 rounded-xl border p-6 sm:flex-row sm:justify-center">
        <div class="relative h-44 w-44 rounded-full" style={{ background: `conic-gradient(${groups().map((group, index) => `${group.color} ${groups().slice(0, index).reduce((sum, item) => sum + item.count, 0) / Math.max(total(), 1) * 100}% ${(groups().slice(0, index + 1).reduce((sum, item) => sum + item.count, 0) / Math.max(total(), 1) * 100)}%`).join(", ")})` }}><div class="absolute inset-7 grid place-items-center rounded-full bg-[var(--modus-wc-color-base-page)] text-center"><strong class="text-2xl">{total()}</strong><span class="block text-xs opacity-60">devices</span></div></div>
        <div class="space-y-3"><For each={groups()}>{(group) => <div class="flex items-center gap-3 text-sm"><span class="h-3 w-3 rounded-full" style={{ background: group.color }}></span><span class="min-w-20">{group.label}</span><strong>{group.count}</strong><span class="opacity-60">{Math.round(group.count / Math.max(total(), 1) * 100)}%</span></div>}</For></div>
      </div>
    </Show>
    <Show when={adding()}><div class="byop-modal-root" role="presentation"><button type="button" class="byop-modal-backdrop" aria-label="Close add device" onClick={() => setAdding(false)} /><form class="byop-modal-panel" role="dialog" aria-modal="true" aria-labelledby="add-device-title" onSubmit={submit}><div class="byop-modal-header"><div><h2 id="add-device-title" class="font-semibold">Add device</h2><p class="byop-modal-subtitle">Assign equipment to the current project.</p></div><button type="button" class="byop-icon-button" aria-label="Close" onClick={() => setAdding(false)}>×</button></div><div class="byop-modal-body space-y-3"><For each={[["name","Device name"],["model","Model"],["serial","Serial number"]]}>{([name, label]) => <label class="block text-sm font-semibold">{label}<input required name={name} class="byop-input mt-1 w-full" /></label>}</For><label class="block text-sm font-semibold">Device type<select required name="type" class="byop-input mt-1 w-full"><option value="">Select type</option><option>EC520</option><option>Tablet</option><option>Rover</option><option>Other</option></select></label><Show when={error()}><p class="text-sm text-red-600" role="alert">{error()}</p></Show></div><div class="byop-modal-footer"><button type="button" class="byop-secondary-button" onClick={() => setAdding(false)}>Cancel</button><button type="submit" class="byop-primary-button">Add device</button></div></form></div></Show>
  </div></modus-wc-card>;
}
