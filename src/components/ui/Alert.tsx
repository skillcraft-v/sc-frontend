/** Banner de erro acessível (role="alert" — anunciado por leitores de tela). pt-BR. */
import type { ReactNode } from "react";

export function Alert({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-md border border-rejected-line bg-rejected-tint px-3 py-2 text-sm text-rejected-fg"
    >
      {children}
    </p>
  );
}
