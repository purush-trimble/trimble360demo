import { For, Show } from "solid-js";
import {
  ACCOUNTS,
  PHASE_LABEL,
  WIDGET_INTENT_LABEL,
  accountById,
  productLabelsForFeatures,
  projectById,
  projectsForAccount,
  solutionNames,
  widgetById,
} from "@/lib/workProfileCatalog";
import { activeWorkProfile, focusAccount, focusProject, setWorkScope, workProfileState, workspaceSlice } from "@/lib/workProfiles";

export function WorkContextBar(props: { profileName: string }) {
  const slice = () => workspaceSlice();
  const activityWidget = () => widgetById(activeWorkProfile()?.widgetId ?? "");

  return (
    <Show when={slice()}>
      {(current) => (
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <div class="byop-scope-toggle" role="group" aria-label="Job scope">
              <button type="button" class={workProfileState.scope === "project" ? "is-selected" : ""} aria-pressed={workProfileState.scope === "project"} onClick={() => setWorkScope("project")}>
                This project
              </button>
              <button type="button" class={workProfileState.scope === "account" ? "is-selected" : ""} aria-pressed={workProfileState.scope === "account"} onClick={() => setWorkScope("account")}>
                Whole account
              </button>
            </div>
            <Show
              when={current().scope === "project"}
              fallback={
                <label class="text-xs font-semibold">
                  Account
                  <select class="byop-input ml-2" aria-label="Account" value={current().accountId} onChange={(event) => focusAccount(event.currentTarget.value)}>
                    <For each={ACCOUNTS}>
                      {(account) => <option value={account.id}>{account.name}</option>}
                    </For>
                  </select>
                </label>
              }
            >
              <span class="text-sm font-medium">{accountById(current().accountId)?.name}</span>
              <label class="text-xs font-semibold">
                Project
                <select class="byop-input ml-2" aria-label="Project in this account" value={current().projectId} onChange={(event) => focusProject(event.currentTarget.value)}>
                  <For each={projectsForAccount(current().accountId)}>
                    {(project) => (
                      <option value={project.id}>
                        {project.name} · {PHASE_LABEL[project.phase]}
                      </option>
                    )}
                  </For>
                </select>
              </label>
            </Show>
          </div>
          <Show
            when={current().scope === "project"}
            fallback={
              <>
                <h2 class="mt-2 text-2xl font-bold tracking-tight">{accountById(current().accountId)?.name}</h2>
                <p class="mt-1 max-w-3xl text-sm opacity-75">Every solution licensed for this account. Switch accounts to open a different customer's tools.</p>
              </>
            }
          >
            <h2 class="mt-2 text-2xl font-bold tracking-tight">
              {current().usingSavedWorkProfile ? props.profileName : projectById(current().projectId)?.name}
            </h2>
            <p class="mt-1 text-sm opacity-65">
              {PHASE_LABEL[projectById(current().projectId)?.phase ?? "build"]} phase · {accountById(current().accountId)?.name}
            </p>
            <p class="mt-1 max-w-3xl text-sm opacity-75">{projectById(current().projectId)?.value}</p>
            <Show when={activityWidget()}>
              {(widget) => (
                <p class="mt-2 max-w-3xl rounded-lg border border-[var(--modus-wc-color-base-200)] bg-[var(--modus-wc-color-base-100)] px-3 py-2 text-sm opacity-85">
                  <span class="text-xs font-bold uppercase tracking-wide text-[var(--modus-wc-color-primary)]">
                    {WIDGET_INTENT_LABEL[widget().intent]} · {widget().name}
                  </span>
                  <span class="mt-1 block opacity-75">{widget().valueStory}</span>
                  <span class="byop-widget-footnote byop-widget-footnote--inline">
                    Features from{" "}
                    {productLabelsForFeatures(activeWorkProfile()?.featureIds ?? widget().featureIds).join(" · ")}
                  </span>
                </p>
              )}
            </Show>
            <Show when={!current().usingSavedWorkProfile}>
              <p class="mt-1 text-xs opacity-60">Tools suggested for this project phase. Open Work profiles to save your own mix, or Whole account for everything licensed.</p>
            </Show>
          </Show>
          <p class="mt-1 text-xs opacity-60">{solutionNames(current().solutionIds).join(" · ")}</p>
        </div>
      )}
    </Show>
  );
}
