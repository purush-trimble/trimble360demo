import { createMemo, createSignal, For, Show } from "solid-js";
import { ModusButton } from "@/components/modus/ModusButton";
import { ConnectPluginCard } from "@/components/plugins/ConnectPluginCard";
import { createDesign, getProjects, state } from "@/lib/mockStore";
import type { ConnectFile, WorksManagerProject } from "@/lib/types";
import type { SavedWorkflowConfig } from "@/lib/types";

type MediumId = "machine-control" | "sitework";

type VclDevice = { name: string; type: string; serial: string; description: string };

const MACHINE_DEVICES: VclDevice[] = [
  { name: "EARTHWORKS3", type: "EC520", serial: "EARTHWORKS3", description: "pwd - admin" },
  { name: "ECTEST3", type: "EC520", serial: "ECTEST3", description: "pwd- ECTEST3" },
];

const COLLECTOR_DEVICES: VclDevice[] = [
  { name: "dc1", type: "Tablet", serial: "DC1", description: "pwd - admin" },
  { name: "tablet120", type: "Tablet", serial: "TABLET120", description: "pwd-admin" },
];

const MEDIUMS: { id: MediumId; name: string; description: string; devices: VclDevice[] }[] = [
  {
    id: "machine-control",
    name: "Machine Control",
    description: "Grade control for GPS dozers and excavators.",
    devices: MACHINE_DEVICES,
  },
  {
    id: "sitework",
    name: "Data Collector",
    description: "Site collector tablets for field layout and measurement.",
    devices: COLLECTOR_DEVICES,
  },
];

function DeviceMark() {
  return (
    <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
      <rect x="6" y="3" width="12" height="18" rx="1.5" />
      <path d="M10 18h4" />
    </svg>
  );
}

