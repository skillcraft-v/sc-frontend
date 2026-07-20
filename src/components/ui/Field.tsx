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
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="rounded-control border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink focus:ring-2 focus:ring-ink/20 aria-[invalid=true]:border-rejected-fg"
        {...inputProps}
      />
      {error ? (
        <p id={errorId} className="text-sm text-rejected-fg">
          {error}
        </p>
      ) : null}
    </div>
  );
}
