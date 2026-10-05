export function textFromInputChange(event: CustomEvent): string {
  const host = event.currentTarget as { value?: string } | null;
  if (typeof host?.value === "string") return host.value;
  const detail = event.detail as { target?: { value?: string }; value?: string } | string | undefined;
  if (typeof detail === "string") return detail;
  if (typeof detail?.value === "string") return detail.value;
  if (typeof detail?.target?.value === "string") return detail.target.value;
  return "";
}

export function checkedFromInputChange(event: CustomEvent): boolean {
  const host = event.currentTarget as { value?: boolean } | null;
  if (typeof host?.value === "boolean") return host.value;
  const detail = event.detail as { target?: { checked?: boolean; value?: boolean } } | undefined;
  if (typeof detail?.target?.checked === "boolean") return detail.target.checked;
  if (typeof detail?.target?.value === "boolean") return detail.target.value;
  return false;
}
