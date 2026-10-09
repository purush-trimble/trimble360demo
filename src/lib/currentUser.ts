import { createSignal } from "solid-js";

export type DemoUser = {
  id: string;
  name: string;
  initials: string;
  email: string;
  password: string;
};

export const demoUsers: DemoUser[] = [
  { id: "demo1", name: "Demo User 1", initials: "D1", email: "demo1@trimble.com", password: "demo" },
  { id: "demo2", name: "Demo User 2", initials: "D2", email: "demo2@trimble.com", password: "demo" },
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
};
