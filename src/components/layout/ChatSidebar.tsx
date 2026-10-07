import { createSignal, For, Show } from "solid-js";

import { ModusButton } from "@/components/modus/ModusButton";
import {
  SavedWidgetsPanel,
  sortedWidgets,
  WIDGET_SIDEBAR_PREVIEW_COUNT,
} from "@/components/layout/SavedWidgetsPanel";
import { WidgetsLibraryModal } from "@/components/layout/WidgetsLibraryModal";

import {

  createConversation,

  deleteConversation,

  listConversations,

  renameConversation,

  searchConversations,

  selectConversation,

  state,

} from "@/lib/mockStore";

import type { PluginId } from "@/lib/types";



function IconRename() {

  return (

    <svg viewBox="0 0 24 24" aria-hidden="true">

      <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />

      <path d="m13.5 6.5 3 3" />

    </svg>

  );

}



function IconDelete() {

  return (

    <svg viewBox="0 0 24 24" aria-hidden="true">

      <path d="M4 7h16" />

      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />

      <path d="M6 7l1 14h10l1-14" />

    </svg>

  );

}



function IconPlugins() {

  return (

    <svg viewBox="0 0 24 24" aria-hidden="true">

      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />

      <circle cx="12" cy="12" r="3.2" />

    </svg>

  );

}



