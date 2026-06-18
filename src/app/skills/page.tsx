"use client";

import Link from "next/link";
import { RequireAuth } from "@/lib/auth/require-auth";
import { useSkillList } from "@/lib/skills/use-skill-list";
import { CATEGORY_LABELS, PROFICIENCY_LABELS } from "@/lib/skills/types";
import { SkillFilters } from "@/components/skills/SkillFilters";

export default function SkillsPage() {
  return (
    <RequireAuth>
      <SkillsList />
    </RequireAuth>
  );
}

function SkillsList() {
  const { data, status, applyFilters, page, setPage, reload } = useSkillList();
  const totalPages = data?.pages ?? 0;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Skills</h1>
        <Link
          href="/skills/nova"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          Nova skill
        </Link>
      </div>

      <SkillFilters onApply={applyFilters} />

      {status === "loading" ? (
        <p role="status" className="text-sm text-foreground/80">
          Carregando skills…
        </p>
      ) : null}

      {status === "error" ? (
        <div className="flex items-center gap-3">
          <p role="alert" className="text-sm text-red-700 dark:text-red-400">
            Não foi possível carregar as skills.
          </p>
          <button onClick={reload} className="text-sm font-medium underline">
            Tentar novamente
          </button>
        </div>
      ) : null}

      {status === "success" && data && data.items.length === 0 ? (
        <p className="text-sm text-foreground/80">
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
                <Link
                  href={`/skills/${skill.id}`}
                  className="flex flex-col gap-1 rounded-md border border-foreground/15 px-4 py-3 hover:border-foreground/40"
                >
                  <span className="font-medium">{skill.title_pt}</span>
                  <span className="text-sm text-foreground/80">
                    {CATEGORY_LABELS[skill.category]} · {PROFICIENCY_LABELS[skill.proficiency]}
                    {skill.tags.length ? ` · ${skill.tags.join(", ")}` : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {totalPages > 1 ? (
            <nav aria-label="Paginação" className="flex items-center justify-center gap-4">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="text-sm font-medium underline disabled:opacity-50 disabled:no-underline"
              >
                Anterior
              </button>
              <span className="text-sm text-foreground/80">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="text-sm font-medium underline disabled:opacity-50 disabled:no-underline"
              >
                Próxima
              </button>
            </nav>
          ) : null}
        </>
      ) : null}
    </main>
  );
}
