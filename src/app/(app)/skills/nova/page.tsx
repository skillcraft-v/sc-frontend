"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSkill } from "@/lib/skills/api";
import type { SkillInput } from "@/lib/skills/types";
import { SkillForm } from "@/components/skills/SkillForm";

export default function NovaSkillPage() {
  return <NovaSkill />;
}

function NovaSkill() {
  const router = useRouter();

  async function handleCreate(input: SkillInput) {
    const created = await createSkill(input);
    router.push(`/skills/${created.id}`);
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-h1">Nova skill</h1>
        <Link href="/skills" className="text-secondary font-medium underline">
          Voltar
        </Link>
      </header>

      <section className="rounded-card border border-line bg-card p-5 shadow-rest">
        <SkillForm submitLabel="Criar skill" onSubmit={handleCreate} />
      </section>
    </div>
  );
}
