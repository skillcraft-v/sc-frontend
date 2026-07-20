import { Field } from "sc-frontend";

export const Padrao = () => (
  <Field id="titulo" label="Título da vaga" placeholder="Ex.: Engenheiro de Software Sênior" />
);

export const Preenchido = () => (
  <Field id="empresa" label="Empresa" defaultValue="Acme Tecnologia S.A." />
);

export const ComErro = () => (
  <Field
    id="email"
    label="E-mail"
    type="email"
    defaultValue="victor@exemplo"
    error="Informe um e-mail válido."
  />
);

export const Senha = () => (
  <Field id="senha" label="Senha" type="password" defaultValue="••••••••" />
);
