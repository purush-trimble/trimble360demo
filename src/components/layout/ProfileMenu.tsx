import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { ThemeSettings } from "@/components/layout/ThemeSettings";
import { signOut } from "@/lib/auth";
import { currentUser } from "@/lib/currentUser";

export function ProfileMenu() {
  const [open, setOpen] = createSignal(false);
  let root: HTMLDivElement | undefined;

  onMount(() => {
    const onDoc = (event: MouseEvent) => {
      if (!root?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    onCleanup(() => document.removeEventListener("mousedown", onDoc));
  });

  return (
    <div class="byop-profile-menu" ref={root}>
      <button
        type="button"
        class="byop-profile-trigger"
        aria-expanded={open()}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span class="text-sm font-medium">{currentUser.name}</span>
        <modus-wc-avatar initials={currentUser.initials} />
      </button>
      <Show when={open()}>
        <div class="byop-profile-dropdown byop-dropdown-enter" role="menu">
          <p class="byop-profile-dropdown-title">Settings</p>
          <div class="byop-profile-dropdown-row">
            <span>Theme</span>
            <ThemeSettings />
          </div>
          <button type="button" class="byop-profile-menu-item" role="menuitem" onClick={() => { setOpen(false); signOut(); }}>
            Sign out
          </button>
        </div>
      </Show>
    </div>
  );
}
