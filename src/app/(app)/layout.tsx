"use client";

/**
 * Layout das rotas autenticadas. O route group `(app)` não altera as URLs: serve apenas
 * para aplicar guarda de sessão + shell editorial (sidebar, drawer no mobile, main com
 * transição scIn a cada rota) sem alcançar `/login` e `/registro` (SKC-63).
 */
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { RequireAuth } from "@/lib/auth/require-auth";
import { Sidebar } from "@/components/ui/Sidebar";

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <RequireAuth>
      <div className="flex min-h-screen flex-col lg:flex-row">
        <Sidebar />
        <main
          key={pathname}
          className="mx-auto w-full max-w-[960px] flex-1 animate-sc-in px-5 py-8 lg:px-11 lg:py-9"
        >
          {children}
        </main>
      </div>
    </RequireAuth>
  );
}
