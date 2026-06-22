import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EducationForm } from "@/components/career/EducationForm";
import { CertificationForm } from "@/components/career/CertificationForm";
import { ApiError } from "@/lib/api";
import type { CertificationInput, EducationInput } from "@/lib/career/types";

afterEach(() => cleanup());

describe("EducationForm", () => {
  it("cria formação com sucesso", async () => {
    const onSubmit = vi.fn<(i: EducationInput) => Promise<void>>().mockResolvedValue();
    render(<EducationForm submitLabel="Adicionar" onSubmit={onSubmit} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Instituição"), "USP");
    await user.type(screen.getByLabelText("Curso / grau"), "MBA em IA");
    fireEvent.change(screen.getByLabelText("Início"), { target: { value: "2022-01-01" } });
    await user.click(screen.getByRole("button", { name: "Adicionar" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0]![0]).toMatchObject({ institution: "USP", degree: "MBA em IA" });
  });
});

describe("CertificationForm", () => {
  it("INVALID_DATE_RANGE (expira antes de emitida) mostra mensagem pt-BR", async () => {
    const onSubmit = vi
      .fn<(i: CertificationInput) => Promise<void>>()
      .mockRejectedValue(new ApiError({ code: "INVALID_DATE_RANGE", message: "x", status: 400 }));
    render(<CertificationForm submitLabel="Adicionar" onSubmit={onSubmit} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Nome"), "AWS SAA");
    await user.type(screen.getByLabelText("Emissor"), "Amazon");
    fireEvent.change(screen.getByLabelText("Emitida em"), { target: { value: "2024-01-01" } });
    fireEvent.change(screen.getByLabelText("Expira em"), { target: { value: "2023-01-01" } });
    await user.click(screen.getByRole("button", { name: "Adicionar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/data de término/i);
  });
});
