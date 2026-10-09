import { createSignal, onMount } from "solid-js";
import { ModusButton } from "@/components/modus/ModusButton";
import { getConnectFiles } from "@/lib/mockStore";
import type { ConnectFile } from "@/lib/types";

export function ConnectPluginCard(props: {
  onFilesSelected?: (ids: string[], files?: ConnectFile[]) => void;
  pickerOnly?: boolean;
  showProductName?: boolean;
  extensionFilter?: string;
}) {
  const [files, setFiles] = createSignal<ConnectFile[]>([]);
  const [selected, setSelected] = createSignal<string[]>([]);

  onMount(() => setFiles(getConnectFiles("connect-demo").filter((file) => !props.extensionFilter || file.extension === props.extensionFilter)));

  const toggle = (id: string) =>
    setSelected((items) => (items.includes(id) ? items.filter((item) => item !== id) : [...items, id]));

  return (
    <modus-wc-card class="block">
      <div class="p-5">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-wider text-slate-500">{props.showProductName === false ? "WorksManager" : "Trimble Connect"}</p>
            <h3 class="text-lg font-semibold">Project files</h3>
          </div>
          <span class="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">Connected</span>
        </div>
        <div class="divide-y divide-slate-200 rounded-lg border border-slate-200">
          {files().map((file) => (
            <label class="flex cursor-pointer items-center gap-3 p-3 hover:bg-slate-50">
              <input type="checkbox" checked={selected().includes(file.id)} onChange={() => toggle(file.id)} />
              <span class="flex-1">
                <strong class="block text-sm">{file.name}</strong>
                <span class="text-xs text-slate-500">{file.size} · Updated {file.updatedAt}</span>
              </span>
              <span class="rounded bg-slate-100 px-2 py-1 text-xs font-bold uppercase text-slate-600">{file.extension}</span>
            </label>
          ))}
        </div>
        <div class="mt-4 flex justify-end">
          <ModusButton disabled={!selected().length} onClick={() => props.onFilesSelected?.(selected(), files())}>
            {props.pickerOnly ? "Use selected files" : "Import to WorksManager"}
          </ModusButton>
        </div>
      </div>
    </modus-wc-card>
  );
}
