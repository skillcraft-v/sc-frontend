import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NovaSkillPage from "@/app/(app)/skills/nova/page";
import { SessionProvider } from "@/lib/auth/session";
import { clearTokens, setTokens } from "@/lib/auth-tokens";
import { server } from "@/test/msw/server";
import { http, HttpResponse, url } from "@/test/msw/handlers";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/skills/nova",
  useSearchParams: () => new URLSearchParams(),
}));

function renderPage() {
  return render(
    <SessionProvider>
      <NovaSkillPage />
    </SessionProvider>,
  );
}

beforeEach(() => {
  clearTokens();
  window.localStorage.clear();
  setTokens({ access_token: "a", refresh_token: "r" });
  server.use(
    http.get(url("/auth/me"), () =>
      HttpResponse.json({ id: "u1", email: "u@x.com", full_name: "U" }),
    ),
  );
});
afterEach(() => cleanup());

describe("NovaSkillPage (smoke)", () => {
  it("renderiza o formulário de criação sem lançar erro", async () => {
    renderPage();
    expect(await screen.findByRole("heading", { name: "Nova skill" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Criar skill" })).toBeInTheDocument();
  });
});
