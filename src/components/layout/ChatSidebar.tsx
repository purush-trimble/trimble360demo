import { createSignal, For, Show } from "solid-js";

import { SavedWidgetsPanel } from "@/components/layout/SavedWidgetsPanel";

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

function IconNewChat() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconCollapseSidebar() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.25" />
      <path d="M10 4.5v15" />
      <path d="m14.5 10.25-2.75 1.75 2.75 1.75" />
    </svg>
  );
}

function IconExpandSidebar() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.25" />
      <path d="M10 4.5v15" />
      <path d="m9.5 10.25 2.75 1.75-2.75 1.75" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="5.5" />
      <path d="M20 20 16.2 16.2" />
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

  const [chatQuery, setChatQuery] = createSignal("");
  const [dashboardQuery, setDashboardQuery] = createSignal("");
  const [activeTab, setActiveTab] = createSignal<"chats" | "dashboard">("chats");

  const [editingId, setEditingId] = createSignal<string | null>(null);

  const [editTitle, setEditTitle] = createSignal("");



  const conversations = () => (chatQuery() ? searchConversations(chatQuery()) : listConversations());



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

            <button type="button" class="byop-collapsed-action byop-collapsed-action--primary" aria-label="Open sidebar" title="Open sidebar" onClick={props.onToggleOpen}>
              <IconExpandSidebar />
            </button>

            <button type="button" class="byop-collapsed-action" aria-label="New chat" title="New chat" onClick={() => createConversation()}>
              <IconNewChat />
            </button>

            <button type="button" class="byop-collapsed-action" aria-label="Search chats" title="Search chats" onClick={props.onToggleOpen}>
              <IconSearch />
            </button>

            <div class="flex-1" />

            <span class="byop-collapsed-mark" aria-hidden="true">BY</span>

          </div>

        }

      >

        <div class="byop-sidebar-top">
          <div class="byop-sidebar-tabs" role="tablist" aria-label="Sidebar content">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab() === "chats"}
              classList={{ "is-active": activeTab() === "chats" }}
              onClick={() => setActiveTab("chats")}
            >
              Chats
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab() === "dashboard"}
              classList={{ "is-active": activeTab() === "dashboard" }}
              onClick={() => setActiveTab("dashboard")}
            >
              Dashboard
            </button>
          </div>
          <div class="byop-sidebar-top-actions">
            <button
              type="button"
              class="byop-sidebar-collapse byop-tooltip-host"
              aria-label="Collapse sidebar"
              onClick={props.onToggleOpen}
            >
              <IconCollapseSidebar />
              <span class="byop-tooltip">Collapse panel</span>
            </button>
          </div>
        </div>
        <div class="byop-sidebar-tab-tools">
          <Show
            when={activeTab() === "chats"}
            fallback={
              <label class="byop-search">
                <span class="byop-search-icon" aria-hidden="true"><IconSearch /></span>
                <input
                  class="byop-input"
                  aria-label="Search dashboard widgets"
                  placeholder="Search dashboard"
                  value={dashboardQuery()}
                  onInput={(e) => setDashboardQuery(e.currentTarget.value)}
                />
                <Show when={dashboardQuery()}>
                  <button type="button" class="byop-search-clear" aria-label="Clear dashboard search" onClick={() => setDashboardQuery("")}>×</button>
                </Show>
              </label>
            }
          >
            <label class="byop-search">
              <span class="byop-search-icon" aria-hidden="true"><IconSearch /></span>
              <input
                class="byop-input"
                aria-label="Search chats"
                placeholder="Search chats"
                value={chatQuery()}
                onInput={(e) => setChatQuery(e.currentTarget.value)}
              />
              <Show when={chatQuery()}>
                <button type="button" class="byop-search-clear" aria-label="Clear chat search" onClick={() => setChatQuery("")}>×</button>
              </Show>
            </label>
          </Show>
        </div>
        <div class="byop-sidebar-body min-h-0 flex-1 flex flex-col overflow-hidden">
          <Show
            when={activeTab() === "chats"}
            fallback={
              <section class="byop-sidebar-section byop-sidebar-section--dashboard flex min-h-0 flex-1 flex-col" aria-label="Dashboard widgets">
                <SavedWidgetsPanel
                  embedded
                  searchQuery={dashboardQuery()}
                  onRunPrompt={(prompt) => props.onRunWidgetPrompt(prompt)}
                />
              </section>
            }
          >

          <section class="byop-sidebar-section byop-sidebar-section--chats flex min-h-0 flex-1 flex-col" aria-labelledby="sidebar-chats-heading">
            <div class="byop-sidebar-section-head">
              <h2 id="sidebar-chats-heading" class="byop-sidebar-section-title">Recent</h2>
              <div class="byop-sidebar-section-actions">
                <span class="byop-sidebar-badge" aria-label={`${conversations().length} conversations`}>
                  {conversations().length}
                </span>
                <button type="button" class="byop-new-chat-icon" aria-label="New chat" title="New chat" onClick={() => createConversation()}>
                  <IconNewChat />
                </button>
              </div>
            </div>

            <div class="byop-sidebar-list min-h-0 flex-1 overflow-y-auto">

          <Show
            when={conversations().length}
            fallback={
              <p class="byop-sidebar-empty-hint px-1">
                {chatQuery() ? "No chats match your search." : "Start a new chat to see it here."}
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
          </Show>

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

      </Show>

    </aside>

  );

}

