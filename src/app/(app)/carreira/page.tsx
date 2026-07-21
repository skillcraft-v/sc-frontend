"use client";

import { useState } from "react";
import Link from "next/link";
import { useResourceList } from "@/lib/career/use-resource-list";
import { careerErrorMessage } from "@/lib/career/error-messages";
import {
  createCertification,
  createEducation,
  createProject,
  deleteProject,
  listCertifications,
  listEducation,
  listProjects,
} from "@/lib/career/api";
import type { Certification, Education, Project } from "@/lib/career/types";
import { CareerSection } from "@/components/career/CareerSection";
import { ProjectForm } from "@/components/career/ProjectForm";
import { EducationForm } from "@/components/career/EducationForm";
import { CertificationForm } from "@/components/career/CertificationForm";
import { EducationItem } from "@/components/career/EducationItem";
import { CertificationItem } from "@/components/career/CertificationItem";

export default function CarreiraPage() {
  return <Career />;
}

function Career() {
  const projects = useResourceList<Project>(listProjects);
  const education = useResourceList<Education>(listEducation);
  const certifications = useResourceList<Certification>(listCertifications);
  const [projectError, setProjectError] = useState<string | null>(null);

  async function handleDeleteProject(id: string) {
    setProjectError(null);
    try {
      await deleteProject(id);
      projects.setItems((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setProjectError(careerErrorMessage(err));
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-12 px-6 py-12">
      <h1 className="text-2xl font-bold tracking-tight">Carreira</h1>

      <CareerSection
        title="Projetos"
        status={projects.status}
        isEmpty={projects.items.length === 0}
        emptyLabel="Nenhum projeto ainda."
        onReload={projects.reload}
        renderAddForm={(done) => (
          <ProjectForm
            submitLabel="Adicionar projeto"
            onSubmit={async (input) => {
              await createProject(input);
              projects.reload();
              done();
            }}
          />
        )}
      >
        {projectError ? (
          <p role="alert" className="text-sm text-rejected-fg">
            {projectError}
          </p>
        ) : null}
        <ul className="flex flex-col gap-3">
          {projects.items.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 rounded-md border border-line px-4 py-3">
              <Link href={`/carreira/projetos/${p.id}`} className="text-sm hover:underline">
                <span className="font-medium">{p.title}</span>
                <span className="text-soft">
                  {" "}
                  · {p.start_date} – {p.end_date ?? "atual"}
                </span>
              </Link>
              <button
                onClick={() => handleDeleteProject(p.id)}
                aria-label={`Excluir projeto ${p.title}`}
                className="text-sm font-medium text-rejected-fg underline"
              >
                Excluir
              </button>
            </li>
          ))}
        </ul>
      </CareerSection>

      <CareerSection
        title="Educação"
        status={education.status}
        isEmpty={education.items.length === 0}
        emptyLabel="Nenhuma formação ainda."
        onReload={education.reload}
        renderAddForm={(done) => (
          <EducationForm
            submitLabel="Adicionar formação"
            onSubmit={async (input) => {
              await createEducation(input);
              education.reload();
              done();
            }}
          />
        )}
      >
        <ul className="flex flex-col gap-3">
          {education.items.map((e) => (
            <EducationItem
              key={e.id}
              item={e}
              onUpdated={(u) => education.setItems((prev) => prev.map((x) => (x.id === u.id ? u : x)))}
              onDeleted={(id) => education.setItems((prev) => prev.filter((x) => x.id !== id))}
            />
          ))}
        </ul>
      </CareerSection>

      <CareerSection
        title="Certificações"
        status={certifications.status}
        isEmpty={certifications.items.length === 0}
        emptyLabel="Nenhuma certificação ainda."
        onReload={certifications.reload}
        renderAddForm={(done) => (
          <CertificationForm
            submitLabel="Adicionar certificação"
            onSubmit={async (input) => {
              await createCertification(input);
              certifications.reload();
              done();
            }}
          />
        )}
      >
        <ul className="flex flex-col gap-3">
          {certifications.items.map((c) => (
            <CertificationItem
              key={c.id}
              item={c}
              onUpdated={(u) => certifications.setItems((prev) => prev.map((x) => (x.id === u.id ? u : x)))}
              onDeleted={(id) => certifications.setItems((prev) => prev.filter((x) => x.id !== id))}
            />
          ))}
        </ul>
      </CareerSection>
    </div>
  );
}
