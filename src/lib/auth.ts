import { createSignal } from "solid-js";
import { currentUser, demoCredentials } from "@/lib/currentUser";

const LOCAL_KEY = "trimble360-auth";
const SESSION_KEY = "trimble360-auth-session";

function readStored(): boolean {
  try {
    return localStorage.getItem(LOCAL_KEY) === currentUser.id || sessionStorage.getItem(SESSION_KEY) === currentUser.id;
  } catch {
    return false;
  }
}

const [isAuthenticated, setAuthenticated] = createSignal(readStored());

export { isAuthenticated };

export type SignInResult = { ok: true } | { ok: false; message: string };

export function signIn(email: string, password: string, remember: boolean): SignInResult {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !password) {
    return { ok: false, message: "Enter your email and password." };
  }
  if (normalized !== demoCredentials.email.toLowerCase() || password !== demoCredentials.password) {
    return { ok: false, message: "Email or password is incorrect." };
  }
  try {
    if (remember) {
      localStorage.setItem(LOCAL_KEY, currentUser.id);
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, currentUser.id);
      localStorage.removeItem(LOCAL_KEY);
    }
  } catch {
    // Demo session still works in-memory if storage is unavailable.
  }
  setAuthenticated(true);
  return { ok: true };
}

export function signOut() {
  try {
    localStorage.removeItem(LOCAL_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore storage failures on sign-out.
  }
  setAuthenticated(false);
}
