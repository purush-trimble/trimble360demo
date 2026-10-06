import { createEffect, createMemo, createSignal, For } from "solid-js";
import { AgentUIRenderer } from "@/components/agent/AgentUIRenderer";
import { currentUser } from "@/lib/currentUser";
import { getActiveMessages, sendMessage, state } from "@/lib/mockStore";
import type { PluginId } from "@/lib/types";

export function ChatWindow(props: { mountedPlugins: PluginId[]; onCreated: () => void; onSend?: (text: string) => void }) {
  const [text, setText] = createSignal("");
  let feed: HTMLDivElement | undefined;

  const messages = createMemo(() => getActiveMessages());

  createEffect(() => {
    const count = messages().length;
    const convId = state.activeConversationId;
    if (!feed || count === 0) return;
    void convId;
    feed.scrollTo({ top: feed.scrollHeight, behavior: "smooth" });
  });

  function send(value = text()) {
    const trimmed = value.trim();
    if (!trimmed) return;
    setText("");
    sendMessage(trimmed, props.mountedPlugins);
    props.onSend?.(trimmed);
  }

  return (
    <section class="byop-chat flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--modus-wc-color-base-200)] bg-[var(--modus-wc-color-base-page)] shadow-sm">
      <div class="byop-chat-header border-b border-[var(--modus-wc-color-base-200)] px-6 py-5">
        <p class="text-xs font-bold uppercase tracking-wider text-[var(--modus-wc-color-primary)]">Agent workspace</p>
        <div class="mt-1 flex items-center justify-between gap-3">
          <h1 class="text-xl font-semibold tracking-tight">What would you like to build?</h1>
          <span class="hidden rounded-full border border-[var(--modus-wc-color-base-300)] px-3 py-1 text-xs font-semibold opacity-70 sm:inline">
            AI guided
          </span>
        </div>
        <p class="text-sm opacity-70">Licensed Trimble products appear as interactive cards in chat.</p>
      </div>
      <div ref={feed} class="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
        {!messages().length && (
          <div class="flex items-start gap-3">
            <modus-wc-avatar initials="AI" />
            <div class="byop-empty-state max-w-xl p-5 text-sm">
              <p class="mb-1 font-semibold">Start with an outcome</p>
              <p class="mb-3 opacity-75">Add licensed products from the sidebar, then try:</p>
              <button type="button" class="byop-link font-semibold" onClick={() => send("Publish a Connect design to WorksManager")}>
                &quot;Publish a Connect design to WorksManager&quot;
              </button>
              .
            </div>
          </div>
        )}
        <For each={messages()}>
          {(message) => (
            <div class={`flex items-start gap-3 ${message.role === "user" ? "justify-end" : ""}`}>
              {message.role === "assistant" && <modus-wc-avatar initials="AI" />}
              {message.role === "user" ? (
                <div class="max-w-[75%] rounded-xl bg-[var(--modus-wc-color-primary)] px-4 py-3 text-sm text-[var(--modus-wc-color-primary-content)]">
                  {message.text}
                </div>
              ) : (
                <div class="w-full max-w-2xl">
                  <div class="byop-message-card">
                    <p class="mb-2 text-sm">{message.text}</p>
                  {message.uiAction && (
                    <AgentUIRenderer action={message.uiAction} onPrompt={send} onCreated={props.onCreated} />
                  )}
                  </div>
                </div>
              )}
              {message.role === "user" && <modus-wc-avatar initials={currentUser.initials} />}
            </div>
          )}
        </For>
      </div>
      <div class="byop-composer-wrap border-t border-[var(--modus-wc-color-base-200)] p-4">
        <div class="byop-gemini-composer">
          <button type="button" class="byop-composer-icon" aria-label="Add attachment" title="Add attachment">+</button>
          <input
            class="byop-composer-input"
            aria-label="Message"
            value={text()}
            onInput={(event) => setText(event.currentTarget.value)}
            onKeyDown={(event) => event.key === "Enter" && send()}
          />
          <button type="button" class="byop-send-button" aria-label="Send message" title="Send message" onClick={() => send()}>
            ↑
          </button>
        </div>
      </div>
    </section>
  );
}
