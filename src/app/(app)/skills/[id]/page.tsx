"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { deleteSkill, getSkill, updateSkill } from "@/lib/skills/api";
import { skillErrorMessage } from "@/lib/skills/error-messages";
import {
  CATEGORY_LABELS,
  PROFICIENCY_LABELS,
  type Skill,
  type SkillInput,
} from "@/lib/skills/types";
import { SkillForm } from "@/components/skills/SkillForm";
import { EvidenceManager } from "@/components/skills/EvidenceManager";
import { Alert } from "@/components/ui/Alert";

export default function EditarSkillPage() {
  return <EditarSkill />;
}

type LoadState = "loading" | "loaded" | "notfound" | "error";

function EditarSkill() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const [skill, setSkill] = useState<Skill | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setState("loading");
    getSkill(id)
      .then((s) => {
        if (!active) return;
        setSkill(s);
        setState("loaded");
      })
      .catch((err) => {
        if (!active) return;
        setState(skillErrorMessage(err).includes("não encontrada") ? "notfound" : "error");
      });
    return () => {
      active = false;
    };
  }, [id]);

  async function handleUpdate(input: SkillInput) {
    const updated = await updateSkill(id, input);
    setSkill(updated);
  }

  async function handleDelete() {
    setActionError(null);
    try {
      await deleteSkill(id);
      router.push("/skills");
    } catch (err) {
      setActionError(skillErrorMessage(err));
    }
  }

  if (state === "loading") {
    return (
      <p role="status" className="p-6 text-center text-soft">
        Carregando skill…
      </p>
    );
  }

  if (state === "notfound") {
    return (
      <div className="flex flex-col gap-4">
        <p role="alert" className="text-secondary text-rejected-fg">
          Skill não encontrada.
        </p>
        <Link href="/skills" className="text-secondary self-start font-medium underline">
          Voltar para a lista
        </Link>
      </div>
    );
  }

  if (state === "error" || !skill) {
    return (
      <p role="alert" className="text-secondary text-rejected-fg">
        Não foi possível carregar a skill.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-h1">{skill.title_pt}</h1>
          <p className="text-meta text-soft">
            {CATEGORY_LABELS[skill.category]} · {PROFICIENCY_LABELS[skill.proficiency]}
          </p>
        </div>
        <Link href="/skills" className="text-secondary font-medium underline">
          Voltar
        </Link>
      </header>

      {actionError ? <Alert>{actionError}</Alert> : null}

      <section className="flex flex-col gap-4 rounded-card border border-line bg-card p-5 shadow-rest">
        <h2 className="text-h2">Editar skill</h2>
        <SkillForm initial={skill} submitLabel="Salvar alterações" onSubmit={handleUpdate} />
      </section>

      <EvidenceManager skillId={skill.id} initial={skill.evidences ?? []} />

      <section className="flex flex-col gap-2 border-t border-hairline pt-5">
        <h2 className="text-secondary font-semibold text-ink">Excluir skill</h2>
        <button
          onClick={handleDelete}
          className="text-secondary self-start font-medium text-rejected-fg underline"
        >
          Excluir esta skill
        </button>
      </section>
    </div>
  );
}
