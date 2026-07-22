import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CareerRow } from "@/components/career/CareerRow";

afterEach(() => cleanup());

describe("CareerRow", () => {
  it("mostra título, subtítulo e período", () => {
    render(
      <ul>
        <CareerRow
          title="Mestrado em Ciência da Computação"
          subtitle="Universidade de São Paulo"
          period="2018 – 2020"
        />
      </ul>,
    );

    expect(screen.getByText("Mestrado em Ciência da Computação")).toBeInTheDocument();
    expect(screen.getByText("Universidade de São Paulo")).toBeInTheDocument();
    expect(screen.getByText("2018 – 2020")).toBeInTheDocument();
  });

  it("sem descrição, não renderiza o parágrafo opcional", () => {
    render(
      <ul>
        <CareerRow title="AWS SAA" subtitle="Amazon" period="2024" />
      </ul>,
    );

    expect(screen.queryByText(/liderou/i)).not.toBeInTheDocument();
  });

  it("com descrição, exibe o texto adicional (usado por Projetos)", () => {
    render(
      <ul>
        <CareerRow
          title="Plataforma de pagamentos"
          subtitle="Node.js · Kafka"
          description="Liderou squad de 6 pessoas."
          period="2023 – 2025"
        />
      </ul>,
    );

    expect(screen.getByText("Liderou squad de 6 pessoas.")).toBeInTheDocument();
  });

  it("com titleHref, o título é um link para o destino informado", () => {
    render(
      <ul>
        <CareerRow
          title="Migração para Kubernetes"
          subtitle="K8s · Terraform"
          period="2022"
          titleHref="/carreira/projetos/p1"
        />
      </ul>,
    );

    expect(screen.getByRole("link", { name: "Migração para Kubernetes" })).toHaveAttribute(
      "href",
      "/carreira/projetos/p1",
    );
  });

  it("sem titleHref, o título é apenas texto (sem link)", () => {
    render(
      <ul>
        <CareerRow title="MBA em IA" subtitle="USP" period="2022" />
      </ul>,
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renderiza as ações passadas (Editar/Excluir)", () => {
    render(
      <ul>
        <CareerRow
          title="CKA"
          subtitle="CNCF"
          period="2023"
          actions={<button>Excluir certificação CKA</button>}
        />
      </ul>,
    );

    expect(screen.getByRole("button", { name: "Excluir certificação CKA" })).toBeInTheDocument();
  });

  it("o marcador decorativo (dot) é oculto de leitores de tela", () => {
    const { container } = render(
      <ul>
        <CareerRow title="MBA em IA" subtitle="USP" period="2022" />
      </ul>,
    );

    expect(container.querySelector("[aria-hidden='true']")).toBeInTheDocument();
  });
});
