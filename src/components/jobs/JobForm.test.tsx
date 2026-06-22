import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { JobForm } from "@/components/jobs/JobForm";
import { ApiError } from "@/lib/api";
import type { JobInput } from "@/lib/jobs/types";

afterEach(() => cleanup());

describe("JobForm", () => {
  it("envia o input montado (campos opcionais vazios viram null)", async () => {
    const onSubmit = vi.fn<(input: JobInput) => Promise<void>>().mockResolvedValue();
    render(<JobForm submitLabel="Salvar vaga" onSubmit={onSubmit} />);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Cargo"), "Backend Dev");
    await user.type(screen.getByLabelText("Empresa"), "Acme");
    await user.type(screen.getByLabelText("Descrição da vaga"), "d".repeat(120));
    await user.click(screen.getByLabelText("Vaga remota"));
    await user.click(screen.getByRole("button", { name: "Salvar vaga" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]![0]).toMatchObject({
      title: "Backend Dev",
      company: "Acme",
      is_remote: true,
      requirements: null,
      url: null,
    });
  });

  it("mostra o contador de caracteres restantes da descrição", async () => {
    render(<JobForm submitLabel="Salvar" onSubmit={vi.fn()} />);
    expect(screen.getByText(/faltam 100 caractere/i)).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Descrição da vaga"), "d".repeat(40));
    expect(screen.getByText(/faltam 60 caractere/i)).toBeInTheDocument();
  });

  it("erro do backend vira mensagem pt-BR (e erro por campo)", async () => {
    const onSubmit = vi
      .fn<(input: JobInput) => Promise<void>>()
      .mockRejectedValue(
        new ApiError({
          code: "DESCRIPTION_TOO_SHORT",
          message: "raw",
          status: 400,
        }),
      );
    render(<JobForm submitLabel="Salvar" onSubmit={onSubmit} />);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Cargo"), "Dev");
    await user.type(screen.getByLabelText("Empresa"), "Acme");
    await user.type(screen.getByLabelText("Descrição da vaga"), "curta");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/100 caracteres/i);
  });

  it("não tem violações de acessibilidade (axe)", async () => {
    const { container } = render(<JobForm submitLabel="Criar" onSubmit={vi.fn()} />);
    const results = await axe(container, { rules: { "color-contrast": { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
