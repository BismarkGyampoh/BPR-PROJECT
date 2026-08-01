import { clsx } from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Button({
  className,
  variant = "solid",
  size = "md",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}) {
  const base =
    "inline-flex items-center justify-center whitespace-nowrap rounded-full font-semibold transition-all duration-200 focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-primary/25 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    solid: "bg-primary text-white shadow-sm hover:-translate-y-0.5 hover:bg-primary-deep hover:shadow-md",
    outline: "border border-line bg-surface text-ink hover:-translate-y-0.5 hover:border-primary/40 hover:bg-surface-muted hover:text-primary-deep",
    ghost: "text-muted hover:bg-surface hover:text-ink",
  };
  const sizes = {
    sm: "h-9 px-3.5 text-xs",
    md: "h-11 px-5 text-sm",
    lg: "h-13 px-6 text-base",
  };
  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </button>
  );
}
