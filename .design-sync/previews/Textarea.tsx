import { Textarea } from "sc-frontend";

export const Padrao = () => (
  <Textarea
    id="descricao"
    label="Descrição da vaga"
    rows={4}
    defaultValue={
      "Buscamos pessoa engenheira de software com experiência em React e Node.js para atuar no time de plataforma."
    }
  />
);

export const Monospace = () => (
  <Textarea
    id="evidencia"
    label="Evidência (código)"
    mono
    rows={4}
    defaultValue={'export function Button({ pending }: ButtonProps) {\n  return <button aria-busy={pending} />;\n}'}
  />
);

export const ComErro = () => (
  <Textarea
    id="resumo"
    label="Resumo profissional"
    rows={3}
    error="O resumo deve ter no máximo 500 caracteres."
    defaultValue="Engenheiro de software com 8 anos de experiência…"
  />
);
