import { createSignal } from "solid-js";

export type DemoUser = {
  id: string;
  name: string;
  /** What this person does in the product, shown on sign-in and in the profile. */
  summary: string;
  initials: string;
  email: string;
  password: string;
  /** Chat quick actions that match this person's job. */
  prompts: string[];
};

export const demoUsers: DemoUser[] = [
  {
    id: "site-admin",
    name: "Site admin",
    summary: "Runs devices, field designs, and machine control on the job.",
    initials: "SA",
    email: "siteadmin@trimble.com",
    password: "demo",
    prompts: ["Show my devices", "Show my designs", "Create a VCL design"],
  },
  {
    id: "office-admin",
    name: "Office admin",
    summary: "Manages project files and publishes designs to the field.",
    initials: "OA",
    email: "officeadmin@trimble.com",
    password: "demo",
    prompts: ["Show my Connect files", "Create a design", "Publish a Connect design to WorksManager"],
  },
];

const [activeUserId, setActiveUserId] = createSignal(demoUsers[0].id);

export function setActiveUser(id: string) {
  if (demoUsers.some((user) => user.id === id)) setActiveUserId(id);
}

export const currentUser = {
  get id() {
    return activeUserId();
  },
  get name() {
    return demoUsers.find((user) => user.id === activeUserId())!.name;
  },
  get initials() {
    return demoUsers.find((user) => user.id === activeUserId())!.initials;
  },
  get email() {
    return demoUsers.find((user) => user.id === activeUserId())!.email;
  },
  get summary() {
    return demoUsers.find((user) => user.id === activeUserId())!.summary;
  },
  get prompts() {
    return demoUsers.find((user) => user.id === activeUserId())!.prompts;
  },
};

if (import.meta.env.DEV) {
  const names = demoUsers.map((user) => user.name);
  if (!names.includes("Site admin") || !names.includes("Office admin")) {
    console.error("demo user self-check failed");
  }
}
