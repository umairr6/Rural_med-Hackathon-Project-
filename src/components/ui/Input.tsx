import type { InputHTMLAttributes } from "react";
type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string };
export function Input({ label, hint, id, ...props }: Props) {
  const inputId = id ?? props.name;
  return <div className="field"><label htmlFor={inputId}>{label}{props.required ? " *" : ""}</label><input id={inputId} {...props}/>{hint && <small>{hint}</small>}</div>;
}
