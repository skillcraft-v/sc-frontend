"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/session";
import { authErrorMessage, fieldErrors } from "@/lib/auth/error-messages";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export default function RegistroPage() {
  const { register } = useSession();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setFields({});
    try {
      await register({ email, password, full_name: fullName });
      router.push("/vagas");
    } catch (err) {
      setError(authErrorMessage(err));
      setFields(fieldErrors(err));
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-6 px-6 py-12">
      <h1 className="text-2xl font-bold tracking-tight">Criar conta</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {error ? <Alert>{error}</Alert> : null}
        <Field
          id="full_name"
          name="full_name"
          label="Nome completo"
          autoComplete="name"
          required
          value={fullName}
          error={fields.full_name}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Field
          id="email"
          name="email"
          type="email"
          label="E-mail"
          autoComplete="email"
          required
          value={email}
          error={fields.email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          id="password"
          name="password"
          type="password"
          label="Senha"
          autoComplete="new-password"
          required
          value={password}
          error={fields.password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" pending={pending} pendingLabel="Criando…">
          Criar conta
        </Button>
      </form>
      <p className="text-sm text-foreground/80">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium underline">
          Entrar
        </Link>
      </p>
    </main>
  );
}
