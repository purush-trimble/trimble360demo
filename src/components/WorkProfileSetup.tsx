import { createSignal, For, Show } from "solid-js";
import { ModusButton } from "@/components/modus/ModusButton";
import { PLUGIN_CATALOG } from "@/lib/pluginCatalog";
import {
  ACCOUNTS,
  PHASE_LABEL,
  SOLUTION_GROUPS,
  accountById,
  featuresForSolutions,
  orderedFeatures,
  productsUsedBy,
  projectById,
  projectsForAccount,
  solutionById,
  solutionsInGroup,
  suggestedSelection,
} from "@/lib/workProfileCatalog";
import { deleteWorkProfile, saveWorkProfile, selectWorkProfile, workProfileState } from "@/lib/workProfiles";

export function WorkProfileSetup(props: { onDone: () => void; onCancel?: () => void }) {
  const [accountId, setAccountId] = createSignal("");
  const [projectId, setProjectId] = createSignal("");
  const [solutionIds, setSolutionIds] = createSignal<string[]>([]);
  const [featureIds, setFeatureIds] = createSignal<string[]>([]);
  const [name, setName] = createSignal("");

  const project = () => projectById(projectId());
  const visibleFeatures = () => orderedFeatures(featuresForSolutions(solutionIds()), project()?.phase ?? "build");

  function applySuggestion(nextAccountId: string, nextProjectId: string) {
    if (!nextAccountId || !nextProjectId) return;
    const suggested = suggestedSelection(nextAccountId, nextProjectId);
    setSolutionIds(suggested.solutionIds);
    setFeatureIds(suggested.featureIds);
    const job = projectById(nextProjectId);
    setName(job ? `${PHASE_LABEL[job.phase]} · ${job.name}` : "");
  }

  function chooseAccount(id: string) {
    setAccountId(id);
    setProjectId("");
    setSolutionIds([]);
    setFeatureIds([]);
    setName("");
  }

  function chooseProject(id: string) {
    setProjectId(id);
    applySuggestion(accountId(), id);
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
    saveWorkProfile({
      name: name(),
      accountId: accountId(),
      projectId: projectId(),
      solutionIds: solutions,
      featureIds: features,
      productIds: productsUsedBy(features),
    });
    props.onDone();
  }

  return (
    <div class="flex min-h-0 flex-1 overflow-hidden">
      <Show when={workProfileState.profiles.length}>
        <aside class="byop-profile-saved">
          <h2 class="text-xs font-bold uppercase tracking-wider opacity-60">Saved work profiles</h2>
          <ul class="mt-3 space-y-2">
            <For each={workProfileState.profiles}>
              {(profile) => (
                <li class={`byop-profile-saved-item ${workProfileState.activeId === profile.id ? "is-active" : ""}`}>
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
                  <button type="button" class="byop-icon-button byop-icon-button--sm" aria-label={`Delete ${profile.name}`} onClick={() => deleteWorkProfile(profile.id)}>
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
            <h2 class="text-2xl font-bold tracking-tight">Set up your job handbook</h2>
            <p class="mt-1 max-w-2xl text-sm opacity-70">
              Pick the account and project, then choose the Trimble solutions and tools you need. Save any mix as a reusable work profile — no preset roles required.
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
              <h3 class="byop-profile-step">3 · Solutions</h3>
              <p class="mt-1 text-xs opacity-65">
                We start with solutions common for the {project() ? PHASE_LABEL[project()!.phase].toLowerCase() : "project"} phase. Turn off anything this handbook should not include — your mix is saved for reuse.
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

            <section>
              <h3 class="byop-profile-step">4 · Tools for this activity</h3>
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

            <section class="flex flex-col gap-3">
              <h3 class="byop-profile-step">5 · Save work profile</h3>
              <label class="block text-sm font-medium">
                Name
                <input class="byop-input mt-1 w-full" value={name()} onInput={(event) => setName(event.currentTarget.value)} />
              </label>
              <div class="flex flex-wrap gap-2">
                <ModusButton disabled={!solutionIds().length || !name().trim()} onClick={save}>
                  Save and open job view
                </ModusButton>
                <Show when={props.onCancel}>
                  <ModusButton variant="outlined" onClick={props.onCancel}>
                    Cancel
                  </ModusButton>
                </Show>
              </div>
            </section>
          </Show>
        </div>
      </div>
    </div>
  );
}
