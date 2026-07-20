/** Checkbox acessível: input + label associado (clicável). pt-BR. */
import type { InputHTMLAttributes } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type"> {
  id: string;
  label: string;
}

export function Checkbox({ id, label, ...props }: CheckboxProps) {
  return (
    <div className="flex items-center gap-2">
      <input id={id} type="checkbox" className="h-4 w-4 accent-ink" {...props} />
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
    </div>
  );
}
