"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth/session";
import { RequireAuth } from "@/lib/auth/require-auth";
import { authErrorMessage, fieldErrors } from "@/lib/auth/error-messages";
import type { ProfileUpdateInput, UserProfile } from "@/lib/auth/types";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export default function PerfilPage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}

function ProfileContent() {
  const { user, logout, refreshProfile } = useSession();
  const router = useRouter();
  // user é garantido pela RequireAuth (status === "authenticated").
  const current = user as UserProfile;

  const [fullName, setFullName] = useState(current.full_name);
  const [headline, setHeadline] = useState(current.headline ?? "");
  const [linkedin, setLinkedin] = useState(current.linkedin_url ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setFields({});
    setSaved(false);
    const payload: ProfileUpdateInput = {
      full_name: fullName,
      headline: headline || null,
      linkedin_url: linkedin || null,
    };
    try {
      await api.put<UserProfile>("/auth/me", payload);
      await refreshProfile();
      setSaved(true);
    } catch (err) {
      setError(authErrorMessage(err));
      setFields(fieldErrors(err));
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    setPending(true);
    setError(null);
    try {
      await api.delete("/auth/me");
      logout();
      router.replace("/login");
    } catch (err) {
      setError(authErrorMessage(err));
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Meu perfil</h1>
        <button onClick={() => router.push("/vagas")} className="text-sm font-medium underline">
          Voltar
        </button>
      </div>
      <p className="text-sm text-soft">{current.email}</p>

      <form onSubmit={handleSave} className="flex flex-col gap-4" noValidate>
        {error ? <Alert>{error}</Alert> : null}
        {saved ? (
          <p role="status" className="text-sm text-accepted-fg">
            Perfil atualizado.
          </p>
        ) : null}
        <Field
          id="full_name"
          name="full_name"
          label="Nome completo"
          required
          value={fullName}
          error={fields.full_name}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Field
          id="headline"
          name="headline"
          label="Título profissional"
          value={headline}
          error={fields.headline}
          onChange={(e) => setHeadline(e.target.value)}
        />
        <Field
          id="linkedin_url"
          name="linkedin_url"
          type="url"
          label="LinkedIn"
          value={linkedin}
          error={fields.linkedin_url}
          onChange={(e) => setLinkedin(e.target.value)}
        />
        <Button type="submit" pending={pending} pendingLabel="Salvando…">
          Salvar
        </Button>
      </form>

      <section className="flex flex-col gap-2 border-t border-hairline pt-6">
        <h2 className="text-sm font-semibold text-ink">Excluir conta</h2>
        {confirmingDelete ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-soft">
              Esta ação é permanente. Tem certeza que deseja excluir sua conta?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={pending}
                className="rounded-md bg-rejected-fg px-4 py-2 text-sm font-medium text-ink-inverse disabled:opacity-60"
              >
                Confirmar exclusão
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
                className="rounded-md border border-line px-4 py-2 text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="self-start text-sm font-medium text-rejected-fg underline"
          >
            Excluir conta
          </button>
        )}
      </section>
    </main>
  );
}
