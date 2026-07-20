import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Header } from "@/components/ui/Header";

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
  useRouter: () => ({ push: vi.fn() }),
}));

afterEach(() => {
  cleanup();
  logoutMock.mockClear();
  pathnameMock.mockClear();
});

describe("Header Component", () => {
  it("renderiza o titulo e os links de navegacao", () => {
    pathnameMock.mockReturnValue("/vagas");
    render(<Header />);

    // Verifica o título do sistema
    const titleLink = screen.getByRole("link", { name: "SkillCraft" });
    expect(titleLink).toHaveAttribute("href", "/vagas");

    // Verifica os links principais
    expect(screen.getByRole("link", { name: "Vagas" })).toHaveAttribute("href", "/vagas");
    expect(screen.getByRole("link", { name: "Skills" })).toHaveAttribute("href", "/skills");
    expect(screen.getByRole("link", { name: "Carreira" })).toHaveAttribute("href", "/carreira");
    expect(screen.getByRole("link", { name: "Perfil" })).toHaveAttribute("href", "/perfil");
  });

  it("destaca visualmente o link ativo com base no pathname", () => {
    // Caso de rota ativa: /skills
    pathnameMock.mockReturnValue("/skills");
    const { rerender } = render(<Header />);
    
    let skillsLink = screen.getByRole("link", { name: "Skills" });
    expect(skillsLink.className).toContain("text-ink");
    expect(skillsLink.className).toContain("underline");

    let vagasLink = screen.getByRole("link", { name: "Vagas" });
    expect(vagasLink.className).toContain("text-soft");
    expect(vagasLink.className).not.toContain("underline");

    // Caso de rota filha: /vagas/v1
    pathnameMock.mockReturnValue("/vagas/v1");
    rerender(<Header />);

    skillsLink = screen.getByRole("link", { name: "Skills" });
    expect(skillsLink.className).toContain("text-soft");
    expect(skillsLink.className).not.toContain("underline");

    vagasLink = screen.getByRole("link", { name: "Vagas" });
    expect(vagasLink.className).toContain("text-ink");
    expect(vagasLink.className).toContain("underline");
  });

  it("chama a acao de logout ao clicar no botao Sair", async () => {
    render(<Header />);
    const logoutBtn = screen.getByRole("button", { name: "Sair" });
    
    const user = userEvent.setup();
    await user.click(logoutBtn);
    
    expect(logoutMock).toHaveBeenCalledTimes(1);
  });
});
