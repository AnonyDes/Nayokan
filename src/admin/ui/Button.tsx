import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "accent" | "ghost" | "soft" | "danger";
type Size = "sm" | "default" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
}

// Ports ax-btn from Designs/admin/design-system.html § 03. `as="a"` isn't
// offered here — use a plain <a className={buttonClassName(...)}> for links
// styled as buttons (see Sidebar/Topbar), keeping this component to real buttons.
export function buttonClassName(variant: Variant = "primary", size: Size = "default", className?: string): string {
  const sizeClass = size === "sm" ? " ax-btn--sm" : size === "lg" ? " ax-btn--lg" : "";
  return `ax-btn ax-btn--${variant}${sizeClass}${className ? ` ${className}` : ""}`;
}

export function Button({ variant = "primary", size = "default", icon, className, children, ...rest }: ButtonProps) {
  return (
    <button className={buttonClassName(variant, size, className)} {...rest}>
      {children}
      {icon}
    </button>
  );
}
