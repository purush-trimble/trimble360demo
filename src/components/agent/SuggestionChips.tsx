import { ModusButton } from "@/components/modus/ModusButton";

export function SuggestionChips(props: { prompts: string[]; onSelect: (prompt: string) => void }) {
  return (
    <div class="flex flex-wrap gap-2">
      {props.prompts.map((prompt) => (
        <ModusButton variant="outlined" onClick={() => props.onSelect(prompt)}>{prompt}</ModusButton>
      ))}
    </div>
  );
}
