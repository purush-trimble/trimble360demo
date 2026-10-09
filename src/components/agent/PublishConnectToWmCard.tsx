import { createEffect, createSignal, createUniqueId, For, Show } from "solid-js";
import { ModusButton } from "@/components/modus/ModusButton";
import { saveWorkflow } from "@/lib/mockStore";
import tcPublish from "@/mock-data/tc-publish.json";

type TcDesign = { id: string; name: string; type: string };
type TcProject = { id: string; name: string; designs: TcDesign[] };
type TcDevice = { id: string; name: string; serial: string };

function FileIcon() {
  return (
    <svg class="h-5 w-5 shrink-0 text-[var(--modus-wc-color-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
      <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8l-5-5Z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}

function DeviceIcon() {
  return (
    <svg class="h-5 w-5 shrink-0 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
      <rect x="5" y="2.5" width="14" height="19" rx="2" />
      <path d="M10 18.5h4" />
    </svg>
  );
}

export function PublishConnectToWmCard(props: {
  projects?: TcProject[];
  devices?: TcDevice[];
  defaultPrompt?: string;
}) {
  const uid = createUniqueId();
  const projects = () => props.projects ?? tcPublish.projects;
  const devices = () => props.devices ?? tcPublish.devices;

  const [projectId, setProjectId] = createSignal("");
  const [designId, setDesignId] = createSignal("");
  const [designOpen, setDesignOpen] = createSignal(false);
  const [deviceIds, setDeviceIds] = createSignal<string[]>([]);
  const [publishing, setPublishing] = createSignal(false);
  const [published, setPublished] = createSignal(false);
  const [savedHint, setSavedHint] = createSignal("");

  const designs = () => projects().find((p) => p.id === projectId())?.designs ?? [];
  const design = () => designs().find((d) => d.id === designId());
  const allSelected = () => deviceIds().length === devices().length;
  const canPublish = () => !!design() && deviceIds().length > 0 && !publishing();

  const toggleDevice = (id: string) =>
    setDeviceIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  const toggleAll = () => setDeviceIds(allSelected() ? [] : devices().map((d) => d.id));

  function selectProject(id: string) {
    setProjectId(id);
    setDesignId("");
    setDeviceIds([]);
    setPublished(false);
  }

  function publish() {
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      setPublished(true);
    }, 800);
  }

  function saveAsWorkflow() {
    saveWorkflow({
      name: "Publish design to WorksManager",
      description: "Publish a Trimble Connect design to WorksManager devices",
      prompt: props.defaultPrompt ?? "Publish a Connect design to WorksManager",
      action: "publish_connect_to_wm",
      productIds: ["connect", "worksmanager"],
    });
    setSavedHint("Workflow saved.");
  }

  return (
    <modus-wc-card class="block">
      <div class="p-5">
        <h3 class="text-lg font-semibold">Publish design to WorksManager</h3>
        <hr class="my-4 border-[var(--modus-wc-color-base-200)]" />

        <label class="mb-1 block text-sm font-medium" for={`${uid}-project`}>
          Select project
        </label>
        <select
          id={`${uid}-project`}
          class="byop-input w-full"
          value={projectId()}
          onChange={(e) => selectProject(e.currentTarget.value)}
        >
          <option value="" disabled>
            Choose a Trimble Connect project
          </option>
          <For each={projects()}>{(p) => <option value={p.id}>{p.name}</option>}</For>
        </select>

        <span class="mb-1 mt-4 block text-sm font-medium" id={`${uid}-design`}>
          Select design
        </span>
        <div
          class="relative"
          onFocusOut={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDesignOpen(false);
          }}
          onKeyDown={(e) => e.key === "Escape" && setDesignOpen(false)}
        >
          <button
            type="button"
            class="byop-input flex w-full items-center gap-2 text-left disabled:opacity-50"
            aria-haspopup="listbox"
            aria-expanded={designOpen()}
            aria-labelledby={`${uid}-design`}
            disabled={!projectId()}
            onClick={() => setDesignOpen((o) => !o)}
          >
            <Show when={design()} fallback={<span class="flex-1 opacity-60">{projectId() ? "Choose a design" : "Select a project first"}</span>}>
              {(d) => (
                <>
                  <FileIcon />
                  <span class="flex-1 truncate text-sm">{d().name}</span>
                  <span class="text-xs opacity-60">{d().type}</span>
                </>
              )}
            </Show>
            <span aria-hidden="true" class="opacity-60">▾</span>
          </button>
          <Show when={designOpen()}>
            <ul
              role="listbox"
              aria-labelledby={`${uid}-design`}
              class="absolute z-10 mt-1 max-h-64 w-full divide-y divide-[var(--modus-wc-color-base-200)] overflow-y-auto rounded border border-[var(--modus-wc-color-base-300)] bg-[var(--modus-wc-color-base-page)] shadow-md"
            >
              <For each={designs()}>
                {(d) => (
                  <li role="option" aria-selected={d.id === designId()}>
                    <button
                      type="button"
                      class="byop-picker-option flex w-full items-center gap-3 text-left hover:bg-[var(--modus-wc-color-base-200)]"
                      onClick={() => {
                        setDesignId(d.id);
                        setDesignOpen(false);
                        setPublished(false);
                      }}
                    >
                      <FileIcon />
                      <span class="flex-1 truncate text-sm">{d.name}</span>
                      <span class="text-xs opacity-60">{d.type}</span>
                    </button>
                  </li>
                )}
              </For>
            </ul>
          </Show>
        </div>

        <div class="mt-4">
        <fieldset
          disabled={!design()}
          class="min-w-0 disabled:opacity-50 [&:disabled_label]:cursor-not-allowed"
        >
          <legend class="mb-1 text-sm font-medium">
            Select device
            <Show when={!design()}>
              <span class="ml-2 text-xs font-normal opacity-70">Select a design first</span>
            </Show>
          </legend>
          <div class="rounded-lg border border-[var(--modus-wc-color-base-200)]">
          <label class="flex cursor-pointer items-center gap-3 border-b border-[var(--modus-wc-color-base-200)] px-3 py-3 text-sm font-medium">
            <input
              type="checkbox"
              checked={allSelected()}
              ref={(el) => createEffect(() => (el.indeterminate = deviceIds().length > 0 && !allSelected()))}
              onChange={toggleAll}
            />
            Select All
          </label>
          <div class="max-h-80 divide-y divide-[var(--modus-wc-color-base-200)] overflow-y-auto">
            <For each={devices()}>
              {(d) => (
                <label class="flex cursor-pointer items-center gap-3 px-3 py-3 hover:bg-[var(--modus-wc-color-base-200)]">
                  <input type="checkbox" checked={deviceIds().includes(d.id)} onChange={() => toggleDevice(d.id)} />
                  <DeviceIcon />
                  <span class="flex-1 text-sm">
                    <strong class="block font-medium">{d.name}</strong>
                    <span class="text-xs opacity-60">{d.serial}</span>
                  </span>
                </label>
              )}
            </For>
          </div>
          </div>
        </fieldset>
        </div>

        <Show when={published()}>
          <div class="mt-4">
            <modus-wc-alert
              variant="success"
              alert-title={`Published "${design()?.name}" to ${deviceIds().length} device(s) via WorksManager.`}
            />
          </div>
        </Show>

        <div class="mt-4 flex flex-wrap items-center justify-end gap-2">
          <Show when={published()}>
            {savedHint() && <span class="text-sm opacity-70">{savedHint()}</span>}
            <ModusButton variant="outlined" onClick={saveAsWorkflow}>
              Save workflow
            </ModusButton>
          </Show>
          <ModusButton disabled={!canPublish()} onClick={publish}>
            {publishing() ? "Publishing…" : "Publish"}
          </ModusButton>
        </div>
      </div>
    </modus-wc-card>
  );
}
