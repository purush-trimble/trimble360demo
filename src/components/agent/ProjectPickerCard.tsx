import { For } from "solid-js";
import type { WorksManagerProject } from "@/lib/types";

export function ProjectPickerCard(props: {
  projects: WorksManagerProject[];
  targetAction: "worksmanager_design_list" | "device_management";
  onSelect: (projectId: string) => void;
}) {
  return (
    <div class="space-y-3">
      <label class="block text-sm opacity-70" for="project-picker">
        Choose the project for the {props.targetAction === "worksmanager_design_list" ? "design" : "device"} view.
      </label>
      <select
        id="project-picker"
        class="byop-input w-full"
        onChange={(event) => {
          const projectId = event.currentTarget.value;
          if (projectId) props.onSelect(projectId);
        }}
      >
        <option value="">Select a project</option>
        <For each={props.projects}>
          {(project) => (
            <option value={project.id}>
              {project.name} · {project.status}
            </option>
          )}
        </For>
      </select>
    </div>
  );
}
