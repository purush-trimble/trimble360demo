import { createMemo, createSignal, For, Show } from "solid-js";
import { state } from "@/lib/mockStore";

export function WorksManagerPluginCard(props: { projectId?: string; projectName?: string }) {
  const [query, setQuery] = createSignal("");
  const [type, setType] = createSignal("All types");
  const projectId = () => props.projectId ?? "proj-north-ridge";
  const projectName = () => props.projectName ?? state.projects.find((project) => project.id === projectId())?.name ?? "Project";
  const designs = createMemo(() => state.designs.filter((design) => {
    const text = `${design.name} ${design.type ?? ""}`.toLowerCase();
    return design.projectId === projectId() && text.includes(query().toLowerCase()) && (type() === "All types" || (design.type ?? "Other") === type());
  }));

  return (
    <modus-wc-card class="block">
      <div class="p-5">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-[var(--modus-wc-color-primary)]">WorksManager library</p>
            <h3 class="text-lg font-semibold">Project designs · {projectName()}</h3>
          </div>
          <span class="rounded-full border border-[var(--modus-wc-color-base-300)] px-3 py-1 text-xs font-semibold">{designs().length} designs</span>
        </div>
        <div class="mb-4 grid gap-3 sm:grid-cols-[1fr_180px]">
          <input class="byop-input" aria-label="Search designs" placeholder="Search designs" value={query()} onInput={(e) => setQuery(e.currentTarget.value)} />
          <select class="byop-input" aria-label="Filter by design type" value={type()} onChange={(e) => setType(e.currentTarget.value)}>
            <option>All types</option><option>VCL</option><option>SVD</option><option>DXF</option><option>TTM</option>
          </select>
        </div>
        <div class="overflow-x-auto rounded-xl border border-[var(--modus-wc-color-base-200)]">
          <table class="w-full min-w-[620px] text-left text-sm">
            <thead class="bg-[var(--modus-wc-color-base-100)] text-xs uppercase tracking-wide opacity-70">
              <tr><th class="px-4 py-3">Design</th><th class="px-4 py-3">Type</th><th class="px-4 py-3">Sources</th><th class="px-4 py-3">Created</th><th class="px-4 py-3">Status</th></tr>
            </thead>
            <tbody class="divide-y divide-[var(--modus-wc-color-base-200)]">
              <For each={designs()} fallback={<tr><td colspan="5" class="px-4 py-8 text-center opacity-60">No designs match this project and filter.</td></tr>}>
                {(design) => <tr class="hover:bg-[var(--modus-wc-color-base-100)]">
                  <td class="px-4 py-3 font-semibold">{design.name}</td>
                  <td class="px-4 py-3"><span class="rounded-md border px-2 py-1 text-xs font-bold">{design.type ?? "Design"}</span></td>
                  <td class="px-4 py-3 opacity-70">{design.sourceFileIds.length} files</td>
                  <td class="px-4 py-3 opacity-70">{design.createdAt}</td>
                  <td class="px-4 py-3"><span class="text-xs font-semibold text-[var(--modus-wc-color-success)]">{design.status}</span></td>
                </tr>}
              </For>
            </tbody>
          </table>
        </div>
      </div>
    </modus-wc-card>
  );
}
