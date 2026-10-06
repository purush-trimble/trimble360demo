import { createSignal, For, Show } from "solid-js";
import { ModusButton } from "@/components/modus/ModusButton";
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

const productLabels: Record<PluginId, string> = {
  connect: "Trimble Connect",
  worksmanager: "WorksManager",
};

export function ChatSidebar(props: {
  open: boolean;
  onToggleOpen: () => void;
  mounted: PluginId[];
  onToggleProduct: (id: PluginId) => void;
  licensedProducts: PluginId[];
}) {
  const [query, setQuery] = createSignal("");
  const [editingId, setEditingId] = createSignal<string | null>(null);
  const [editTitle, setEditTitle] = createSignal("");

  const conversations = () => (query() ? searchConversations(query()) : listConversations());

  function startRename(id: string, title: string) {
    setEditingId(id);
    setEditTitle(title);
  }

  function commitRename(id: string) {
    renameConversation(id, editTitle());
    setEditingId(null);
  }

  return (
    <aside class="byop-sidebar flex h-full min-h-0 flex-col border-r border-[var(--modus-wc-color-base-200)] bg-[var(--modus-wc-color-base-100)]">
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
        <div class="byop-sidebar-header border-b border-[var(--modus-wc-color-base-200)] p-4">
          <div class="byop-sidebar-actions">
            <ModusButton class="byop-new-chat" onClick={() => createConversation()}>
              <span class="byop-plus-icon">+</span>
              New chat
            </ModusButton>
            <button type="button" class="byop-icon-button" aria-label="Close chat menu" title="Close chat menu" onClick={props.onToggleOpen}>
              ×
            </button>
          </div>
          <label class="byop-search mt-3">
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
        <div class="min-h-0 flex-1 overflow-y-auto p-2">
          <div class="mb-2 flex items-center justify-between px-2">
            <p class="text-xs font-semibold opacity-60">Recent</p>
            <span class="text-xs opacity-50">{conversations().length}</span>
          </div>
          <For each={conversations()}>
            {(conv) => (
              <div
                class={`group mb-1 rounded-lg px-2 py-2 ${
                  state.activeConversationId === conv.id ? "bg-[var(--modus-wc-color-base-200)]" : "hover:bg-[var(--modus-wc-color-base-200)]"
                }`}
              >
                <Show
                  when={editingId() === conv.id}
                  fallback={
                    <button type="button" class="w-full text-left" onClick={() => selectConversation(conv.id)}>
                      <span class="block truncate text-sm font-medium">{conv.title}</span>
                      <span class="text-xs opacity-60">{new Date(conv.updatedAt).toLocaleDateString()}</span>
                    </button>
                  }
                >
                  <input
                    class="byop-input w-full text-sm"
                    value={editTitle()}
                    onInput={(e) => setEditTitle(e.currentTarget.value)}
                    onKeyDown={(e) => e.key === "Enter" && commitRename(conv.id)}
                  />
                </Show>
                <div class="mt-1 flex gap-1 opacity-0 group-hover:opacity-100">
                  <button type="button" class="byop-link text-xs" onClick={() => startRename(conv.id, conv.title)}>
                    Rename
                  </button>
                  <button type="button" class="byop-link text-xs" onClick={() => deleteConversation(conv.id)}>
                    Delete
                  </button>
                </div>
              </div>
            )}
          </For>
        </div>
        <div class="border-t border-[var(--modus-wc-color-base-200)] p-4">
          <p class="mb-2 text-xs font-semibold uppercase opacity-60">Licensed products</p>
          <div class="flex flex-col gap-2">
            <For each={props.licensedProducts}>
              {(id) => (
                <ModusButton
                  variant={props.mounted.includes(id) ? "filled" : "outlined"}
                  onClick={() => props.onToggleProduct(id)}
                >
                  {props.mounted.includes(id) ? "✓ " : "+ "}
                  {productLabels[id]}
                </ModusButton>
              )}
            </For>
          </div>
        </div>
      </Show>
    </aside>
  );
}
