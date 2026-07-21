import { render, screen, cleanup, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { Sidebar } from "@/components/ui/Sidebar";
import { setViewport } from "@/test/viewport";

const logoutMock = vi.fn();
vi.mock("@/lib/auth/session", () => ({
  useSession: () => ({
    logout: logoutMock,
    user: { id: "u1", email: "u@x.com", full_name: "User" },
  }),
}));

const pathnameMock = vi.fn(() => "/vagas");
vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

afterEach(() => {
  cleanup();
  logoutMock.mockClear();
  pathnameMock.mockClear();
});

describe("Sidebar", () => {
  it("renderiza a logo e os 5 itens de navegação com seus destinos", () => {
    pathnameMock.mockReturnValue("/vagas");
    render(<Sidebar />);

    // Logo leva à home autenticada (/vagas), como o Header anterior.
    expect(screen.getByRole("link", { name: "SkillCraft" })).toHaveAttribute("href", "/vagas");

    expect(screen.getByRole("link", { name: "Vagas" })).toHaveAttribute("href", "/vagas");
    expect(screen.getByRole("link", { name: "Skills" })).toHaveAttribute("href", "/skills");
    expect(screen.getByRole("link", { name: "Carreira" })).toHaveAttribute("href", "/carreira");
    // "Adaptação" não tem rota índice: aponta para /vagas, onde a adaptação começa.
    expect(screen.getByRole("link", { name: "Adaptação" })).toHaveAttribute("href", "/vagas");
    expect(screen.getByRole("link", { name: "Perfil" })).toHaveAttribute("href", "/perfil");
  });

  it("marca o item ativo pelo pathname, inclusive em rota filha de /vagas", () => {
    pathnameMock.mockReturnValue("/vagas/v1");
    render(<Sidebar />);

    expect(screen.getByRole("link", { name: "Vagas" })).toHaveAttribute("aria-current", "page");
    // Adaptação (activePrefix /adaptacoes) NÃO acende em rota de vaga.
    expect(screen.getByRole("link", { name: "Adaptação" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Skills" })).not.toHaveAttribute("aria-current");
  });

  it("acende Adaptação (e não Vagas) ao visualizar uma adaptação (/adaptacoes/{id})", () => {
    pathnameMock.mockReturnValue("/adaptacoes/a1");
    render(<Sidebar />);

    expect(screen.getByRole("link", { name: "Adaptação" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Vagas" })).not.toHaveAttribute("aria-current");
  });

  it("acende o item de uma seção simples (Skills)", () => {
    pathnameMock.mockReturnValue("/skills/nova");
    render(<Sidebar />);

    expect(screen.getByRole("link", { name: "Skills" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Vagas" })).not.toHaveAttribute("aria-current");
  });

  it("chama logout ao clicar em Sair", async () => {
    render(<Sidebar />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Sair" }));

    expect(logoutMock).toHaveBeenCalledTimes(1);
  });

  describe("drawer mobile", () => {
    it("começa fechado, abre pelo hambúrguer e fecha pelo overlay", async () => {
      render(<Sidebar />);
      const user = userEvent.setup();

      const toggle = screen.getByRole("button", { name: "Abrir menu" });
      expect(toggle).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByTestId("sidebar-overlay")).not.toBeInTheDocument();

      await user.click(toggle);
      expect(toggle).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByTestId("sidebar-overlay")).toBeInTheDocument();

      await user.click(screen.getByTestId("sidebar-overlay"));
      expect(toggle).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByTestId("sidebar-overlay")).not.toBeInTheDocument();
    });

    it("fecha o drawer ao navegar por um item", async () => {
      render(<Sidebar />);
      const user = userEvent.setup();

      await user.click(screen.getByRole("button", { name: "Abrir menu" }));
      expect(screen.getByRole("button", { name: "Abrir menu" })).toHaveAttribute(
        "aria-expanded",
        "true",
      );

      // Clicar num item de nav fecha o drawer (navegação no mobile).
      await user.click(screen.getByRole("link", { name: "Carreira" }));
      expect(screen.getByRole("button", { name: "Abrir menu" })).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    });

    it("fecha o drawer com a tecla Escape", async () => {
      render(<Sidebar />);
      const user = userEvent.setup();

      await user.click(screen.getByRole("button", { name: "Abrir menu" }));
      await user.keyboard("{Escape}");

      expect(screen.getByRole("button", { name: "Abrir menu" })).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    });
  });

  // SKC-62. jsdom 26 não implementa `inert` (os filhos seguem focáveis mesmo com o
  // atributo), então aqui provamos a *marcação*; que o Tab realmente não alcança a nav
  // é provado no E2E (e2e/sidebar.spec.ts), em browser real a 390px.
  describe("a11y do drawer mobile", () => {
    it("marca a nav como inerte quando o drawer está fechado no mobile", () => {
      setViewport("mobile");
      render(<Sidebar />);

      expect(screen.getByRole("navigation", { name: "Navegação principal" })).toHaveAttribute(
        "inert",
      );
    });

    it("remove a inércia enquanto o drawer está aberto", async () => {
      setViewport("mobile");
      render(<Sidebar />);
      const user = userEvent.setup();

      await user.click(screen.getByRole("button", { name: "Abrir menu" }));

      expect(screen.getByRole("navigation", { name: "Navegação principal" })).not.toHaveAttribute(
        "inert",
      );
    });

    it("no desktop a nav nunca fica inerte, mesmo com o drawer fechado", () => {
      render(<Sidebar />); // viewport padrão: desktop

      expect(screen.getByRole("navigation", { name: "Navegação principal" })).not.toHaveAttribute(
        "inert",
      );
    });

    it("passa a inércia ao encolher a janela para mobile com o drawer fechado", () => {
      render(<Sidebar />);
      const nav = screen.getByRole("navigation", { name: "Navegação principal" });
      expect(nav).not.toHaveAttribute("inert");

      act(() => setViewport("mobile"));

      expect(nav).toHaveAttribute("inert");
    });

    it("abrir o drawer move o foco para o primeiro controle do painel", async () => {
      setViewport("mobile");
      render(<Sidebar />);
      const user = userEvent.setup();

      await user.click(screen.getByRole("button", { name: "Abrir menu" }));

      expect(screen.getByRole("link", { name: "SkillCraft" })).toHaveFocus();
    });

    it("Escape devolve o foco ao hambúrguer", async () => {
      setViewport("mobile");
      render(<Sidebar />);
      const user = userEvent.setup();
      const toggle = screen.getByRole("button", { name: "Abrir menu" });

      await user.click(toggle);
      await user.keyboard("{Escape}");

      expect(toggle).toHaveFocus();
    });

    it("fechar pelo overlay devolve o foco ao hambúrguer", async () => {
      setViewport("mobile");
      render(<Sidebar />);
      const user = userEvent.setup();
      const toggle = screen.getByRole("button", { name: "Abrir menu" });

      await user.click(toggle);
      await user.click(screen.getByTestId("sidebar-overlay"));

      expect(toggle).toHaveFocus();
    });

    it("navegar por um item NÃO rouba o foco de volta para o hambúrguer", async () => {
      setViewport("mobile");
      render(<Sidebar />);
      const user = userEvent.setup();
      const toggle = screen.getByRole("button", { name: "Abrir menu" });

      await user.click(toggle);
      await user.click(screen.getByRole("link", { name: "Carreira" }));

      // A rota muda: o foco pertence à página nova, não ao hambúrguer (APG).
      expect(toggle).not.toHaveFocus();
    });

    it("Tab no último controle do drawer volta para o primeiro", async () => {
      setViewport("mobile");
      render(<Sidebar />);
      const user = userEvent.setup();

      await user.click(screen.getByRole("button", { name: "Abrir menu" }));
      screen.getByRole("button", { name: "Sair" }).focus();
      await user.tab();

      expect(screen.getByRole("link", { name: "SkillCraft" })).toHaveFocus();
    });

    it("Shift+Tab no primeiro controle vai para o último", async () => {
      setViewport("mobile");
      render(<Sidebar />);
      const user = userEvent.setup();

      await user.click(screen.getByRole("button", { name: "Abrir menu" }));
      screen.getByRole("link", { name: "SkillCraft" }).focus();
      await user.tab({ shift: true });

      expect(screen.getByRole("button", { name: "Sair" })).toHaveFocus();
    });

    it("no desktop o Tab não é aprisionado na nav", async () => {
      render(
        <>
          <Sidebar />
          <button type="button">fora da nav</button>
        </>,
      );
      const user = userEvent.setup();

      screen.getByRole("button", { name: "Sair" }).focus();
      await user.tab();

      expect(screen.getByRole("button", { name: "fora da nav" })).toHaveFocus();
    });
  });

  it("não tem violações de acessibilidade (axe), fechado e aberto", async () => {
    const { container } = render(<Sidebar />);
    const user = userEvent.setup();

    // color-contrast não roda no jsdom (sem layout); é coberto no Playwright.
    const opts = { rules: { "color-contrast": { enabled: false } } };

    expect((await axe(container, opts)).violations).toEqual([]);

    await user.click(screen.getByRole("button", { name: "Abrir menu" }));
    expect((await axe(container, opts)).violations).toEqual([]);
  });
});
