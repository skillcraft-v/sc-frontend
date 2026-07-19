"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth/session";

export function Header() {
  const pathname = usePathname();
  const { logout } = useSession();

  const links = [
    { href: "/vagas", label: "Vagas" },
    { href: "/skills", label: "Skills" },
    { href: "/carreira", label: "Carreira" },
    { href: "/perfil", label: "Perfil" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-foreground/10 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
        <Link
          href="/vagas"
          className="text-lg font-bold tracking-tight text-foreground transition-opacity hover:opacity-90"
        >
          SkillCraft
        </Link>

        <nav className="flex items-center gap-6">
          <ul className="flex items-center gap-4 sm:gap-6">
            {links.map((link) => {
              const isActive = pathname?.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-sm font-medium transition-colors hover:text-foreground ${
                      isActive ? "text-foreground underline decoration-2 underline-offset-4" : "text-foreground/75"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="h-4 w-px bg-foreground/15" aria-hidden="true" />

          <button
            onClick={logout}
            className="text-sm font-medium text-red-600 transition-colors hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
          >
            Sair
          </button>
        </nav>
      </div>
    </header>
  );
}
