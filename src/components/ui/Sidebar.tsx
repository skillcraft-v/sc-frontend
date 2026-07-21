"use client";

/**
 * Shell de navegação editorial (handoff §Sidebar): sidebar fixa 232px no desktop e
 * drawer sobreposto (aberto por hambúrguer) no mobile ≥360px. Substitui o Header
 * global (SKC-42) mantendo paridade de rotas e o logout acessível (USR).
 *
 * Não decide nada de negócio (P-006): apenas navegação e a ação de logout da sessão.
 * Contagens/badges e card de perfil do rodapé ficam fora desta task (T49).
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Briefcase,
  Compass,
  LogOut,
  Menu,
  Sparkles,
  User,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useSession } from "@/lib/auth/session";

interface NavItem {
  /** Destino do clique. */
  href: string;
  label: string;
  icon: LucideIcon;
  /** Prefixo de rota que acende o item — separado do href (Adaptação clica em /vagas
   *  mas acende ao ver /adaptacoes/{id}, já que não há rota índice de adaptação). */
  activePrefix: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { href: "/vagas", label: "Vagas", icon: Briefcase, activePrefix: "/vagas" },
  { href: "/skills", label: "Skills", icon: Sparkles, activePrefix: "/skills" },
  { href: "/carreira", label: "Carreira", icon: Compass, activePrefix: "/carreira" },
  { href: "/vagas", label: "Adaptação", icon: Zap, activePrefix: "/adaptacoes" },
  { href: "/perfil", label: "Perfil", icon: User, activePrefix: "/perfil" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useSession();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  // Fecha o drawer sempre que a rota muda (navegação real no mobile).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape fecha o drawer (a11y).
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Barra superior — só no mobile (< lg): abre o drawer. */}
      <div className="flex h-14 items-center gap-3 border-b border-line px-4 lg:hidden">
        <button
          type="button"
          aria-label="Abrir menu"
          aria-expanded={open}
          aria-controls="sidebar-nav"
          onClick={() => setOpen(true)}
          className="-ml-1.5 rounded-control p-1.5 text-ink transition-colors hover:bg-hover-bg"
        >
          <Menu size={20} aria-hidden="true" />
        </button>
        <span className="font-display text-[17px]">SkillCraft</span>
      </div>

      {/* Overlay do drawer (< lg, apenas quando aberto). */}
      {open ? (
        <div
          data-testid="sidebar-overlay"
          aria-hidden="true"
          onClick={close}
          className="fixed inset-0 z-40 bg-ink/30 lg:hidden"
        />
      ) : null}

      {/* Sidebar (desktop) / Drawer (mobile). */}
      <nav
        id="sidebar-nav"
        aria-label="Navegação principal"
        className={`fixed inset-y-0 left-0 z-50 flex w-[232px] flex-col gap-6 border-r border-line bg-paper px-4 py-6 transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo + fechar (mobile). */}
        <div className="flex items-center justify-between px-2">
          <Link href="/vagas" onClick={close} className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex h-[30px] w-[30px] items-center justify-center rounded-mark bg-ink font-display text-base font-semibold text-ink-inverse"
            >
              S
            </span>
            <span className="font-display text-[19px]">SkillCraft</span>
          </Link>
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={close}
            className="rounded-control p-1.5 text-soft transition-colors hover:bg-hover-bg hover:text-ink lg:hidden"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Navegação principal. */}
        <div className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname?.startsWith(item.activePrefix) ?? false;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={close}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-2.5 rounded-control px-2.5 py-2 text-sm font-semibold transition-colors ${
                  isActive ? "bg-hover-bg text-ink" : "text-soft hover:bg-hover-bg hover:text-ink"
                }`}
              >
                <Icon size={16} aria-hidden="true" className="shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Logout — mantém paridade com o Header anterior (USR). */}
        <button
          type="button"
          onClick={logout}
          className="mt-auto flex items-center gap-2.5 rounded-control px-2.5 py-2 text-sm font-semibold text-rejected-fg transition-colors hover:bg-hover-bg"
        >
          <LogOut size={16} aria-hidden="true" className="shrink-0" />
          <span>Sair</span>
        </button>
      </nav>
    </>
  );
}
