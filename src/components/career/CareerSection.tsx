"use client";

import { useState, type ReactNode } from "react";
import type { ResourceListStatus } from "@/lib/career/use-resource-list";

/**
 * Wrapper de uma seção de carreira (handoff §Carreira): h2 display + link "+ Adicionar"
 * fora do card, card único (rounded-card-lg/border-line) com as linhas da lista (children,
 * normalmente <CareerRow>) e estados loading/erro/vazio dentro do card.
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
    <section className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-h2">{title}</h2>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="text-secondary font-semibold text-soft hover:text-ink"
        >
          {adding ? "Cancelar" : "+ Adicionar"}
        </button>
      </div>

      {adding ? (
        <div className="rounded-card border border-line bg-card p-4">
          {renderAddForm(() => setAdding(false))}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-card-lg border border-line bg-card">
        {status === "loading" && isEmpty ? (
          <p role="status" className="text-secondary p-5 text-soft">
            Carregando…
          </p>
        ) : null}

        {status === "error" ? (
          <div className="flex items-center gap-3 p-5">
            <p role="alert" className="text-secondary text-rejected-fg">
              Não foi possível carregar.
            </p>
            <button onClick={onReload} className="text-secondary font-medium underline">
              Tentar novamente
            </button>
          </div>
        ) : null}

        {status === "success" && isEmpty ? (
          <p className="text-secondary p-5 text-soft">{emptyLabel}</p>
        ) : null}

        {/* Mantém a lista visível durante reload (stale-while-revalidate): reload() é
            disparado após criar/editar/excluir e não deve apagar os itens já carregados. */}
        {!isEmpty ? <ul className="divide-y divide-hairline">{children}</ul> : null}
      </div>
    </section>
  );
}
