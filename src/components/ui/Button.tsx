import type { ButtonHTMLAttributes, ReactNode } from "react";
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: "primary" | "secondary" | "white" };
export function Button({ children, variant = "primary", className = "", ...props }: Props) {
  const styles = variant === "primary" ? "button button-primary" : variant === "white" ? "button button-white" : "button button-secondary";
  return <button className={`${styles} ${className}`} {...props}>{children}</button>;
}
