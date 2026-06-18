/** Banner de erro acessível (role="alert" — anunciado por leitores de tela). pt-BR. */
import type { ReactNode } from "react";

export function Alert({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-md border border-red-600/40 bg-red-600/10 px-3 py-2 text-sm text-red-700 dark:text-red-400"
    >
      {children}
    </p>
  );
}
