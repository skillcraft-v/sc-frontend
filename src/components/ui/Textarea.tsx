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
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`rounded-control border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink focus:ring-2 focus:ring-ink/20 aria-[invalid=true]:border-rejected-fg ${mono ? "font-mono" : ""} ${className ?? ""}`}
        {...props}
      />
      {error ? (
        <p id={errorId} className="text-sm text-rejected-fg">
          {error}
        </p>
      ) : null}
    </div>
  );
}
