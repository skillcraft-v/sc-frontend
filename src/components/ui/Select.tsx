/** Select acessível: label associado, aria-invalid e mensagem de erro. pt-BR. */
import type { SelectHTMLAttributes } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> {
  id: string;
  label: string;
  options: readonly Option[];
  error?: string;
  /** Texto da opção vazia (ex.: "Todas"); ausente = sem opção vazia. */
  placeholder?: string;
}

export function Select({ id, label, options, error, placeholder, ...selectProps }: SelectProps) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground/90">
        {label}
      </label>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="rounded-md border border-foreground/30 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/70 focus:ring-2 focus:ring-foreground/20 aria-[invalid=true]:border-red-600"
        {...selectProps}
      >
        {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={errorId} className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
