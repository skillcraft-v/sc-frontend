"use client";

/**
 * Guarda de rota client-side: enquanto a sessão hidrata mostra um estado de carregamento;
 * se não autenticado, redireciona para /login. A autoridade real continua no sc-api (P-006):
 * isto é apenas UX — qualquer endpoint protegido revalida o token.
 */
import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/session";
import { Sidebar } from "@/components/ui/Sidebar";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

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

  // Shell editorial: sidebar (drawer no mobile) + main (max 960px, transição scIn a cada rota).
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar />
      <main
        key={pathname}
        className="mx-auto w-full max-w-[960px] flex-1 animate-sc-in px-5 py-8 lg:px-11 lg:py-9"
      >
        {children}
      </main>
    </div>
  );
}
