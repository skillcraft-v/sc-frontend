/** Botão com estado de carregamento (desabilita + aria-busy). Texto em pt-BR. */
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  pending?: boolean;
  pendingLabel?: string;
}

export function Button({ pending, pendingLabel, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
      {...props}
    >
      {pending ? (pendingLabel ?? "Enviando…") : children}
    </button>
  );
}
