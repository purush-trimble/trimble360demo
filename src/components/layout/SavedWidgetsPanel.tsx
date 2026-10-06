import { For } from "solid-js";
import { ModusButton } from "@/components/modus/ModusButton";
import { deleteWidget, state, toggleWidgetFavorite } from "@/lib/mockStore";

export function SavedWidgetsPanel(props: { onRunPrompt: (prompt: string) => void }) {
  const widgets = () => [...state.widgets].sort((a, b) => Number(b.favorite) - Number(a.favorite));

  return (
    <aside class="byop-panel flex h-full min-h-0 flex-col border-l border-[var(--modus-wc-color-base-200)] bg-[var(--modus-wc-color-base-100)] p-4">
      <div class="flex items-start gap-3">
        <span class="byop-main-header-mark !h-9 !w-9 !rounded-lg text-sm">☆</span>
        <div>
          <p class="text-xs font-bold uppercase tracking-wider opacity-70">Library</p>
          <p class="text-base font-semibold">Saved widgets</p>
          <p class="mt-1 text-xs opacity-70">Re-run workflows you saved from chat.</p>
        </div>
      </div>
      <div class="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto">
        <For each={widgets()}>
          {(widget) => (
            <modus-wc-card class="block">
              <div class="p-3">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <strong class="text-sm">{widget.name}</strong>
                    <p class="mt-1 text-xs opacity-70">{widget.description}</p>
                  </div>
                  <button type="button" class="byop-link text-lg leading-none" onClick={() => toggleWidgetFavorite(widget.id)}>
                    {widget.favorite ? "★" : "☆"}
                  </button>
                </div>
                <div class="mt-3 flex flex-wrap gap-2">
                  <ModusButton variant="filled" onClick={() => props.onRunPrompt(widget.prompt)}>
                    Run
                  </ModusButton>
                  <ModusButton variant="text" onClick={() => deleteWidget(widget.id)}>
                    Delete
                  </ModusButton>
                </div>
              </div>
            </modus-wc-card>
          )}
        </For>
        {!widgets().length && <p class="text-sm opacity-60">Save a workflow from a chat card to see it here.</p>}
      </div>
    </aside>
  );
}
