import { createSignal, Show } from "solid-js";
import { signIn } from "@/lib/auth";
import { demoCredentials } from "@/lib/currentUser";
import { checkedFromInputChange, textFromInputChange } from "@/lib/modusEvents";

export function LoginPage() {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [remember, setRemember] = createSignal(true);
  const [error, setError] = createSignal("");
  const [hint, setHint] = createSignal("");

  function submit(event?: Event) {
    event?.preventDefault();
    setHint("");
    const result = signIn(email(), password(), remember());
    if (!result.ok) setError(result.message);
  }

  function fillDemoAccount() {
    setEmail(demoCredentials.email);
    setPassword(demoCredentials.password);
    setError("");
    setHint("Demo account filled. Sign in to open the workspace.");
  }

  return (
    <div class="grid min-h-screen lg:grid-cols-[minmax(0,1.05fr)_minmax(28rem,1fr)]">
      <section class="relative hidden overflow-hidden bg-[#0063a3] px-12 py-16 text-white lg:flex lg:flex-col lg:justify-between">
        <div class="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10" />
        <div class="pointer-events-none absolute -bottom-16 -left-10 h-64 w-64 rounded-full bg-black/10" />
        <div class="relative">
          <p class="text-sm font-semibold tracking-wide text-white/80">Trimble Identity</p>
          <h1 class="mt-6 max-w-lg text-4xl font-bold leading-tight">Build Your Own Product</h1>
          <p class="mt-4 max-w-md text-lg text-white/85">
            Sign in to compose licensed Trimble product workflows through chat.
          </p>
        </div>
        <ul class="relative space-y-3 text-sm text-white/90">
          <li>Launch Trimble Connect and WorksManager in one workspace.</li>
          <li>Ask the assistant to create designs and browse project files.</li>
          <li>Toggle mock subscriptions while you demo the flow.</li>
        </ul>
      </section>

      <section class="flex items-center justify-center bg-slate-50 px-5 py-10 sm:px-8">
        <div class="w-full max-w-md">
          <div class="mb-8 lg:hidden">
            <p class="text-sm font-semibold text-blue-700">Trimble Identity</p>
            <h1 class="mt-1 text-3xl font-bold text-slate-900">Build Your Own Product</h1>
          </div>
          <modus-wc-logo name="trimble" alt="Trimble" custom-class="login-trimble-logo" />
          <modus-wc-card bordered padding="comfortable" class="login-card mt-6 w-full">
            <span slot="title">Sign in</span>
            <span slot="subtitle">Use your Trimble ID for this demo workspace.</span>
            <form class="flex flex-col gap-4" onSubmit={submit}>
              <Show when={error()}>
                <modus-wc-alert variant="error" alert-title={error()} role="alert" />
              </Show>
              <Show when={hint()}>
                <modus-wc-alert variant="info" alert-title={hint()} role="status" />
              </Show>
              <modus-wc-text-input
                label="Email"
                type="email"
                name="email"
                placeholder="name@trimble.com"
                required
                autocomplete="username"
                value={email()}
                on:inputChange={(event: CustomEvent) => {
                  setEmail(textFromInputChange(event));
                  setError("");
                }}
              />
              <modus-wc-text-input
                label="Password"
                type="password"
                name="password"
                required
                autocomplete="current-password"
                value={password()}
                on:inputChange={(event: CustomEvent) => {
                  setPassword(textFromInputChange(event));
                  setError("");
                }}
              />
              <div class="flex items-center justify-between gap-3">
                <modus-wc-checkbox
                  label="Remember me"
                  name="remember"
                  value={remember()}
                  on:inputChange={(event: CustomEvent) => setRemember(checkedFromInputChange(event))}
                />
                <button
                  type="button"
                  class="text-sm font-medium text-blue-700 hover:underline"
                  onClick={() => {
                    setError("");
                    setHint(`This is a mock sign-in. Use ${demoCredentials.email} / ${demoCredentials.password}.`);
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <modus-wc-button type="submit" color="primary" variant="filled" full-width={true} on:buttonClick={() => submit()}>
                Sign in
              </modus-wc-button>
              <modus-wc-button type="button" color="neutral" variant="outlined" full-width={true} on:buttonClick={fillDemoAccount}>
                Fill demo account
              </modus-wc-button>
            </form>
            <p slot="footer" class="text-sm text-slate-500">
              Demo login: {demoCredentials.email} / {demoCredentials.password}
            </p>
          </modus-wc-card>
        </div>
      </section>
    </div>
  );
}
