import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { ProjectForm } from "@/components/career/ProjectForm";
import { ApiError } from "@/lib/api";
import type { ProjectInput } from "@/lib/career/types";

afterEach(() => cleanup());

describe("ProjectForm", () => {
  it("'em andamento' envia end_date nulo", async () => {
    const onSubmit = vi.fn<(i: ProjectInput) => Promise<void>>().mockResolvedValue();
    render(<ProjectForm submitLabel="Criar" onSubmit={onSubmit} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Título"), "API de pagamentos");
    fireEvent.change(screen.getByLabelText("Início"), { target: { value: "2024-01-01" } });
    await user.click(screen.getByLabelText(/Em andamento/));
    await user.click(screen.getByRole("button", { name: "Criar" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]![0]).toMatchObject({
      title: "API de pagamentos",
      start_date: "2024-01-01",
      end_date: null,
    });
    // ao marcar "em andamento", o campo de término fica desabilitado
    expect(screen.getByLabelText("Término")).toBeDisabled();
  });

  it("envia end_date quando informado e não em andamento", async () => {
    const onSubmit = vi.fn<(i: ProjectInput) => Promise<void>>().mockResolvedValue();
    render(<ProjectForm submitLabel="Criar" onSubmit={onSubmit} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Título"), "Projeto X");
    fireEvent.change(screen.getByLabelText("Início"), { target: { value: "2023-01-01" } });
    fireEvent.change(screen.getByLabelText("Término"), { target: { value: "2023-12-31" } });
    await user.click(screen.getByRole("button", { name: "Criar" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0]![0]).toMatchObject({ end_date: "2023-12-31" });
  });

  it("INVALID_DATE_RANGE mostra mensagem pt-BR e destaca o campo", async () => {
    const onSubmit = vi.fn<(i: ProjectInput) => Promise<void>>().mockRejectedValue(
      new ApiError({
        code: "INVALID_DATE_RANGE",
        message: "x",
        status: 400,
        details: [{ field: "end_date", message: "Anterior ao início" }],
      }),
    );
    render(<ProjectForm submitLabel="Criar" onSubmit={onSubmit} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Título"), "P");
    fireEvent.change(screen.getByLabelText("Início"), { target: { value: "2024-05-01" } });
    fireEvent.change(screen.getByLabelText("Término"), { target: { value: "2024-01-01" } });
    await user.click(screen.getByRole("button", { name: "Criar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/data de término/i);
    await waitFor(() => expect(screen.getByLabelText("Término")).toHaveAttribute("aria-invalid", "true"));
  });

  it("não tem violações de acessibilidade (axe)", async () => {
    const { container } = render(<ProjectForm submitLabel="Criar" onSubmit={vi.fn()} />);
    const results = await axe(container, { rules: { "color-contrast": { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
