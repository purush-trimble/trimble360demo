import type { Accessor } from "solid-js";
import { createEffect, createMemo, createSignal, Index, Show } from "solid-js";
import { AgentUIRenderer } from "@/components/agent/AgentUIRenderer";
import { SuggestionChips } from "@/components/agent/SuggestionChips";
import { currentUser } from "@/lib/currentUser";
import { completeProjectSelection, sendMessage, state } from "@/lib/mockStore";
import type { ChatMessage } from "@/lib/agent/types";
function activeMessageIds() {
  const conv = state.conversations.find((c) => c.id === state.activeConversationId);
  return conv?.messageIds ?? [];
}

function messageById(id: string): ChatMessage | undefined {
  return state.messages.find((m) => m.id === id);
}

function ChatMessageRow(props: {
  messageId: Accessor<string>;
  prompts: string[];
  onPrompt: (text: string) => void;
  onCreated: () => void;
}) {
  const message = () => messageById(props.messageId());
  return (
    <Show when={message()}>
      {(msg) => (
        <div class={`flex items-start gap-3 ${msg().role === "user" ? "justify-end" : ""}`}>
          {msg().role === "assistant" && <modus-wc-avatar initials="AI" />}
          {msg().role === "user" ? (
            <div class="max-w-[75%] rounded-xl bg-[var(--modus-wc-color-primary)] px-4 py-3 text-sm text-[var(--modus-wc-color-primary-content)]">
              {msg().text}
            </div>
          ) : (
            <div class="w-full max-w-2xl">
              <div class="byop-message-card">
                <p class="mb-2 text-sm">{msg().text}</p>
                <Show when={msg().uiAction} keyed>
                  {(action) => (
                    <AgentUIRenderer
                      action={action}
                      onPrompt={props.onPrompt}
                      onCreated={props.onCreated}
                      onProjectSelected={completeProjectSelection}
                    />
                  )}
                </Show>
                <Show when={!msg().uiAction && props.prompts.length}>
                  <SuggestionChips prompts={props.prompts} onSelect={props.onPrompt} />
                </Show>
              </div>
            </div>
          )}
          {msg().role === "user" && <modus-wc-avatar initials={currentUser.initials} />}
        </div>
      )}
    </Show>
  );
}

export function ChatWindow(props: {
  suggestedPrompts?: string[];
  onCreated: () => void;
  onSend?: (text: string) => void;
}) {
  const [text, setText] = createSignal("");
  let feed: HTMLDivElement | undefined;
  let inputEl: HTMLInputElement | undefined;

  const messageIds = createMemo(activeMessageIds);
  const prompts = createMemo(() => props.suggestedPrompts?.filter(Boolean) ?? []);
  const hasText = () => text().trim().length > 0;

  createEffect(() => {
    const ids = messageIds();
    const convId = state.activeConversationId;
    if (!feed || ids.length === 0) return;
    void convId;
    const last = messageById(ids[ids.length - 1]!);
    void last?.text;
    void last?.uiAction?.type;
    feed.scrollTo({ top: feed.scrollHeight, behavior: "smooth" });
  });

  function send(value = text()) {
    const trimmed = value.trim();
    if (!trimmed) return;
    setText("");
    sendMessage(trimmed);
    props.onSend?.(trimmed);
  }

  return (
    <section class="byop-chat flex min-h-0 flex-1 flex-col rounded-2xl border border-[var(--modus-wc-color-base-200)] bg-[var(--modus-wc-color-base-page)] shadow-sm">
      <div class="byop-chat-header border-b border-[var(--modus-wc-color-base-200)] px-6 py-5">
        <p class="text-xs font-bold uppercase tracking-wider text-[var(--modus-wc-color-primary)]">Agent workspace</p>
        <div class="mt-1 flex items-center justify-between gap-3">
          <h1 class="text-xl font-semibold tracking-tight">Ask for what you need on this job</h1>
          <span class="hidden rounded-full border border-[var(--modus-wc-color-base-300)] px-3 py-1 text-xs font-semibold opacity-70 sm:inline">
            AI guided
          </span>
        </div>
        <p class="text-sm opacity-70">Ask for files, designs, estimates, or bids across your connected products.</p>
      </div>
      <div ref={feed} class="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
        {!messageIds().length && (
          <div class="flex items-start gap-3">
            <modus-wc-avatar initials="AI" />
            <div class="byop-empty-state max-w-xl p-5 text-sm">
              <p class="mb-1 font-semibold">Tap a quick action or type below</p>
              <Show
                when={prompts().length}
                fallback={
                  <p class="opacity-75">
                    Ask for files, designs, estimates, or bids.
                  </p>
                }
              >
                <p class="mb-3 opacity-75">Try one of these quick actions:</p>
                <SuggestionChips prompts={prompts()} onSelect={send} />
              </Show>
            </div>
          </div>
        )}
        <Index each={messageIds()}>
          {(messageId) => (
            <ChatMessageRow messageId={messageId} prompts={prompts()} onPrompt={send} onCreated={props.onCreated} />
          )}
        </Index>
      </div>
      <div class="byop-composer-wrap border-t border-[var(--modus-wc-color-base-200)]">
        <div class="byop-composer-glow-host">
          <div
            class="byop-gemini-composer"
            onClick={(event) => {
              const target = event.target as HTMLElement;
              if (target.closest(".byop-composer-icon, .byop-send-button")) return;
              inputEl?.focus();
            }}
          >
            <button type="button" class="byop-composer-icon" aria-label="Add attachment" title="Add attachment">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            <input
              ref={inputEl}
              class="byop-composer-input"
              aria-label="Message"
              placeholder="Ask for files, designs, estimates…"
              value={text()}
              onInput={(event) => setText(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") send();
              }}
            />
            <button
              type="button"
              class="byop-send-button"
              aria-label="Send message"
              title={hasText() ? "Send message" : "Type a message to send"}
              disabled={!hasText()}
              onClick={() => send()}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m4 4 16 8-16 8 3.5-8L4 4Zm3.5 8H20" />
              </svg>
            </button>
          </div>
        </div>
        <p class="byop-composer-hint">Press Enter to send</p>
      </div>
    </section>
  );
}
