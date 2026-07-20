import { Alert } from "sc-frontend";

export const Erro = () => <Alert>Não foi possível salvar a skill. Tente novamente.</Alert>;

export const ErroDeSessao = () => (
  <Alert>Sua sessão expirou. Faça login novamente para continuar.</Alert>
);

export const ErroLongo = () => (
  <Alert>
    A adaptação do currículo falhou: o serviço de geração de PDF está temporariamente
    indisponível. Suas alterações foram preservadas — tente novamente em alguns minutos.
  </Alert>
);
