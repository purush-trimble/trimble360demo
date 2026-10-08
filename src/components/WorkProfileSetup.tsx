import { createSignal, For, onMount, Show } from "solid-js";
import { ModusButton } from "@/components/modus/ModusButton";
import { PLUGIN_CATALOG } from "@/lib/pluginCatalog";
import {
  ACCOUNTS,
  PHASE_LABEL,
  SOLUTION_GROUPS,
  WIDGET_INTENT_LABEL,
  accountById,
  featuresForSolutions,
  orderedFeatures,
  productLabelsForFeatures,
  productsUsedBy,
  projectById,
  projectsForAccount,
  selectionFromWidget,
  solutionById,
  solutionsInGroup,
  suggestedSelection,
  widgetsForProject,
  type ActivityWidget,
} from "@/lib/workProfileCatalog";
import type { WorkProfile } from "@/lib/workProfiles";
import { deleteWorkProfile, saveWorkProfile, selectWorkProfile, updateWorkProfile, workProfileState } from "@/lib/workProfiles";

function IconEdit() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
      <path d="m13.5 6.5 3 3" />
    </svg>
  );
}

export function WorkProfileSetup(props: { onDone: () => void; onCancel?: () => void; initialEditId?: string }) {
  const [accountId, setAccountId] = createSignal("");
  const [projectId, setProjectId] = createSignal("");
  const [solutionIds, setSolutionIds] = createSignal<string[]>([]);
  const [featureIds, setFeatureIds] = createSignal<string[]>([]);
  const [name, setName] = createSignal("");
  const [selectedWidgetId, setSelectedWidgetId] = createSignal("");
  /** preset = catalog widget; phase = defaults + tools only; custom/customize = pick solution areas. */
  const [setupPath, setSetupPath] = createSignal<"" | "preset" | "phase" | "custom" | "customize">("");
  const [editingId, setEditingId] = createSignal(props.initialEditId ?? "");

  const showSolutions = () => setupPath() === "custom" || setupPath() === "customize";
  const showTools = () =>
    setupPath() === "phase" || setupPath() === "customize" || (setupPath() === "custom" && solutionIds().length > 0);
  const toolsStep = () => (showSolutions() ? 5 : 4);
  const saveStep = () => {
    if (setupPath() === "preset") return 4;
    if (setupPath() === "phase") return 5;
    if (showTools()) return showSolutions() ? 6 : 5;
    return 5;
  };

  const projectWidgets = () => widgetsForProject(accountId(), projectId());

  const project = () => projectById(projectId());
  const visibleFeatures = () => orderedFeatures(featuresForSolutions(solutionIds()), project()?.phase ?? "build");
  const isEditing = () => Boolean(editingId());

  function loadProfile(profile: WorkProfile) {
    setEditingId(profile.id);
    setAccountId(profile.accountId);
    setProjectId(profile.projectId);
    setSolutionIds([...profile.solutionIds]);
    setFeatureIds([...profile.featureIds]);
    setName(profile.name);
    setSelectedWidgetId(profile.widgetId ?? "");
    setSetupPath(profile.widgetId ? "preset" : "phase");
  }

  onMount(() => {
    if (!props.initialEditId) return;
    const seed = workProfileState.profiles.find((profile) => profile.id === props.initialEditId);
    if (seed) loadProfile(seed);
  });

  function applyPhaseDefaults() {
    const suggested = suggestedSelection(accountId(), projectId());
    setSelectedWidgetId("");
    setSetupPath("phase");
    setSolutionIds(suggested.solutionIds);
    setFeatureIds(suggested.featureIds);
    const job = project();
    setName(job ? `${PHASE_LABEL[job.phase]} · ${job.name}` : "");
  }

  function applyWidget(widget: ActivityWidget) {
    const picked = selectionFromWidget(accountId(), widget);
    setSelectedWidgetId(picked.widgetId);
    setSetupPath("preset");
    setSolutionIds(picked.solutionIds);
    setFeatureIds(picked.featureIds);
    setName(picked.name);
  }

  function startCustomWidget() {
    setSelectedWidgetId("");
    setSetupPath("custom");
    setSolutionIds([]);
    setFeatureIds([]);
    setName("");
  }

  function startNew() {
    setEditingId("");
    setAccountId("");
    setProjectId("");
    setSolutionIds([]);
    setFeatureIds([]);
    setName("");
    setSelectedWidgetId("");
    setSetupPath("");
  }

  function chooseAccount(id: string) {
    setEditingId("");
    setAccountId(id);
    setProjectId("");
    setSolutionIds([]);
    setFeatureIds([]);
    setName("");
    setSelectedWidgetId("");
    setSetupPath("");
  }

  function chooseProject(id: string) {
    setProjectId(id);
    setSolutionIds([]);
    setFeatureIds([]);
    setName("");
    setSelectedWidgetId("");
    setSetupPath("");
  }

  function toggleSolution(id: string) {
    const account = accountById(accountId());
    if (!account?.solutionIds.includes(id)) return;
    const turningOn = !solutionIds().includes(id);
    const next = turningOn ? [...solutionIds(), id] : solutionIds().filter((item) => item !== id);
    setSolutionIds(next);
    const available = new Set(featuresForSolutions(next).map((feature) => feature.id));
    const kept = featureIds().filter((featureId) => available.has(featureId));
    if (!turningOn) {
      setFeatureIds(kept);
      return;
    }
    const fromThis = new Set(solutionById(id)?.featureIds ?? []);
    setFeatureIds([...new Set([...kept, ...[...available].filter((featureId) => fromThis.has(featureId))])]);
  }

  function toggleFeature(id: string) {
    setFeatureIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function save() {
    const features = featureIds();
    const solutions = solutionIds();
    if (!accountId() || !projectId() || !solutions.length) return;
    const payload = {
      name: name(),
      accountId: accountId(),
      projectId: projectId(),
      solutionIds: solutions,
      featureIds: features,
      productIds: productsUsedBy(features),
      widgetId: selectedWidgetId() || undefined,
    };
    if (editingId()) updateWorkProfile(editingId(), payload);
    else saveWorkProfile(payload);
    props.onDone();
  }

  return (
    <div class="flex min-h-0 flex-1 overflow-hidden">
      <Show when={workProfileState.profiles.length}>
        <aside class="byop-profile-saved">
          <div class="flex items-center justify-between gap-2">
            <h2 class="text-xs font-bold uppercase tracking-wider opacity-60">Saved work profiles</h2>
            <button type="button" class="text-xs font-semibold text-[var(--modus-wc-color-primary)]" onClick={startNew}>
              + New
            </button>
          </div>
          <ul class="mt-3 space-y-2">
            <For each={workProfileState.profiles}>
              {(profile) => (
                <li class={`byop-profile-saved-item ${workProfileState.activeId === profile.id ? "is-active" : ""} ${editingId() === profile.id ? "is-editing" : ""}`}>
                  <button
                    type="button"
                    class="min-w-0 flex-1 text-left"
                    onClick={() => {
                      selectWorkProfile(profile.id);
                      props.onDone();
                    }}
                  >
                    <span class="block truncate text-sm font-semibold">{profile.name}</span>
                    <span class="block truncate text-xs opacity-65">
                      {accountById(profile.accountId)?.name} · {projectById(profile.projectId)?.name}
                    </span>
                  </button>
                  <button
                    type="button"
                    class="byop-icon-button byop-icon-button--sm byop-icon-button--rename"
                    aria-label={`Edit ${profile.name}`}
                    title="Edit"
                    onClick={() => loadProfile(profile)}
                  >
                    <IconEdit />
                  </button>
                  <button type="button" class="byop-icon-button byop-icon-button--sm" aria-label={`Delete ${profile.name}`} title="Delete" onClick={() => deleteWorkProfile(profile.id)}>
                    ×
                  </button>
                </li>
              )}
            </For>
          </ul>
        </aside>
      </Show>
      <div class="min-w-0 flex-1 overflow-y-auto p-4 lg:p-7">
        <div class="mx-auto flex max-w-4xl flex-col gap-6">
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-[var(--modus-wc-color-primary)]">Work profile</p>
            <h2 class="text-2xl font-bold tracking-tight">{isEditing() ? "Edit work profile" : "Set up your job handbook"}</h2>
            <p class="mt-1 max-w-2xl text-sm opacity-70">
              {isEditing()
                ? "Update the account, project, solutions, or tools for this saved profile."
                : "Pick the account and project, then choose a workflow widget — features from several Trimble products composed for status or execution. Customize and save for reuse."}
            </p>
          </div>

          <section>
            <h3 class="byop-profile-step">1 · Account</h3>
            <div class="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <For each={ACCOUNTS}>
                {(account) => (
                  <button type="button" class={`byop-choice ${accountId() === account.id ? "is-selected" : ""}`} aria-pressed={accountId() === account.id} onClick={() => chooseAccount(account.id)}>
                    <strong class="block text-sm">{account.name}</strong>
                    <span class="mt-1 block text-xs opacity-65">{account.region}</span>
                    <span class="mt-2 block text-xs opacity-70">{account.solutionIds.length} licensed solutions</span>
                  </button>
                )}
              </For>
            </div>
          </section>

          <Show when={accountId()}>
            <section>
              <h3 class="byop-profile-step">2 · Project</h3>
              <div class="mt-2 grid gap-2 sm:grid-cols-2">
                <For each={projectsForAccount(accountId())}>
                  {(item) => (
                    <button type="button" class={`byop-choice ${projectId() === item.id ? "is-selected" : ""}`} aria-pressed={projectId() === item.id} onClick={() => chooseProject(item.id)}>
                      <strong class="block text-sm">{item.name}</strong>
                      <span class="mt-1 block text-xs opacity-65">
                        {PHASE_LABEL[item.phase]} · {item.status}
                      </span>
                      <span class="mt-2 block text-xs opacity-70">{item.value}</span>
                    </button>
                  )}
                </For>
              </div>
            </section>
          </Show>

          <Show when={projectId()}>
            <section>
              <h3 class="byop-profile-step">3 · Workflow widgets</h3>
              <p class="mt-1 text-xs opacity-65">
                For {project() ? `${PHASE_LABEL[project()!.phase]} phase` : "this project"} — pick how you need to work. Status widgets summarize the job; execute widgets let you change models, bids, or field data in one flow.
              </p>
              <div class="mt-2 flex flex-col gap-2">
                <For each={projectWidgets()} fallback={<p class="text-sm opacity-70">No demo widgets for this account and phase. Use phase defaults below or pick solutions manually.</p>}>
                  {(widget) => (
                    <button
                      type="button"
                      class={`byop-choice text-left ${selectedWidgetId() === widget.id ? "is-selected" : ""}`}
                      aria-pressed={selectedWidgetId() === widget.id}
                      onClick={() => applyWidget(widget)}
                    >
                      <span class="flex flex-wrap items-center gap-2">
                        <strong class="text-sm">{widget.name}</strong>
                        <span class="rounded-full border border-[var(--modus-wc-color-base-300)] px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide opacity-75">
                          {WIDGET_INTENT_LABEL[widget.intent]}
                        </span>
                      </span>
                      <span class="mt-2 block text-xs opacity-70">{widget.valueStory}</span>
                      <span class="byop-widget-footnote">
                        Features from {productLabelsForFeatures(widget.featureIds).join(" · ")}
                      </span>
                    </button>
                  )}
                </For>
                <button
                  type="button"
                  class={`byop-choice text-left ${setupPath() === "phase" ? "is-selected" : ""}`}
                  aria-pressed={setupPath() === "phase"}
                  onClick={applyPhaseDefaults}
                >
                  <strong class="text-sm">Phase defaults</strong>
                  <span class="mt-1 block text-xs opacity-65">Common tools for this phase — adjust panels, no solution picker.</span>
                </button>
                <button
                  type="button"
                  class={`byop-choice text-left ${setupPath() === "custom" || setupPath() === "customize" ? "is-selected" : ""}`}
                  aria-pressed={setupPath() === "custom" || setupPath() === "customize"}
                  onClick={startCustomWidget}
                >
                  <strong class="text-sm">Build custom widget</strong>
                  <span class="mt-1 block text-xs opacity-65">Choose solution areas, then tools — for a mix no preset covers.</span>
                </button>
              </div>
            </section>

            <Show when={setupPath() === "preset"}>
              <section class="rounded-xl border border-[var(--modus-wc-color-base-200)] bg-[var(--modus-wc-color-base-100)] px-4 py-3">
                <p class="text-sm opacity-85">This preset is ready to save. Solutions and tools are already set for you.</p>
                <ModusButton class="mt-3" variant="outlined" onClick={() => setSetupPath("customize")}>
                  Customize solutions and tools
                </ModusButton>
              </section>
            </Show>

            <Show when={showSolutions()}>
            <section>
              <h3 class="byop-profile-step">4 · Solutions</h3>
              <p class="mt-1 text-xs opacity-65">
                Pick Trimble solution areas for your widget. Only what this account licenses is available.
              </p>
              <div class="mt-3 flex flex-col gap-4">
                <For each={SOLUTION_GROUPS}>
                  {(group) => (
                    <div>
                      <h4 class="text-xs font-bold uppercase tracking-wider opacity-60">{group.label}</h4>
                      <div class="mt-2 grid gap-2 sm:grid-cols-2">
                        <For each={solutionsInGroup(group.id)}>
                          {(solution) => {
                            const licensed = () => accountById(accountId())?.solutionIds.includes(solution.id) ?? false;
                            const selected = () => solutionIds().includes(solution.id);
                            return (
                              <button
                                type="button"
                                class={`byop-choice ${selected() ? "is-selected" : ""} ${licensed() ? "" : "is-disabled"}`}
                                aria-pressed={selected()}
                                disabled={!licensed()}
                                onClick={() => toggleSolution(solution.id)}
                              >
                                <strong class="block text-sm">{solution.name}</strong>
                                <span class="mt-1 block text-xs opacity-65">{licensed() ? solution.description : "Not licensed for this account"}</span>
                              </button>
                            );
                          }}
                        </For>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </section>
            </Show>

            <Show when={showTools()}>
            <section>
              <h3 class="byop-profile-step">{toolsStep()} · Tools in this widget</h3>
              <p class="mt-1 text-xs opacity-65">
                These panels appear on your job view and in chat. {project() ? `${PHASE_LABEL[project()!.phase]} tools are listed first.` : ""} Uncheck anything this work profile should not include.
              </p>
              <Show
                when={visibleFeatures().length}
                fallback={<p class="mt-2 text-sm opacity-70">None of the selected solutions expose a demo panel yet. They still stay on the work profile.</p>}
              >
                <div class="mt-2 flex flex-col gap-2">
                  <For each={visibleFeatures()}>
                    {(feature) => (
                      <label class={`byop-choice byop-choice-check ${featureIds().includes(feature.id) ? "is-selected" : ""}`}>
                        <input type="checkbox" checked={featureIds().includes(feature.id)} onChange={() => toggleFeature(feature.id)} />
                        <span class="min-w-0">
                          <strong class="block text-sm">
                            {feature.name}
                            <span class="ml-2 text-xs font-semibold uppercase tracking-wide opacity-60">{PHASE_LABEL[feature.phase]}</span>
                          </strong>
                          <span class="mt-1 block text-xs opacity-65">
                            {PLUGIN_CATALOG[feature.productId].name}
                            {feature.alsoRequires?.length ? ` + ${feature.alsoRequires.map((id) => PLUGIN_CATALOG[id].name).join(", ")}` : ""}
                            {" · "}
                            {feature.description}
                          </span>
                        </span>
                      </label>
                    )}
                  </For>
                </div>
              </Show>
            </section>
            </Show>

            <Show when={setupPath() === "preset" || setupPath() === "phase" || solutionIds().length}>
            <section class="flex flex-col gap-3">
              <h3 class="byop-profile-step">
                {saveStep()} · {isEditing() ? "Save changes" : "Save work profile"}
              </h3>
              <label class="block text-sm font-medium">
                Name
                <input class="byop-input mt-1 w-full" value={name()} onInput={(event) => setName(event.currentTarget.value)} />
              </label>
              <div class="flex flex-wrap gap-2">
                <ModusButton disabled={!solutionIds().length || !name().trim()} onClick={save}>
                  {isEditing() ? "Save changes" : "Save and open job view"}
                </ModusButton>
                <Show when={props.onCancel}>
                  <ModusButton variant="outlined" onClick={props.onCancel}>
                    Cancel
                  </ModusButton>
                </Show>
              </div>
            </section>
            </Show>
          </Show>
        </div>
      </div>
    </div>
  );
}
