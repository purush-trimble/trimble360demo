import { For } from "solid-js";
import type { WorksManagerProject } from "@/lib/types";

export function ProjectPickerCard(props: {
  projects: WorksManagerProject[];
  targetAction: "worksmanager_design_list" | "device_management";
  onSelect: (projectId: string) => void;
}) {
  return (
    <div class="space-y-3">
      <p class="text-sm opacity-70">
        Choose the project for the {props.targetAction === "worksmanager_design_list" ? "design" : "device"} view.
      </p>
      <div class="grid gap-2 sm:grid-cols-2">
        <For each={props.projects}>
          {(project) => (
            <button type="button" class="byop-choice text-left" onClick={() => props.onSelect(project.id)}>
              <strong class="block">{project.name}</strong>
              <span class="mt-1 block text-xs opacity-65">{project.status} · WorksManager project</span>
            </button>
          )}
        </For>
      </div>
    </div>
  );
}
