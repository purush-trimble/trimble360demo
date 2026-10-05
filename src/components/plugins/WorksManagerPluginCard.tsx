import { createMemo, createSignal, onMount } from "solid-js";
import { getProjects, state } from "@/lib/mockStore";
import type { WorksManagerProject } from "@/lib/types";

export function WorksManagerPluginCard() {
  const [projects, setProjects] = createSignal<WorksManagerProject[]>([]);
  const [projectId, setProjectId] = createSignal("wm-project-01");
  onMount(() => setProjects(getProjects("wm-demo")));

  const designs = createMemo(() => state.designs.filter((design) => design.projectId === projectId()));

  return (
    <modus-wc-card class="block">
      <div class="p-5">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-wider text-slate-500">WorksManager</p>
            <h3 class="text-lg font-semibold">Design workspace</h3>
          </div>
          <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Ready</span>
        </div>
        <label class="mb-1 block text-sm font-medium" for="project">Project</label>
        <select
          id="project"
          class="w-full rounded border border-slate-300 px-3 py-2"
          value={projectId()}
          onChange={(event) => setProjectId(event.currentTarget.value)}
        >
          {projects().map((project) => (
            <option value={project.id}>{project.name}</option>
          ))}
        </select>
        <div class="mt-4 space-y-2">
          {designs().map((design) => (
            <div class="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <span>
                <strong class="block text-sm">{design.name}</strong>
                <span class="text-xs text-slate-500">
                  {design.sourceFileIds.length} source file(s) · {design.createdAt}
                </span>
              </span>
              <span class="text-xs font-semibold text-emerald-700">{design.status}</span>
            </div>
          ))}
          {!designs().length && <p class="text-sm text-slate-500">No designs in this project yet.</p>}
        </div>
      </div>
    </modus-wc-card>
  );
}
