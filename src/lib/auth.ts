import { createSignal } from "solid-js";
import { demoUsers, setActiveUser } from "@/lib/currentUser";
import { clearChatHistory } from "@/lib/mockStore";

const LOCAL_KEY = "trimble360-auth";
const SESSION_KEY = "trimble360-auth-session";

function readStored(): boolean {
  try {
    const storedId = localStorage.getItem(LOCAL_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    if (!storedId || !demoUsers.some((user) => user.id === storedId)) return false;
    setActiveUser(storedId);
    return true;
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
  const user = demoUsers.find((candidate) => candidate.email.toLowerCase() === normalized && candidate.password === password);
  if (!user) {
    return { ok: false, message: "Email or password is incorrect." };
  }
  setActiveUser(user.id);
  try {
    if (remember) {
      localStorage.setItem(LOCAL_KEY, user.id);
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, user.id);
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
  clearChatHistory();
  setAuthenticated(false);
}
