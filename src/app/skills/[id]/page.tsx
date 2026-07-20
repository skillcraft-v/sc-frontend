"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { RequireAuth } from "@/lib/auth/require-auth";
import { deleteSkill, getSkill, updateSkill } from "@/lib/skills/api";
import { skillErrorMessage } from "@/lib/skills/error-messages";
import type { Skill, SkillInput } from "@/lib/skills/types";
import { SkillForm } from "@/components/skills/SkillForm";
import { EvidenceManager } from "@/components/skills/EvidenceManager";
import { Alert } from "@/components/ui/Alert";

export default function EditarSkillPage() {
  return (
    <RequireAuth>
      <EditarSkill />
    </RequireAuth>
  );
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
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 px-6 py-12">
        <p role="alert" className="text-sm text-rejected-fg">
          Skill não encontrada.
        </p>
        <Link href="/skills" className="text-sm font-medium underline">
          Voltar para a lista
        </Link>
      </main>
    );
  }

  if (state === "error" || !skill) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 px-6 py-12">
        <p role="alert" className="text-sm text-rejected-fg">
          Não foi possível carregar a skill.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Editar skill</h1>
        <Link href="/skills" className="text-sm font-medium underline">
          Voltar
        </Link>
      </div>

      {actionError ? <Alert>{actionError}</Alert> : null}

      <SkillForm initial={skill} submitLabel="Salvar alterações" onSubmit={handleUpdate} />

      <EvidenceManager skillId={skill.id} initial={skill.evidences ?? []} />

      <section className="flex flex-col gap-2 border-t border-hairline pt-6">
        <h2 className="text-sm font-semibold text-ink">Excluir skill</h2>
        <button
          onClick={handleDelete}
          className="self-start text-sm font-medium text-rejected-fg underline"
        >
          Excluir esta skill
        </button>
      </section>
    </main>
  );
}
