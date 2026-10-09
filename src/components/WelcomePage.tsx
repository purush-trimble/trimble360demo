import { For, Show } from "solid-js";
import { ModusButton } from "@/components/modus/ModusButton";
import { currentUser } from "@/lib/currentUser";
import {
  availableWelcomeWorkflows,
  productLabelsForWelcome,
  type WelcomeWorkflow,
} from "@/lib/welcomeWorkflows";

export function WelcomePage(props: {
  onLaunch: (workflow: WelcomeWorkflow) => void;
  onContinueToChat: () => void;
}) {
  const workflows = availableWelcomeWorkflows();

  return (
    <main class="byop-view-enter flex min-h-0 flex-1 overflow-y-auto p-4 lg:p-10">
      <div class="mx-auto flex w-full max-w-5xl flex-col justify-center gap-8">
        <header class="max-w-2xl">
          <p class="text-xs font-bold uppercase tracking-wider text-[var(--modus-wc-color-primary)]">Trimble 360</p>
          <h1 class="mt-2 text-3xl font-bold tracking-tight">What would you like to get done?</h1>
          <p class="mt-3 text-base opacity-70">
            Signed in as {currentUser.name}. {currentUser.summary} Start with a ready-made workflow, or open chat and decide as you go.
          </p>
        </header>

        <section aria-labelledby="workflow-heading">
          <h2 id="workflow-heading" class="text-sm font-semibold uppercase tracking-wider opacity-60">Start with a workflow</h2>
          <div class="mt-3 grid gap-4 md:grid-cols-2">
            <For each={workflows} fallback={<p class="text-sm opacity-70">No workflows are available for this account yet.</p>}>
              {(workflow) => (
                <button
                  type="button"
                  class="byop-choice p-5 text-left"
                  onClick={() => props.onLaunch(workflow)}
                >
                  <span class="flex items-start justify-between gap-4">
                    <span>
                      <strong class="block text-lg">{workflow.title}</strong>
                      <span class="mt-2 block text-sm opacity-70">{workflow.description}</span>
                    </span>
                    <span aria-hidden="true" class="text-2xl opacity-50">→</span>
                  </span>
                  <span class="mt-5 block text-xs opacity-60">
                    Uses {productLabelsForWelcome(workflow).join(" and ")}
                  </span>
                </button>
              )}
            </For>
          </div>
        </section>

        <div class="flex flex-wrap items-center gap-3">
          <ModusButton variant="outlined" onClick={props.onContinueToChat}>
            Continue to chat
          </ModusButton>
          <Show when={workflows.length}>
            <span class="text-sm opacity-60">Not sure yet? You can choose a workflow later.</span>
          </Show>
        </div>
      </div>
    </main>
  );
}
