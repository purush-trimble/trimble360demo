import { For, Show } from "solid-js";
import { deleteWidget, state, toggleWidgetFavorite } from "@/lib/mockStore";
import type { SavedWidget } from "@/lib/types";

function WidgetIcon(props: { action: string }) {
  switch (props.action) {
    case "connect_file_browser":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
          <path d="M10 13h4" />
        </svg>
      );
    case "worksmanager_design_list":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 6h16v4H4Z" />
          <path d="M4 14h10v4H4Z" />
          <path d="M18 14h2v8h-2Z" />
        </svg>
      );
    case "publish_connect_to_wm":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3v12" />
          <path d="m7 10 5 5 5-5" />
          <path d="M5 21h14" />
        </svg>
      );
    case "create_design":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 5h6v6H4Z" />
          <path d="M14 5h6v6h-6Z" />
          <path d="M4 15h6v4H4Z" />
          <path d="M14 15h6v4h-6Z" />
        </svg>
      );
  }
}

export const WIDGET_SIDEBAR_PREVIEW_COUNT = 2;

export function sortedWidgets(): SavedWidget[] {
  return [...state.widgets].sort((a, b) => Number(b.favorite) - Number(a.favorite));
}

export function SavedWidgetsPanel(props: {
  onRunPrompt: (prompt: string) => void;
  /** When set, only the first N widgets are shown (sidebar preview). */
  maxItems?: number;
  /** Compact rows for the sidebar; cards for the modal / full panel. */
  compact?: boolean;
  /** Drop outer aside chrome when nested in the modal. */
  embedded?: boolean;
}) {
  const widgets = () => {
    const items = sortedWidgets();
    return props.maxItems != null ? items.slice(0, props.maxItems) : items;
  };

  const shellClass = () =>
    props.embedded || props.compact
      ? "flex min-h-0 flex-col"
      : "byop-panel flex h-full min-h-0 flex-col border-l border-[var(--modus-wc-color-base-200)] bg-[var(--modus-wc-color-base-100)] p-4";

  return (
    <div class={shellClass()}>
      <Show when={!props.embedded && !props.compact}>
        <div class="flex items-start gap-3">
          <span class="byop-main-header-mark !h-9 !w-9 !rounded-lg text-sm">☆</span>
          <div>
            <p class="text-xs font-bold uppercase tracking-wider opacity-70">Library</p>
            <p class="text-base font-semibold">Saved widgets</p>
            <p class="mt-1 text-xs opacity-70">Re-run workflows you saved from chat.</p>
          </div>
        </div>
      </Show>
      <div
        class={`min-h-0 flex-1 overflow-y-auto byop-widget-stack ${
          props.compact ? "" : "byop-widget-stack--modal"
        } ${props.embedded || props.compact ? "" : "mt-4"}`}
      >
        <For each={widgets()}>
          {(widget) =>
            props.compact ? (
              <div class="byop-widget-preview">
                <span class="byop-widget-preview-icon" aria-hidden="true">
                  <WidgetIcon action={widget.action} />
                </span>
                <button
                  type="button"
                  class="byop-widget-preview-main"
                  title={widget.description}
                  onClick={() => props.onRunPrompt(widget.prompt)}
                >
                  <span class="block truncate text-sm font-medium leading-snug">{widget.name}</span>
                  <span class="byop-widget-preview-desc">{widget.description}</span>
                </button>
                <button
                  type="button"
                  class="byop-widget-preview-favorite"
                  aria-label={widget.favorite ? "Unfavorite widget" : "Favorite widget"}
                  onClick={() => toggleWidgetFavorite(widget.id)}
                >
                  {widget.favorite ? "★" : "☆"}
                </button>
              </div>
            ) : (
              <article class="byop-widget-card">
                <div class="byop-widget-card-icon" aria-hidden="true">
                  <WidgetIcon action={widget.action} />
                </div>
                <div class="byop-widget-card-body">
                  <div class="byop-widget-card-text">
                    <strong class="text-sm leading-snug">{widget.name}</strong>
                    <p class="byop-widget-card-desc">{widget.description}</p>
                  </div>
                  <div class="byop-widget-card-toolbar">
                    <button
                      type="button"
                      class={`byop-widget-card-favorite${widget.favorite ? " is-active" : ""}`}
                      aria-label={widget.favorite ? "Unfavorite widget" : "Favorite widget"}
                      title={widget.favorite ? "Remove from favorites" : "Add to favorites"}
                      onClick={() => toggleWidgetFavorite(widget.id)}
                    >
                      {widget.favorite ? "★" : "☆"}
                    </button>
                    <div class="byop-widget-card-actions" role="group" aria-label="Widget actions">
                      <button
                        type="button"
                        class="byop-widget-card-action byop-widget-card-action--primary"
                        onClick={() => props.onRunPrompt(widget.prompt)}
                      >
                        Apply
                      </button>
                      <button
                        type="button"
                        class="byop-widget-card-action byop-widget-card-action--danger"
                        onClick={() => deleteWidget(widget.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            )
          }
        </For>
        {!widgets().length && (
          <p class={props.compact ? "byop-sidebar-empty-hint" : "text-sm opacity-60"}>
            Save a workflow from a chat card to see it here.
          </p>
        )}
      </div>
    </div>
  );
}
