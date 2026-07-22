import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { JobFunnel } from "@/components/jobs/JobFunnel";
import type { JobFunnelCounts } from "@/lib/jobs/use-job-funnel";

const counts: JobFunnelCounts = {
  saved: 12,
  applied: 7,
  interviewing: 3,
  offer: 1,
  rejected: 4,
  accepted: 1,
};

afterEach(() => cleanup());

describe("JobFunnel", () => {
  it("exibe os seis status do funil com a contagem de cada um", () => {
    render(<JobFunnel counts={counts} onSelect={vi.fn()} />);

    const chips = screen.getAllByRole("button");
    expect(chips.map((c) => c.textContent)).toEqual([
      "Salvas12",
      "Aplicadas7",
      "Entrevistando3",
      "Propostas1",
      "Recusadas4",
      "Aceitas1",
    ]);
  });

  it("mostra os chips sem número quando a contagem não está disponível", () => {
    render(<JobFunnel counts={null} onSelect={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Salvas" })).toBeInTheDocument();
    expect(screen.queryByText("12")).not.toBeInTheDocument();
  });

  it("clicar em um chip seleciona aquele status", async () => {
    const onSelect = vi.fn();
    render(<JobFunnel counts={counts} onSelect={onSelect} />);

    await userEvent.click(screen.getByRole("button", { name: "Aplicadas 7" }));

    expect(onSelect).toHaveBeenCalledWith("applied");
  });

  it("clicar no chip já ativo limpa o filtro de status", async () => {
    const onSelect = vi.fn();
    render(<JobFunnel counts={counts} active="applied" onSelect={onSelect} />);

    await userEvent.click(screen.getByRole("button", { name: "Aplicadas 7" }));

    expect(onSelect).toHaveBeenCalledWith(undefined);
  });

  it("marca o chip do status ativo com aria-pressed", () => {
    render(<JobFunnel counts={counts} active="interviewing" onSelect={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Entrevistando 3" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Salvas 12" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
