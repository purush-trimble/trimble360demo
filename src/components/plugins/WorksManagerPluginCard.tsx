import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { cancelDesignPull, pullDesign, state, uploadDesignVersion } from "@/lib/mockStore";
import { currentUser, userName } from "@/lib/currentUser";
import type { Design, DesignListLayout } from "@/lib/types";

function DesignHistory(props: { design: Design }) {
  return (
    <span class="block text-xs opacity-70">
      v{props.design.version ?? 1} · {props.design.updatedBy
        ? `Updated by ${userName(props.design.updatedBy)} · ${props.design.updatedAt}`
        : `Created by ${userName(props.design.createdBy ?? "office-admin")}`}
      <Show when={props.design.changeNote}>{(note) => <span class="block italic">"{note()}"</span>}</Show>
    </span>
  );
}

function DesignVersionActions(props: { design: Design }) {
  const [note, setNote] = createSignal("");
  const [error, setError] = createSignal("");
  const mine = () => props.design.checkedOutBy === currentUser.id;
  const next = () => (props.design.version ?? 1) + 1;
  const run = (result: { ok: boolean; error?: string }) => setError(result.ok ? "" : result.error ?? "");

  return (
    <div class="flex flex-col gap-1 text-xs">
      <Show
        when={props.design.checkedOutBy}
        fallback={<button type="button" class="byop-choice px-2 py-1" onClick={() => run(pullDesign(props.design.id))}>Pull to update</button>}
      >
        <Show when={mine()} fallback={<span class="font-semibold opacity-70">Locked · {userName(props.design.checkedOutBy)} is updating</span>}>
          <input
            class="byop-input"
            aria-label={`What changed in ${props.design.name}`}
            placeholder="What changed?"
            value={note()}
            onInput={(e) => setNote(e.currentTarget.value)}
          />
          <div class="flex gap-1">
            <button
              type="button"
              class="byop-choice px-2 py-1"
              onClick={() => {
                const result = uploadDesignVersion(props.design.id, note());
                run(result);
                if (result.ok) setNote("");
              }}
            >
              Upload v{next()}
            </button>
            <button type="button" class="byop-choice px-2 py-1" onClick={() => cancelDesignPull(props.design.id)}>Cancel</button>
          </div>
        </Show>
      </Show>
      <Show when={error()}><span class="text-[var(--modus-wc-color-danger)]" role="alert">{error()}</span></Show>
    </div>
  );
}

export function WorksManagerPluginCard(props: {
  projectId?: string;
  projectName?: string;
  layout?: DesignListLayout;
  onLayoutChange?: (layout: DesignListLayout) => void;
}) {
  const [query, setQuery] = createSignal("");
  const [type, setType] = createSignal("All types");
  const [layout, setLayout] = createSignal<DesignListLayout>(props.layout === "cards" ? "cards" : "table");
  const projectId = () => props.projectId ?? "proj-north-ridge";
  const projectName = () => props.projectName ?? state.projects.find((project) => project.id === projectId())?.name ?? "Project";
  const designs = createMemo(() => state.designs.filter((design) => {
    const text = `${design.name} ${design.type ?? ""}`.toLowerCase();
    return design.projectId === projectId() && text.includes(query().toLowerCase()) && (type() === "All types" || (design.type ?? "Other") === type());
  }));

  createEffect(() => {
    if (props.layout === "table" || props.layout === "cards") setLayout(props.layout);
  });

  function chooseLayout(next: DesignListLayout) {
    setLayout(next);
    props.onLayoutChange?.(next);
  }

  return (
    <modus-wc-card class="block">
      <div class="p-5">
        <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-[var(--modus-wc-color-primary)]">WorksManager library</p>
            <h3 class="text-lg font-semibold">Project designs · {projectName()}</h3>
          </div>
          <div class="flex items-center gap-2">
            <div class="byop-scope-toggle" role="group" aria-label="Design layout">
              <button type="button" class={layout() === "table" ? "is-selected" : ""} aria-pressed={layout() === "table"} onClick={() => chooseLayout("table")}>Table</button>
              <button type="button" class={layout() === "cards" ? "is-selected" : ""} aria-pressed={layout() === "cards"} onClick={() => chooseLayout("cards")}>Cards</button>
            </div>
            <span class="rounded-full border border-[var(--modus-wc-color-base-300)] px-3 py-1 text-xs font-semibold">{designs().length} designs</span>
          </div>
        </div>
        <div class="mb-4 grid gap-3 sm:grid-cols-[1fr_180px]">
          <input class="byop-input" aria-label="Search designs" placeholder="Search designs" value={query()} onInput={(e) => setQuery(e.currentTarget.value)} />
          <select class="byop-input" aria-label="Filter by design type" value={type()} onChange={(e) => setType(e.currentTarget.value)}>
            <option>All types</option><option>VCL</option><option>SVD</option><option>DXF</option><option>TTM</option>
          </select>
        </div>
        <Show
          when={layout() === "cards"}
          fallback={
            <div class="overflow-x-auto rounded-xl border border-[var(--modus-wc-color-base-200)]">
              <table class="w-full min-w-[820px] text-left text-sm">
                <thead class="bg-[var(--modus-wc-color-base-100)] text-xs uppercase tracking-wide opacity-70">
                  <tr><th class="px-4 py-3">Design</th><th class="px-4 py-3">Type</th><th class="px-4 py-3">Sources</th><th class="px-4 py-3">Created</th><th class="px-4 py-3">Status</th><th class="px-4 py-3">Version</th></tr>
                </thead>
                <tbody class="divide-y divide-[var(--modus-wc-color-base-200)]">
                  <For each={designs()} fallback={<tr><td colspan="6" class="px-4 py-8 text-center opacity-60">No designs match this project and filter.</td></tr>}>
                    {(design) => <tr class="hover:bg-[var(--modus-wc-color-base-100)]">
                      <td class="px-4 py-3"><span class="font-semibold">{design.name}</span><DesignHistory design={design} /></td>
                      <td class="px-4 py-3"><span class="rounded-md border px-2 py-1 text-xs font-bold">{design.type ?? "Design"}</span></td>
                      <td class="px-4 py-3 opacity-70">{design.sourceFileIds.length} files</td>
                      <td class="px-4 py-3 opacity-70">{design.createdAt}</td>
                      <td class="px-4 py-3"><span class="text-xs font-semibold text-[var(--modus-wc-color-success)]">{design.status}</span></td>
                      <td class="px-4 py-3"><DesignVersionActions design={design} /></td>
                    </tr>}
                  </For>
                </tbody>
              </table>
            </div>
          }
        >
          <div class="byop-design-cards">
            <For each={designs()} fallback={<p class="px-2 py-8 text-center text-sm opacity-60">No designs match this project and filter.</p>}>
              {(design) => (
                <article class="byop-design-card">
                  <div class="flex items-start justify-between gap-2">
                    <h4 class="font-semibold">{design.name}</h4>
                    <span class="rounded-md border px-2 py-1 text-xs font-bold">{design.type ?? "Design"}</span>
                  </div>
                  <p class="mt-2 text-sm opacity-70">{design.sourceFileIds.length} files · {design.createdAt}</p>
                  <p class="mt-2 text-xs font-semibold text-[var(--modus-wc-color-success)]">{design.status}</p>
                  <div class="mt-2"><DesignHistory design={design} /></div>
                  <div class="mt-3"><DesignVersionActions design={design} /></div>
                </article>
              )}
            </For>
          </div>
        </Show>
      </div>
    </modus-wc-card>
  );
}
