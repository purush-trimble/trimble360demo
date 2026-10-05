import { splitProps, type JSX } from "solid-js";

type Props = {
  variant?: "filled" | "outlined" | "text";
  disabled?: boolean;
  onClick?: () => void;
  children?: JSX.Element;
  class?: string;
};

export function ModusButton(props: Props) {
  const [local, rest] = splitProps(props, ["onClick", "children", "disabled"]);
  return (
    <modus-wc-button
      {...rest}
      disabled={local.disabled || undefined}
      on:buttonClick={() => local.onClick?.()}
    >
      {local.children}
    </modus-wc-button>
  );
}
