import { Select } from "sc-frontend";

const NIVEIS = [
  { value: "beginner", label: "Iniciante" },
  { value: "intermediate", label: "Intermediário" },
  { value: "advanced", label: "Avançado" },
  { value: "expert", label: "Especialista" },
];

export const Padrao = () => (
  <Select id="nivel" label="Nível de proficiência" options={NIVEIS} defaultValue="intermediate" />
);

export const ComPlaceholder = () => (
  <Select id="filtro-nivel" label="Filtrar por nível" options={NIVEIS} placeholder="Todos" />
);

export const ComErro = () => (
  <Select
    id="idioma"
    label="Idioma do currículo"
    options={[
      { value: "pt", label: "Português" },
      { value: "en", label: "Inglês" },
    ]}
    placeholder="Selecione…"
    error="Selecione um idioma."
  />
);
