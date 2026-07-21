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
import { useCallback, useEffect, useRef, useState } from "react";
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
import { useIsMobile } from "@/lib/ui/use-is-mobile";

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

/** Controles tabuláveis do painel, na ordem do DOM — base do trap de foco. */
const FOCUSABLE = "a[href], button:not([disabled])";

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useSession();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  /** Fecha por navegação: a rota muda e o foco pertence à página nova (APG). */
  const close = () => setOpen(false);

  /**
   * Fecha por dispensa (Escape, overlay, X): devolve o foco a quem abriu. Só no mobile —
   * é lá que o hambúrguer existe; no desktop ele está oculto e não deve receber foco.
   */
  const dismiss = useCallback(() => {
    setOpen(false);
    if (isMobile) toggleRef.current?.focus();
  }, [isMobile]);

  const focusableItems = (): HTMLElement[] =>
    Array.from(navRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);

  // Fecha o drawer sempre que a rota muda (navegação real no mobile).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Ao abrir, o foco entra no painel (WAI-ARIA APG, diálogo modal).
  useEffect(() => {
    if (!open || !isMobile) return;
    focusableItems()[0]?.focus();
  }, [open, isMobile]);

  // Escape fecha o drawer (a11y) — em qualquer viewport.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismiss]);

  // Trap: Tab/Shift+Tab circulam dentro do painel sem escapar para o conteúdo atrás.
  // Só no mobile — no desktop a nav faz parte do fluxo normal da página.
  useEffect(() => {
    if (!open || !isMobile) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const items = focusableItems();
      const first = items.at(0);
      const last = items.at(-1);
      if (!first || !last) return;

      const active = document.activeElement;

      // Só intervimos nas bordas: no meio do painel o Tab nativo já faz o certo.
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, isMobile]);

  return (
    <>
      {/* Barra superior — só no mobile (< lg): abre o drawer. */}
      <div className="flex h-14 items-center gap-3 border-b border-line px-4 lg:hidden">
        <button
          ref={toggleRef}
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
          onClick={dismiss}
          className="fixed inset-0 z-40 bg-ink/30 lg:hidden"
        />
      ) : null}

      {/* Sidebar (desktop) / Drawer (mobile). */}
      {/* Fora da viewport o painel fica inerte: sem `inert` os 6 controles continuariam
          focáveis por Tab e anunciados, já que translate não os remove do fluxo (SKC-62).
          No desktop `open` é sempre false e a nav precisa seguir focável — daí o isMobile. */}
      <nav
        ref={navRef}
        id="sidebar-nav"
        aria-label="Navegação principal"
        inert={isMobile && !open}
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
            onClick={dismiss}
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
