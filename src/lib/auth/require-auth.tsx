"use client";

/**
 * Guarda de rota client-side: enquanto a sessão hidrata mostra um estado de carregamento;
 * se não autenticado, redireciona para /login. A autoridade real continua no sc-api (P-006):
 * isto é apenas UX — qualquer endpoint protegido revalida o token.
 */
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/session";
import { Header } from "@/components/ui/Header";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <p role="status" className="p-6 text-center text-soft">
        Carregando…
      </p>
    );
  }

  return (
    <>
      <Header />
      {children}
    </>
  );
}
