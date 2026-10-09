import { createSignal } from "solid-js";
import { ModusButton } from "@/components/modus/ModusButton";
import { ConnectPluginCard } from "@/components/plugins/ConnectPluginCard";
import { createDesign, getEntitlements } from "@/lib/mockStore";
import { currentUser } from "@/lib/currentUser";

export function CreateDesignCard(props: { onCreated: () => void }) {
  const [name, setName] = createSignal("North Ridge imported design");
  const [fileIds, setFileIds] = createSignal<string[]>([]);
  const [showConnect, setShowConnect] = createSignal(false);
  const [creating, setCreating] = createSignal(false);
  const hasConnect = () => getEntitlements().some((item) => item.userId === currentUser.id && item.pluginId === "connect" && item.active);

  async function create() {
    if (!fileIds().length) return;
    setCreating(true);
    createDesign({ projectId: "wm-project-01", name: name(), sourceFileIds: fileIds() });
    setCreating(false);
    props.onCreated();
  }

  return (
    <modus-wc-card class="block">
      <div class="p-5">
        <p class="text-xs uppercase tracking-wider text-slate-500">WorksManager action</p>
        <h3 class="mb-4 text-lg font-semibold">Create a new design</h3>
        <label class="mb-1 block text-sm font-medium" for="design-name">Design name</label>
        <input
          id="design-name"
          class="w-full rounded border border-slate-300 px-3 py-2"
          value={name()}
          onInput={(event) => setName(event.currentTarget.value)}
        />
        <div class="mt-4 flex items-center justify-between">
          <span class="text-sm text-slate-600">
            {fileIds().length ? `${fileIds().length} project file(s) selected` : "No project files selected"}
          </span>
          <ModusButton variant="outlined" onClick={() => setShowConnect((value) => !value)}>
            {showConnect() ? "Hide project files" : "Choose project files"}
          </ModusButton>
        </div>
        {showConnect() && (
          <div class="mt-4">
            <ConnectPluginCard
              pickerOnly
              showProductName={hasConnect()}
              onFilesSelected={(ids) => {
                setFileIds(ids);
                setShowConnect(false);
              }}
            />
          </div>
        )}
        <div class="mt-5 flex justify-end">
          <ModusButton disabled={!fileIds().length || creating()} onClick={create}>
            {creating() ? "Creating..." : "Create design"}
          </ModusButton>
        </div>
      </div>
    </modus-wc-card>
  );
}
