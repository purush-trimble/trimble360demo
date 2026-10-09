import { createMemo, createSignal, For, Show } from "solid-js";
import { ModusButton } from "@/components/modus/ModusButton";
import { ConnectPluginCard } from "@/components/plugins/ConnectPluginCard";
import { createDesign, getProjects } from "@/lib/mockStore";
import type { ConnectFile, WorksManagerProject } from "@/lib/types";
import type { SavedWorkflowConfig } from "@/lib/types";

type MediumId = "machine-control" | "sitework";

const MEDIUMS: { id: MediumId; name: string; description: string; device: string; deviceDescription: string }[] = [
  {
    id: "machine-control",
    name: "Machine Control",
    description: "Grade control for GPS dozers and excavators.",
    device: "EC520",
    deviceDescription: "Machine control display",
  },
  {
    id: "sitework",
    name: "Sitework",
    description: "Field layout and site measurement.",
    device: "Tablet",
    deviceDescription: "Field tablet",
  },
];

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
  const [device, setDevice] = createSignal(props.initialConfig?.device ?? "");
  const [designName, setDesignName] = createSignal(props.initialConfig?.designName ?? "");
  const [processing, setProcessing] = createSignal(false);
  const [created, setCreated] = createSignal(false);

  const project = createMemo(() => projects().find((item) => item.id === projectId()));
  const medium = createMemo(() => MEDIUMS.find((item) => item.id === mediumId()));
  const reportConfig = () => props.onConfigChange?.({
    sourceId: source()?.id ?? props.initialConfig?.sourceId,
    sourceName: source()?.name ?? props.initialConfig?.sourceName,
    projectId: projectId() || undefined,
    mediumId: mediumId() || undefined,
    device: device() || undefined,
    designName: designName() || undefined,
  });
  const steps = ["Source", "Project", "Medium", "Device"];

  function chooseProject(id: string) {
    setProjectId(id);
    const selected = projects().find((item) => item.id === id);
    if (selected) setDesignName(`${selected.name} VCL Design`);
    reportConfig();
    setStep(3);
  }

  function chooseMedium(id: MediumId) {
    const selected = MEDIUMS.find((item) => item.id === id);
    setMediumId(id);
    setDevice(selected?.device ?? "");
    reportConfig();
    setStep(4);
  }

  function chooseDevice() {
    if (device()) setDesignName(designName() || `${project()?.name ?? "Project"} VCL Design`);
    reportConfig();
  }

  function create() {
    if (!source() || !projectId() || !medium() || !device() || !designName().trim()) return;
    setProcessing(true);
    window.setTimeout(() => {
      createDesign({ projectId: projectId(), name: designName(), sourceFileIds: [source()!.id] });
      setProcessing(false);
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
              <p class="text-lg font-semibold">{designName()} has been created</p>
              <p class="mt-1 text-sm opacity-70">Your VCL design is ready for {device()}.</p>
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
              <div class="space-y-2">
                <For each={projects()}>
                  {(item) => (
                    <button type="button" class="byop-choice flex w-full items-center justify-between text-left" onClick={() => chooseProject(item.id)}>
                      <span>
                        <strong class="block">{item.name}</strong>
                        <span class="text-sm opacity-70">WorksManager project</span>
                      </span>
                      <span class="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">{item.status}</span>
                    </button>
                  )}
                </For>
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
              <div class="mb-3">
                <h4 id="vcl-device-heading" class="font-semibold">Select target device</h4>
                <p class="text-sm opacity-70">Available for {medium()?.name}.</p>
              </div>
              <button type="button" class="byop-choice w-full text-left is-selected" onClick={chooseDevice}>
                <strong class="block">{medium()?.device}</strong>
                <span class="mt-1 block text-sm opacity-70">{medium()?.deviceDescription}</span>
              </button>
              <div class="byop-vcl-wizard-review mt-5">
                <p class="mb-3 text-xs font-bold uppercase tracking-wider opacity-60">Review and create</p>
                <div class="byop-vcl-wizard-summary">
                  <span>{source()?.name}</span>
                  <span>{project()?.name}</span>
                  <span>{medium()?.name} · {device()}</span>
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
                    props.onConfigChange?.({ ...props.initialConfig, designName: event.currentTarget.value });
                  }}
                />
                <div class="mt-4 flex justify-end">
                  <ModusButton disabled={processing() || !designName().trim()} onClick={create}>
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
