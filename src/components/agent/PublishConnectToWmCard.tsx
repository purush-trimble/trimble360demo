import { createSignal, For, onMount } from "solid-js";
import { ModusButton } from "@/components/modus/ModusButton";
import { getConnectFiles, getProjects, publishConnectToWorksManager, saveWidget } from "@/lib/mockStore";
import type { ConnectFile, WorksManagerProject } from "@/lib/types";

export function PublishConnectToWmCard(props: {
  connectAccountId: string;
  wmAccountId: string;
  defaultPrompt?: string;
}) {
  const [step, setStep] = createSignal<"files" | "project" | "review" | "done">("files");
  const [files, setFiles] = createSignal<ConnectFile[]>([]);
  const [projects, setProjects] = createSignal<WorksManagerProject[]>([]);
  const [selectedFileIds, setSelectedFileIds] = createSignal<string[]>([]);
  const [projectId, setProjectId] = createSignal("");
  const [designName, setDesignName] = createSignal("Published Connect design");
  const [resultName, setResultName] = createSignal("");
  const [savedHint, setSavedHint] = createSignal("");

  onMount(() => {
    setFiles(getConnectFiles(props.connectAccountId));
    const list = getProjects(props.wmAccountId);
    setProjects(list);
    setProjectId(list[0]?.id ?? "");
  });

  const toggleFile = (id: string) =>
    setSelectedFileIds((items) => (items.includes(id) ? items.filter((x) => x !== id) : [...items, id]));

  function publish() {
    const design = publishConnectToWorksManager({
      projectId: projectId(),
      sourceFileIds: selectedFileIds(),
      designName: designName(),
    });
    setResultName(design.name);
    setStep("done");
  }

  function saveAsWidget() {
    saveWidget({
      name: "Publish Connect to WorksManager",
      description: "Cross-product publish workflow",
      prompt: props.defaultPrompt ?? "Publish a Connect design to WorksManager",
      action: "publish_connect_to_wm",
      productIds: ["connect", "worksmanager"],
    });
    setSavedHint("Widget saved.");
  }

  return (
    <modus-wc-card class="block">
      <div class="p-5">
        <p class="text-xs uppercase tracking-wider opacity-60">Cross-product workflow</p>
        <h3 class="mb-4 text-lg font-semibold">Publish Connect design to WorksManager</h3>

        {step() === "files" && (
          <>
            <p class="mb-3 text-sm opacity-80">Select Connect source file(s).</p>
            <div class="divide-y divide-[var(--modus-wc-color-base-200)] rounded-lg border border-[var(--modus-wc-color-base-200)]">
              <For each={files()}>
                {(file) => (
                  <label class="flex cursor-pointer items-center gap-3 p-3 hover:bg-[var(--modus-wc-color-base-200)]">
                    <input type="checkbox" checked={selectedFileIds().includes(file.id)} onChange={() => toggleFile(file.id)} />
                    <span class="flex-1 text-sm">
                      <strong class="block">{file.name}</strong>
                      <span class="text-xs opacity-70">{file.size}</span>
                    </span>
                  </label>
                )}
              </For>
            </div>
            <div class="mt-4 flex justify-end">
              <ModusButton disabled={!selectedFileIds().length} onClick={() => setStep("project")}>
                Next: Choose project
              </ModusButton>
            </div>
          </>
        )}

        {step() === "project" && (
          <>
            <label class="mb-1 block text-sm font-medium" for="wm-project">
              WorksManager project
            </label>
            <select
              id="wm-project"
              class="byop-input w-full"
              value={projectId()}
              onChange={(e) => setProjectId(e.currentTarget.value)}
            >
              <For each={projects()}>{(p) => <option value={p.id}>{p.name}</option>}</For>
            </select>
            <label class="mb-1 mt-4 block text-sm font-medium" for="pub-name">
              Design name
            </label>
            <input
              id="pub-name"
              class="byop-input w-full"
              value={designName()}
              onInput={(e) => setDesignName(e.currentTarget.value)}
            />
            <div class="mt-4 flex justify-between">
              <ModusButton variant="outlined" onClick={() => setStep("files")}>
                Back
              </ModusButton>
              <ModusButton onClick={() => setStep("review")}>Review</ModusButton>
            </div>
          </>
        )}

        {step() === "review" && (
          <>
            <div class="rounded-lg border border-[var(--modus-wc-color-base-200)] bg-[var(--modus-wc-color-base-200)] p-4 text-sm">
              <p>
                <strong>{selectedFileIds().length}</strong> Connect file(s) → project{" "}
                <strong>{projects().find((p) => p.id === projectId())?.name ?? projectId()}</strong>
              </p>
              <p class="mt-2">Design name: {designName()}</p>
            </div>
            <div class="mt-4 flex justify-between">
              <ModusButton variant="outlined" onClick={() => setStep("project")}>
                Back
              </ModusButton>
              <ModusButton onClick={publish}>Confirm publish</ModusButton>
            </div>
          </>
        )}

        {step() === "done" && (
          <>
            <modus-wc-alert variant="success" alert-title={`Published "${resultName()}" to WorksManager.`} />
            <div class="mt-4 flex flex-wrap gap-2">
              <ModusButton variant="outlined" onClick={saveAsWidget}>
                Save as widget
              </ModusButton>
              {savedHint() && <span class="text-sm opacity-70">{savedHint()}</span>}
            </div>
          </>
        )}
      </div>
    </modus-wc-card>
  );
}
