import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { SkillForm } from "@/components/skills/SkillForm";
import { ApiError } from "@/lib/api";
import type { SkillInput } from "@/lib/skills/types";

afterEach(() => cleanup());

async function fillRequired() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Título (PT)"), "Desenvolvimento FastAPI");
  await user.type(screen.getByLabelText("Título (EN)"), "FastAPI Development");
  await user.type(screen.getByLabelText("Descrição (PT)"), "Descrição em português.");
  await user.type(screen.getByLabelText("Descrição (EN)"), "English description.");
  await user.type(screen.getByLabelText("Tags (separadas por vírgula)"), "Python, FastAPI");
  return user;
}

describe("SkillForm", () => {
  it("renderiza os campos bilíngues (PT e EN)", () => {
    render(<SkillForm submitLabel="Criar" onSubmit={vi.fn()} />);
    expect(screen.getByLabelText("Título (PT)")).toBeInTheDocument();
    expect(screen.getByLabelText("Título (EN)")).toBeInTheDocument();
    expect(screen.getByLabelText("Descrição (PT)")).toBeInTheDocument();
    expect(screen.getByLabelText("Descrição (EN)")).toBeInTheDocument();
  });

  it("envia o input com tags normalizadas e código nulo quando vazio", async () => {
    const onSubmit = vi.fn<(i: SkillInput) => Promise<void>>().mockResolvedValue();
    render(<SkillForm submitLabel="Criar" onSubmit={onSubmit} />);
    const user = await fillRequired();
    await user.click(screen.getByRole("button", { name: "Criar" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]![0]).toMatchObject({
      title_pt: "Desenvolvimento FastAPI",
      title_en: "FastAPI Development",
      tags: ["python", "fastapi"],
      code_example: null,
    });
  });

  it("MISSING_TRANSLATION mostra mensagem pt-BR", async () => {
    const onSubmit = vi
      .fn<(i: SkillInput) => Promise<void>>()
      .mockRejectedValue(new ApiError({ code: "MISSING_TRANSLATION", message: "x", status: 400 }));
    render(<SkillForm submitLabel="Criar" onSubmit={onSubmit} />);
    const user = await fillRequired();
    await user.click(screen.getByRole("button", { name: "Criar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/dois idiomas/i);
  });

  it("VALIDATION_ERROR destaca o campo (aria-invalid + mensagem)", async () => {
    const onSubmit = vi.fn<(i: SkillInput) => Promise<void>>().mockRejectedValue(
      new ApiError({
        code: "VALIDATION_ERROR",
        message: "x",
        status: 400,
        details: [{ field: "title_en", message: "Obrigatório" }],
      }),
    );
    render(<SkillForm submitLabel="Criar" onSubmit={onSubmit} />);
    const user = await fillRequired();
    await user.click(screen.getByRole("button", { name: "Criar" }));

    await waitFor(() => expect(screen.getByLabelText("Título (EN)")).toHaveAttribute("aria-invalid", "true"));
    expect(screen.getByText("Obrigatório")).toBeInTheDocument();
  });

  it("não tem violações de acessibilidade (axe)", async () => {
    const { container } = render(<SkillForm submitLabel="Criar" onSubmit={vi.fn()} />);
    // color-contrast não roda no jsdom (sem layout); é coberto no Playwright.
    const results = await axe(container, { rules: { "color-contrast": { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
