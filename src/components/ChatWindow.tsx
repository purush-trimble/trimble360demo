import { createEffect, createSignal, For } from "solid-js";
import { ModusButton } from "@/components/modus/ModusButton";
import { AgentUIRenderer } from "@/components/agent/AgentUIRenderer";
import { currentUser } from "@/lib/currentUser";
import { sendMessage, state } from "@/lib/mockStore";
import type { PluginId } from "@/lib/types";

export function ChatWindow(props: { mountedPlugins: PluginId[]; onCreated: () => void }) {
  const [text, setText] = createSignal("");
  let feed: HTMLDivElement | undefined;

  createEffect(() => {
    const count = state.messages.length;
    if (!feed || count === 0) return;
    feed.scrollTo({ top: feed.scrollHeight, behavior: "smooth" });
  });

  function send(value = text()) {
    const trimmed = value.trim();
    if (!trimmed) return;
    setText("");
    sendMessage(trimmed, props.mountedPlugins);
  }

  return (
    <section class="flex min-h-[680px] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div class="border-b border-slate-200 px-6 py-4">
        <p class="text-xs font-bold uppercase tracking-wider text-blue-700">A2UI assistant</p>
        <h1 class="text-xl font-semibold">What would you like to build?</h1>
        <p class="text-sm text-slate-500">Ask a defined prompt and the assistant will render the right product UI.</p>
      </div>
      <div ref={feed} class="flex-1 space-y-5 overflow-y-auto p-6">
        {!state.messages.length && (
          <div class="flex items-start gap-3">
            <modus-wc-avatar initials="AI" />
            <div class="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
              Add a plugin, then try{" "}
              <button type="button" class="font-semibold text-blue-700" onClick={() => send("create a design")}>
                &quot;create a design&quot;
              </button>
              .
            </div>
          </div>
        )}
        <For each={state.messages}>
          {(message) => (
            <div class={`flex items-start gap-3 ${message.role === "user" ? "justify-end" : ""}`}>
              {message.role === "assistant" && <modus-wc-avatar initials="AI" />}
              {message.role === "user" ? (
                <div class="max-w-[75%] rounded-xl bg-blue-700 px-4 py-3 text-sm text-white">{message.text}</div>
              ) : (
                <div class="w-full max-w-2xl">
                  <p class="mb-2 text-sm text-slate-700">{message.text}</p>
                  {message.uiAction && (
                    <AgentUIRenderer action={message.uiAction} onPrompt={send} onCreated={props.onCreated} />
                  )}
                </div>
              )}
              {message.role === "user" && <modus-wc-avatar initials={currentUser.initials} />}
            </div>
          )}
        </For>
      </div>
      <div class="flex gap-3 border-t border-slate-200 p-4">
        <input
          class="min-w-0 flex-1 rounded border border-slate-300 px-3 py-2"
          placeholder="Try: create a design"
          value={text()}
          onInput={(event) => setText(event.currentTarget.value)}
          onKeyDown={(event) => event.key === "Enter" && send()}
        />
        <ModusButton onClick={() => send()}>Send</ModusButton>
      </div>
    </section>
  );
}
