"use client";

import Link from "next/link";
import { useSkillList } from "@/lib/skills/use-skill-list";
import { SkillFilters } from "@/components/skills/SkillFilters";
import { SkillRow } from "@/components/skills/SkillRow";

export default function SkillsPage() {
  return <SkillsList />;
}

function SkillsList() {
  const { data, status, applyFilters, page, setPage, reload } = useSkillList();
  const totalPages = data?.pages ?? 0;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-h1">Skills</h1>
          <p className="text-soft">Seu repertório técnico, com o nível de cada competência.</p>
        </div>
        <Link
          href="/skills/nova"
          className="self-start rounded-control bg-ink px-4.5 py-2.5 font-semibold text-ink-inverse shadow-ink transition-opacity hover:opacity-[.88] sm:self-auto"
        >
          Nova skill
        </Link>
      </header>

      <SkillFilters onApply={applyFilters} />

      {status === "loading" ? (
        <p role="status" className="text-secondary text-soft">
          Carregando skills…
        </p>
      ) : null}

      {status === "error" ? (
        <div className="flex items-center gap-3">
          <p role="alert" className="text-secondary text-rejected-fg">
            Não foi possível carregar as skills.
          </p>
          <button onClick={reload} className="text-secondary font-medium underline">
            Tentar novamente
          </button>
        </div>
      ) : null}

      {status === "success" && data && data.items.length === 0 ? (
        <p className="text-secondary text-soft">
          Nenhuma skill encontrada. Que tal{" "}
          <Link href="/skills/nova" className="font-medium underline">
            criar a primeira
          </Link>
          ?
        </p>
      ) : null}

      {status === "success" && data && data.items.length > 0 ? (
        <>
          <ul className="flex flex-col gap-3">
            {data.items.map((skill) => (
              <li key={skill.id}>
                <SkillRow skill={skill} />
              </li>
            ))}
          </ul>

          {totalPages > 1 ? (
            <nav aria-label="Paginação" className="flex items-center justify-center gap-4">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="text-secondary font-medium underline disabled:opacity-50 disabled:no-underline"
              >
                Anterior
              </button>
              <span className="text-secondary text-soft">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="text-secondary font-medium underline disabled:opacity-50 disabled:no-underline"
              >
                Próxima
              </button>
            </nav>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
