import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "floating-action";

type BaseProps = {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  href?: string;
  title?: string;
  ariaLabel?: string;
};

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement>;

function buttonClassName(variant: ButtonVariant, className?: string) {
  return ["ui-button", `ui-button--${variant}`, className].filter(Boolean).join(" ");
}

export default function Button({ children, className, variant = "primary", href, title, ariaLabel, ...props }: ButtonProps) {
  const classes = buttonClassName(variant, className);

  if (href) {
    return (
      <Link href={href} className={classes} title={title} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} title={title} aria-label={ariaLabel} {...props}>
      {children}
    </button>
  );
}
