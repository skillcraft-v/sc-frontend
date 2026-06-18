/** Textarea acessível: label associado, aria-invalid e erro. `mono` p/ código. pt-BR. */
import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
  id: string;
  label: string;
  error?: string;
  /** Renderiza em fonte monospace (campo de código). */
  mono?: boolean;
}

export function Textarea({ id, label, error, mono, className, ...props }: TextareaProps) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground/90">
        {label}
      </label>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`rounded-md border border-foreground/30 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/70 focus:ring-2 focus:ring-foreground/20 aria-[invalid=true]:border-red-600 ${mono ? "font-mono" : ""} ${className ?? ""}`}
        {...props}
      />
      {error ? (
        <p id={errorId} className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
