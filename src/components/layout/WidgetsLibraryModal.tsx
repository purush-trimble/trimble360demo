import { Show } from "solid-js";
import { SavedWidgetsPanel } from "@/components/layout/SavedWidgetsPanel";

export function WidgetsLibraryModal(props: {
  open: boolean;
  onClose: () => void;
  onRunPrompt: (prompt: string) => void;
}) {
  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") props.onClose();
  }

  function runAndClose(prompt: string) {
    props.onRunPrompt(prompt);
    props.onClose();
  }

  return (
    <Show when={props.open}>
      <div class="byop-modal-root" role="presentation" onKeyDown={onKeyDown}>
        <button type="button" class="byop-modal-backdrop" aria-label="Close widget library" onClick={props.onClose} />
        <div class="byop-modal-panel" role="dialog" aria-modal="true" aria-labelledby="widgets-library-title">
          <div class="byop-modal-header byop-modal-header--widgets">
            <div class="min-w-0">
              <h2 id="widgets-library-title" class="text-base font-semibold">Saved widgets</h2>
              <p class="byop-modal-subtitle">Apply a saved workflow to the chat composer.</p>
            </div>
            <button type="button" class="byop-icon-button" aria-label="Close" title="Close" onClick={props.onClose}>
              ×
            </button>
          </div>
          <div class="byop-modal-body">
            <SavedWidgetsPanel embedded onRunPrompt={runAndClose} />
          </div>
        </div>
      </div>
    </Show>
  );
}
