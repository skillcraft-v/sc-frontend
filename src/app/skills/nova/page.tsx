"use client";

import { useRouter } from "next/navigation";
import { RequireAuth } from "@/lib/auth/require-auth";
import { createSkill } from "@/lib/skills/api";
import type { SkillInput } from "@/lib/skills/types";
import { SkillForm } from "@/components/skills/SkillForm";

export default function NovaSkillPage() {
  return (
    <RequireAuth>
      <NovaSkill />
    </RequireAuth>
  );
}

function NovaSkill() {
  const router = useRouter();

  async function handleCreate(input: SkillInput) {
    const created = await createSkill(input);
    router.push(`/skills/${created.id}`);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-bold tracking-tight">Nova skill</h1>
      <SkillForm submitLabel="Criar skill" onSubmit={handleCreate} />
    </main>
  );
}
