import { Header, SessionProvider } from "sc-frontend";

export const Padrao = () => (
  <SessionProvider>
    <Header />
  </SessionProvider>
);
