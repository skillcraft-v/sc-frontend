import type { ReactNode } from "react";
import Link from "next/link";

/**
 * Linha editorial de um item de carreira (handoff §Carreira): dot 8px + título/subtítulo
 * à esquerda, período à direita (quebra abaixo do título em telas estreitas). Usada por
 * Formação, Certificações e Projetos dentro do card único de CareerSection.
 */
export function CareerRow({
  title,
  titleHref,
  subtitle,
  description,
  period,
  actions,
}: {
  title: string;
  titleHref?: string;
  subtitle?: string;
  description?: string | null;
  period: string;
  actions?: ReactNode;
}) {
  return (
    <li className="flex gap-3.5 px-5 py-3.5 transition-colors hover:bg-subtle-bg">
      <span aria-hidden="true" className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-ink" />
      <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3 gap-y-1.5">
        <div className="flex min-w-[180px] flex-1 flex-col gap-0.5">
          {titleHref ? (
            <Link href={titleHref} className="text-body-lg font-semibold text-ink hover:underline">
              {title}
            </Link>
          ) : (
            <span className="text-body-lg font-semibold text-ink">{title}</span>
          )}
          {subtitle ? <span className="text-secondary text-soft">{subtitle}</span> : null}
          {description ? <p className="text-secondary text-ink">{description}</p> : null}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-meta whitespace-nowrap text-soft">{period}</span>
          {actions}
        </div>
      </div>
    </li>
  );
}
