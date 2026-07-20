import { Button } from "sc-frontend";

export const Padrao = () => <Button type="submit">Salvar skill</Button>;

export const Enviando = () => (
  <Button type="submit" pending>
    Salvar skill
  </Button>
);

export const EnviandoComLabel = () => (
  <Button type="submit" pending pendingLabel="Adaptando currículo…">
    Adaptar currículo
  </Button>
);

export const Desabilitado = () => (
  <Button type="button" disabled>
    Baixar PDF
  </Button>
);
