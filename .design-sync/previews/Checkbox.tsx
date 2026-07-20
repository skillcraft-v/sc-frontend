import { Checkbox } from "sc-frontend";

export const Padrao = () => <Checkbox id="ativa" label="Skill ativa" />;

export const Marcado = () => (
  <Checkbox id="destaque" label="Destacar no currículo" defaultChecked />
);

export const Desabilitado = () => (
  <Checkbox id="bloqueado" label="Sincronizado automaticamente" disabled defaultChecked />
);
