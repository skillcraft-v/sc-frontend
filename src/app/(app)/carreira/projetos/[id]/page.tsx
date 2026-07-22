"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { deleteProject, getProject, updateProject } from "@/lib/career/api";
import { careerErrorMessage } from "@/lib/career/error-messages";
import type { Project, ProjectInput } from "@/lib/career/types";
import { ProjectForm } from "@/components/career/ProjectForm";
import { ProjectSkillsManager } from "@/components/career/ProjectSkillsManager";
import { Alert } from "@/components/ui/Alert";

export default function EditarProjetoPage() {
  return <EditarProjeto />;
}

type LoadState = "loading" | "loaded" | "notfound" | "error";

function EditarProjeto() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setState("loading");
    getProject(id)
      .then((p) => {
        if (!active) return;
        setProject(p);
        setState("loaded");
      })
      .catch((err) => {
        if (!active) return;
        setState(careerErrorMessage(err).includes("Projeto não encontrado") ? "notfound" : "error");
      });
    return () => {
      active = false;
    };
  }, [id]);

  async function handleUpdate(input: ProjectInput) {
    const updated = await updateProject(id, input);
    setProject((prev) => ({ ...updated, skills: prev?.skills ?? updated.skills }));
  }

  async function handleDelete() {
    setActionError(null);
    try {
      await deleteProject(id);
      router.push("/carreira");
    } catch (err) {
      setActionError(careerErrorMessage(err));
    }
  }

  if (state === "loading") {
    return (
      <p role="status" className="text-secondary p-6 text-center text-soft">
        Carregando projeto…
      </p>
    );
  }

  if (state === "notfound") {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 px-6 py-12">
        <p role="alert" className="text-secondary text-rejected-fg">
          Projeto não encontrado.
        </p>
        <Link href="/carreira" className="text-secondary font-medium underline">
          Voltar para carreira
        </Link>
      </div>
    );
  }

  if (state === "error" || !project) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 px-6 py-12">
        <p role="alert" className="text-secondary text-rejected-fg">
          Não foi possível carregar o projeto.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-h1">Editar projeto</h1>
        <Link href="/carreira" className="text-secondary font-medium underline">
          Voltar
        </Link>
      </div>

      {actionError ? <Alert>{actionError}</Alert> : null}

      <ProjectForm initial={project} submitLabel="Salvar alterações" onSubmit={handleUpdate} />

      <ProjectSkillsManager projectId={project.id} initialLinks={project.skills ?? []} />

      <section className="flex flex-col gap-2 border-t border-hairline pt-6">
        <h2 className="text-secondary font-semibold text-ink">Excluir projeto</h2>
        <button
          onClick={handleDelete}
          className="text-secondary self-start font-medium text-rejected-fg underline"
        >
          Excluir este projeto
        </button>
      </section>
    </div>
  );
}
