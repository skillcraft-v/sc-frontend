import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CareerSection } from "@/components/career/CareerSection";

afterEach(() => cleanup());

function renderSection(overrides: Partial<Parameters<typeof CareerSection>[0]> = {}) {
  return render(
    <CareerSection
      title="Formação"
      status="success"
      isEmpty={false}
      emptyLabel="Nenhuma formação ainda."
      onReload={vi.fn()}
      renderAddForm={() => <p>form</p>}
      {...overrides}
    >
      <li>linha</li>
    </CareerSection>,
  );
}

describe("CareerSection", () => {
  it("carregando pela primeira vez (sem itens), mostra o indicador e nenhuma linha", () => {
    renderSection({ status: "loading", isEmpty: true, children: null });

    expect(screen.getByRole("status")).toHaveTextContent("Carregando…");
    expect(screen.queryByText("linha")).not.toBeInTheDocument();
  });

  it("erro sem itens carregados, mostra alerta com ação de retry", async () => {
    const onReload = vi.fn();
    renderSection({ status: "error", isEmpty: true, children: null, onReload });

    await userEvent.setup().click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(onReload).toHaveBeenCalled();
  });

  it("sucesso vazio, mostra o rótulo de lista vazia", () => {
    renderSection({ status: "success", isEmpty: true, children: null });

    expect(screen.getByText("Nenhuma formação ainda.")).toBeInTheDocument();
  });

  it("sucesso com itens, renderiza as linhas dentro do card", () => {
    renderSection();

    expect(screen.getByText("linha")).toBeInTheDocument();
  });

  it("reload (ex.: após criar/editar/excluir) mantém as linhas visíveis em vez de trocar por 'Carregando…'", () => {
    renderSection({ status: "loading", isEmpty: false });

    expect(screen.getByText("linha")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("reload que falha com itens já carregados mostra o alerta sem esconder as linhas", () => {
    renderSection({ status: "error", isEmpty: false });

    expect(screen.getByText("linha")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("clicar em '+ Adicionar' revela o form e troca o rótulo para 'Cancelar'", async () => {
    renderSection();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "+ Adicionar" }));
    expect(screen.getByText("form")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
  });
});
