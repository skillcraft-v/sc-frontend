"use client";

import { useState, type ReactNode } from "react";
import type { ResourceListStatus } from "@/lib/career/use-resource-list";
import { Button } from "@/components/ui/Button";

/**
 * Wrapper de uma seção de carreira: título, botão "Adicionar" (revela o form via
 * render prop), estados loading/erro/vazio e a lista (children).
 */
export function CareerSection({
  title,
  status,
  isEmpty,
  emptyLabel,
  onReload,
  renderAddForm,
  children,
}: {
  title: string;
  status: ResourceListStatus;
  isEmpty: boolean;
  emptyLabel: string;
  onReload: () => void;
  renderAddForm: (done: () => void) => ReactNode;
  children: ReactNode;
}) {
  const [adding, setAdding] = useState(false);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Button type="button" onClick={() => setAdding((v) => !v)}>
          {adding ? "Cancelar" : "Adicionar"}
        </Button>
      </div>

      {adding ? (
        <div className="rounded-md border border-foreground/15 p-4">
          {renderAddForm(() => setAdding(false))}
        </div>
      ) : null}

      {status === "loading" ? (
        <p role="status" className="text-sm text-foreground/80">
          Carregando…
        </p>
      ) : null}

      {status === "error" ? (
        <div className="flex items-center gap-3">
          <p role="alert" className="text-sm text-red-700 dark:text-red-400">
            Não foi possível carregar.
          </p>
          <button onClick={onReload} className="text-sm font-medium underline">
            Tentar novamente
          </button>
        </div>
      ) : null}

      {status === "success" && isEmpty ? (
        <p className="text-sm text-foreground/80">{emptyLabel}</p>
      ) : null}

      {children}
    </section>
  );
}