export function ChatSidebar(props: {

  open: boolean;

  onToggleOpen: () => void;

  connectedProducts: PluginId[];

  showPluginsNav: boolean;

  onOpenPlugins: () => void;

  onRunWidgetPrompt: (prompt: string) => void;

}) {

  const [query, setQuery] = createSignal("");
  const [widgetsModalOpen, setWidgetsModalOpen] = createSignal(false);

  const [editingId, setEditingId] = createSignal<string | null>(null);

  const [editTitle, setEditTitle] = createSignal("");



  const conversations = () => (query() ? searchConversations(query()) : listConversations());
  const widgetCount = () => sortedWidgets().length;
  const showWidgetViewMore = () => widgetCount() > WIDGET_SIDEBAR_PREVIEW_COUNT;



  function startRename(id: string, title: string) {

    setEditingId(id);

    setEditTitle(title);

  }



  function commitRename(id: string) {

    renameConversation(id, editTitle());

    setEditingId(null);

  }



  return (

    <aside class="byop-sidebar flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden border-r border-[var(--modus-wc-color-base-200)] bg-[var(--modus-wc-color-base-100)]">

      <Show

        when={props.open}

        fallback={

          <div class="byop-collapsed-sidebar">

            <button type="button" class="byop-icon-button" aria-label="Open chat menu" title="Open chat menu" onClick={props.onToggleOpen}>

              ☰

            </button>

            <button type="button" class="byop-collapsed-action" aria-label="New chat" title="New chat" onClick={() => createConversation()}>

              +

            </button>

            <button type="button" class="byop-collapsed-action" aria-label="Search chats" title="Search chats" onClick={props.onToggleOpen}>

              ⌕

            </button>

            <div class="flex-1" />

            <span class="byop-collapsed-mark" aria-hidden="true">BY</span>

          </div>

        }

      >

        <div class="byop-sidebar-header border-b border-[var(--modus-wc-color-base-200)] px-4 py-3.5">

          <div class="byop-sidebar-actions">

            <ModusButton class="byop-new-chat" onClick={() => createConversation()}>

              <span class="byop-plus-icon">+</span>

              New chat

            </ModusButton>

            <button type="button" class="byop-icon-button" aria-label="Close chat menu" title="Close chat menu" onClick={props.onToggleOpen}>

              ×

            </button>

          </div>

          <label class="byop-search mt-2.5">

            <span class="byop-search-icon" aria-hidden="true">⌕</span>

            <input

              class="byop-input"

              aria-label="Search chats"

              placeholder="Search chats"

              value={query()}

              onInput={(e) => setQuery(e.currentTarget.value)}

            />

            <Show when={query()}>

              <button type="button" class="byop-search-clear" aria-label="Clear search" onClick={() => setQuery("")}>×</button>

            </Show>

          </label>

        </div>

        <div class="byop-sidebar-body min-h-0 flex-1 flex flex-col overflow-hidden">

          <section class="byop-sidebar-section byop-sidebar-section--widgets" aria-labelledby="sidebar-widgets-heading">
            <div class="byop-sidebar-section-head">
              <h2 id="sidebar-widgets-heading" class="byop-sidebar-section-title">Saved widgets</h2>
              <Show when={showWidgetViewMore()}>
                <button type="button" class="byop-sidebar-text-action" onClick={() => setWidgetsModalOpen(true)}>
                  View all
                </button>
              </Show>
            </div>
            <div class="byop-sidebar-section-content byop-sidebar-section-content--inset">
              <SavedWidgetsPanel
                compact
                maxItems={WIDGET_SIDEBAR_PREVIEW_COUNT}
                onRunPrompt={(prompt) => props.onRunWidgetPrompt(prompt)}
              />
            </div>
          </section>

          <section class="byop-sidebar-section byop-sidebar-section--chats flex min-h-0 flex-1 flex-col" aria-labelledby="sidebar-chats-heading">
            <div class="byop-sidebar-section-head">
              <h2 id="sidebar-chats-heading" class="byop-sidebar-section-title">Recent</h2>
              <span class="byop-sidebar-badge" aria-label={`${conversations().length} conversations`}>
                {conversations().length}
              </span>
            </div>

            <div class="byop-sidebar-list min-h-0 flex-1 overflow-y-auto">

          <Show
            when={conversations().length}
            fallback={
              <p class="byop-sidebar-empty-hint px-1">
                {query() ? "No chats match your search." : "Start a new chat to see it here."}
              </p>
            }
          >

          <For each={conversations()}>

            {(conv) => (

              <div

                class={`byop-conversation group mb-1 rounded-lg px-2.5 py-2 ${

                  state.activeConversationId === conv.id ? "is-active" : ""

                }`}

              >

                <div class="flex items-start gap-1">

                  <Show

                    when={editingId() === conv.id}

                    fallback={

                      <button type="button" class="min-w-0 flex-1 text-left" onClick={() => selectConversation(conv.id)}>

                        <span class="block truncate text-sm font-medium">{conv.title}</span>

                        <span class="text-xs opacity-60">{new Date(conv.updatedAt).toLocaleDateString()}</span>

                      </button>

                    }

                  >

                    <input

                      class="byop-input w-full flex-1 text-sm"

                      value={editTitle()}

                      onInput={(e) => setEditTitle(e.currentTarget.value)}

                      onKeyDown={(e) => e.key === "Enter" && commitRename(conv.id)}

                    />

                  </Show>

                  <div class="byop-conversation-actions">

                    <button

                      type="button"

                      class="byop-icon-button byop-icon-button--sm byop-icon-button--rename byop-tooltip-host"

                      aria-label="Rename chat"

                      onClick={() => startRename(conv.id, conv.title)}

                    >

                      <IconRename />

                      <span class="byop-tooltip">Rename</span>

                    </button>

                    <button

                      type="button"

                      class="byop-icon-button byop-icon-button--sm byop-icon-button--delete byop-tooltip-host"

                      aria-label="Delete chat"

                      onClick={() => deleteConversation(conv.id)}

                    >

                      <IconDelete />

                      <span class="byop-tooltip">Delete</span>

                    </button>

                  </div>

                </div>

              </div>

            )}

          </For>

          </Show>

            </div>
          </section>

        </div>

        <footer class="byop-sidebar-footer border-t border-[var(--modus-wc-color-base-200)]">

          <Show when={props.showPluginsNav}>

            <button type="button" class="byop-plugin-hub-card" onClick={props.onOpenPlugins}>

              <span class="byop-plugin-hub-icon" aria-hidden="true">

                <IconPlugins />

              </span>

              <span class="min-w-0 flex-1 text-left">

                <strong class="block text-sm">Plugins</strong>

                <span class="block text-xs opacity-65">Connect products with FCHID</span>

              </span>

              <span class="byop-plugin-hub-chevron" aria-hidden="true">›</span>

            </button>

          </Show>

          <Show when={!props.connectedProducts.length && props.showPluginsNav}>

            <p class="mt-3 text-xs opacity-60">No plugins connected yet. Open Plugins to add your FCHID.</p>

          </Show>

        </footer>

        <WidgetsLibraryModal
          open={widgetsModalOpen()}
          onClose={() => setWidgetsModalOpen(false)}
          onRunPrompt={props.onRunWidgetPrompt}
        />

      </Show>

    </aside>

  );

}