export function CreateVclDesignCard(props: { onCreated: () => void; initialConfig?: SavedWorkflowConfig; onConfigChange?: (config: SavedWorkflowConfig) => void }) {
  const [step, setStep] = createSignal(props.initialConfig?.sourceId && props.initialConfig.projectId && props.initialConfig.mediumId ? 4 : 1);
  const [source, setSource] = createSignal<ConnectFile | null>(
    props.initialConfig?.sourceId
      ? { id: props.initialConfig.sourceId, accountId: "connect-demo", name: props.initialConfig.sourceName ?? "Saved VCL file", extension: "vcl", size: "Saved", updatedAt: "Previously selected" }
      : null,
  );
  const [showConnect, setShowConnect] = createSignal(false);
  const [projects] = createSignal<WorksManagerProject[]>(getProjects("wm-demo"));
  const [projectId, setProjectId] = createSignal(props.initialConfig?.projectId ?? "");
  const [mediumId, setMediumId] = createSignal<MediumId | "">((props.initialConfig?.mediumId as MediumId) ?? "");
  const [selectedNames, setSelectedNames] = createSignal<string[]>(props.initialConfig?.device?.split(", ").filter(Boolean) ?? []);
  const [publishAll, setPublishAll] = createSignal(false);
  const [designName, setDesignName] = createSignal(props.initialConfig?.designName ?? "");
  const [processing, setProcessing] = createSignal(false);
  const [created, setCreated] = createSignal(false);
  const [version, setVersion] = createSignal(1);
  const [error, setError] = createSignal("");

  const project = createMemo(() => projects().find((item) => item.id === projectId()));
  const medium = createMemo(() => MEDIUMS.find((item) => item.id === mediumId()));
  const devices = createMemo(() => medium()?.devices ?? []);
  const deviceLabel = createMemo(() => selectedNames().join(", "));
  const existingVersion = createMemo(() => {
    const name = designName().trim().toLowerCase();
    const match = state.designs.find((d) => d.projectId === projectId() && d.name.trim().toLowerCase() === name);
    return match ? match.version ?? 1 : undefined;
  });
  const allSelected = createMemo(() => devices().length > 0 && devices().every((item) => selectedNames().includes(item.name)));
  const reportConfig = () => props.onConfigChange?.({
    sourceId: source()?.id ?? props.initialConfig?.sourceId,
    sourceName: source()?.name ?? props.initialConfig?.sourceName,
    projectId: projectId() || undefined,
    mediumId: mediumId() || undefined,
    device: deviceLabel() || undefined,
    designName: designName() || undefined,
  });
  const steps = ["Source", "Project", "Medium", "Device"];

  function chooseProject(id: string) {
    setProjectId(id);
    const selected = projects().find((item) => item.id === id);
    if (selected) setDesignName(`${selected.name} VCL Design`);
    reportConfig();
  }

  function chooseMedium(id: MediumId) {
    setMediumId(id);
    setSelectedNames([]);
    setPublishAll(false);
    reportConfig();
    setStep(4);
  }

  function rememberDesignName() {
    if (!designName()) setDesignName(`${project()?.name ?? "Project"} VCL Design`);
  }

  function toggleDevice(name: string) {
    const next = selectedNames().includes(name) ? selectedNames().filter((item) => item !== name) : [...selectedNames(), name];
    setSelectedNames(next);
    if (next.length !== devices().length) setPublishAll(false);
    if (next.length) rememberDesignName();
    reportConfig();
  }

  function toggleAllRows(checked: boolean) {
    setSelectedNames(checked ? devices().map((item) => item.name) : []);
    if (!checked) setPublishAll(false);
    if (checked) rememberDesignName();
    reportConfig();
  }

  function togglePublishAll(checked: boolean) {
    setPublishAll(checked);
    setSelectedNames(checked ? devices().map((item) => item.name) : []);
    if (checked) rememberDesignName();
    reportConfig();
  }

  function create() {
    if (!source() || !projectId() || !medium() || !deviceLabel() || !designName().trim()) return;
    setProcessing(true);
    setError("");
    window.setTimeout(() => {
      const result = createDesign({ projectId: projectId(), name: designName(), sourceFileIds: [source()!.id] });
      setProcessing(false);
      if (!result.ok) return setError(result.error);
      setVersion(result.design.version ?? 1);
      setCreated(true);
      reportConfig();
    }, 1500);
  }

  return (
    <modus-wc-card class="block">
      <div class="p-5">
        <Show
          when={!created()}
          fallback={
            <div class="byop-vcl-wizard-success">
              <div class="byop-vcl-wizard-success-icon" aria-hidden="true">✓</div>
              <p class="text-lg font-semibold">
                {version() > 1 ? `${designName()} updated to version ${version()}` : `${designName()} has been created`}
              </p>
              <p class="mt-1 text-sm opacity-70">Version {version()} is ready for {deviceLabel()}.</p>
              <div class="mt-5">
                <ModusButton onClick={props.onCreated}>Done</ModusButton>
              </div>
            </div>
          }
        >
          <div class="mb-6">
            <p class="text-xs font-bold uppercase tracking-wider text-[var(--modus-wc-color-primary)]">VCL design setup</p>
            <h3 class="mt-1 text-xl font-semibold">Create a field-ready VCL design</h3>
            <p class="mt-2 text-sm opacity-70">We'll prepare the file for the project and device you select.</p>
          </div>

          <div class="byop-vcl-wizard-progress" aria-label="Workflow progress">
            <For each={steps}>
              {(label, index) => (
                <div class={`byop-vcl-wizard-progress-step ${step() >= index() + 1 ? "is-active" : ""}`}>
                  <span>{step() > index() + 1 ? "✓" : index() + 1}</span>
                  <small>{label}</small>
                </div>
              )}
            </For>
          </div>

          <Show when={step() === 1}>
            <section aria-labelledby="vcl-source-heading">
              <div class="mb-3">
                <h4 id="vcl-source-heading" class="font-semibold">Where is your design file?</h4>
                <p class="text-sm opacity-70">Choose a VCL file from your project or simulate a local upload.</p>
              </div>
              <div class="grid gap-3 sm:grid-cols-2">
                <button type="button" class="byop-choice text-left" onClick={() => setShowConnect(true)}>
                  <strong class="block">Import from Trimble Connect</strong>
                  <span class="mt-1 block text-sm opacity-70">Select a shared .vcl file</span>
                </button>
                <button
                  type="button"
                  class="byop-choice text-left"
                  onClick={() => {
                    setSource({ id: "local-vcl-01", accountId: "local", name: "VCL_LocalSurface.vcl", extension: "vcl", size: "Local file", updatedAt: "Just now" });
                    reportConfig();
                    setStep(2);
                  }}
                >
                  <strong class="block">Upload a local file</strong>
                  <span class="mt-1 block text-sm opacity-70">Choose a file from your computer</span>
                </button>
              </div>
              <Show when={showConnect()}>
                <div class="mt-4">
                  <ConnectPluginCard
                    pickerOnly
                    extensionFilter="vcl"
                    onFilesSelected={(ids, files) => {
                      const selected = files?.find((file) => file.id === ids[0]);
                      if (selected) {
                        setSource(selected);
                        props.onConfigChange?.({ ...props.initialConfig, sourceId: selected.id, sourceName: selected.name });
                        setShowConnect(false);
                        setStep(2);
                      }
                    }}
                  />
                </div>
              </Show>
            </section>
          </Show>

          <Show when={step() === 2}>
            <section aria-labelledby="vcl-project-heading">
              <div class="mb-3">
                <h4 id="vcl-project-heading" class="font-semibold">Which project is this for?</h4>
                <p class="text-sm opacity-70">Choose the WorksManager project that should receive this design.</p>
              </div>
              <label class="mb-1 block text-sm font-medium" for="vcl-project">WorksManager project</label>
              <select
                id="vcl-project"
                class="byop-input w-full"
                value={projectId()}
                onChange={(event) => chooseProject(event.currentTarget.value)}
              >
                <option value="" disabled>
                  Choose a WorksManager project
                </option>
                <For each={projects()}>
                  {(item) => (
                    <option value={item.id}>
                      {item.name} ({item.status})
                    </option>
                  )}
                </For>
              </select>
              <div class="mt-4 flex justify-end">
                <ModusButton disabled={!projectId()} onClick={() => setStep(3)}>Continue</ModusButton>
              </div>
            </section>
          </Show>

          <Show when={step() === 3}>
            <section aria-labelledby="vcl-medium-heading">
              <div class="mb-3">
                <h4 id="vcl-medium-heading" class="font-semibold">What medium will this run on?</h4>
                <p class="text-sm opacity-70">This determines which devices can use the design.</p>
              </div>
              <div class="grid gap-3 sm:grid-cols-2">
                <For each={MEDIUMS}>
                  {(item) => (
                    <button type="button" class="byop-choice text-left" onClick={() => chooseMedium(item.id)}>
                      <strong class="block">{item.name}</strong>
                      <span class="mt-1 block text-sm opacity-70">{item.description}</span>
                    </button>
                  )}
                </For>
              </div>
            </section>
          </Show>

          <Show when={step() === 4}>
            <section aria-labelledby="vcl-device-heading">
              <Show
                when={mediumId() === "sitework"}
                fallback={
                  <div class="mb-3">
                    <h4 id="vcl-device-heading" class="font-semibold">Select target device</h4>
                    <p class="text-sm opacity-70">Machine control devices.</p>
                  </div>
                }
              >
                <h4 id="vcl-device-heading" class="mb-3 font-semibold">Data Collectors</h4>
                <label class="mb-3 flex items-center gap-3 text-sm">
                  <input class="byop-vcl-switch" type="checkbox" role="switch" aria-label="Publish to all Devices" checked={publishAll()} onChange={(event) => togglePublishAll(event.currentTarget.checked)} />
                  Publish to all Devices
                </label>
                <p class="byop-vcl-device-note mb-3">
                  <span aria-hidden="true">i</span>
                  Only devices compatible with .vcl format are listed below.
                </p>
              </Show>
              <div class="overflow-x-auto rounded-xl border">
                <table class="byop-vcl-device-table w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr>
                      <th class="w-10">
                        <input type="checkbox" aria-label="Select all devices" checked={allSelected()} onChange={(event) => toggleAllRows(event.currentTarget.checked)} />
                      </th>
                      <th>Device Name <span aria-hidden="true">↑</span></th>
                      <th>Device Type</th>
                      <th>Serial Number</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={devices()}>
                      {(item) => (
                        <tr>
                          <td>
                            <input type="checkbox" aria-label={`Select ${item.name}`} checked={selectedNames().includes(item.name)} onChange={() => toggleDevice(item.name)} />
                          </td>
                          <td>
                            <span class="byop-vcl-device-name">
                              <DeviceMark />
                              {item.name}
                            </span>
                          </td>
                          <td>{item.type}</td>
                          <td>{item.serial}</td>
                          <td class="opacity-70">{item.description}</td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>
              <div class="byop-vcl-wizard-review mt-5">
                <p class="mb-3 text-xs font-bold uppercase tracking-wider opacity-60">Review and create</p>
                <div class="byop-vcl-wizard-summary">
                  <span>{source()?.name}</span>
                  <span>{project()?.name}</span>
                  <span>{medium()?.name} · {deviceLabel() || "No device"}</span>
                </div>
                <label class="mt-4 block text-sm font-medium" for="vcl-design-name">Design name</label>
                <input
                  id="vcl-design-name"
                  class="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  placeholder="e.g. North Ridge VCL Design"
                  value={designName()}
                  disabled={processing()}
                  onInput={(event) => {
                    setDesignName(event.currentTarget.value);
                    reportConfig();
                  }}
                />
                <Show when={existingVersion()}>
                  <p class="mt-2 text-xs opacity-70">A design with this name exists (v{existingVersion()}). Creating saves it as v{existingVersion()! + 1}.</p>
                </Show>
                <Show when={error()}>
                  <p class="mt-2 text-sm text-[var(--modus-wc-color-danger)]" role="alert">{error()}</p>
                </Show>
                <div class="mt-4 flex justify-end">
                  <ModusButton disabled={processing() || !designName().trim() || !deviceLabel()} onClick={create}>
                    {processing() ? <><span class="byop-vcl-wizard-spinner" aria-hidden="true" /> Creating design...</> : "Create design"}
                  </ModusButton>
                </div>
              </div>
            </section>
          </Show>

          <Show when={step() > 1 && !processing()}>
            <div class="mt-5">
              <ModusButton variant="text" onClick={() => setStep(step() - 1)}>Back</ModusButton>
            </div>
          </Show>
        </Show>
      </div>
    </modus-wc-card>
  );
}
