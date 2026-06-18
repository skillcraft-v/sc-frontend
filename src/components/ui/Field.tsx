/**
 * Campo de formulário acessível: label associado, aria-invalid e mensagem de erro
 * ligada via aria-describedby. Texto em pt-BR. Sem regra de negócio.
 */
import type { InputHTMLAttributes } from "react";

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  id: string;
  label: string;
  error?: string;
}

export function Field({ id, label, error, ...inputProps }: FieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground/90">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="rounded-md border border-foreground/30 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/70 focus:ring-2 focus:ring-foreground/20 aria-[invalid=true]:border-red-600"
        {...inputProps}
      />
      {error ? (
        <p id={errorId} className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
