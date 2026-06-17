export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <div className="flex flex-col items-center gap-3">
        <span className="rounded-full border border-foreground/30 px-3 py-1 text-xs font-medium tracking-wide text-foreground/80">
          MVP · em construção
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">SkillCraft</h1>
        <p className="max-w-md text-balance text-foreground/80">
          Adaptação inteligente de currículos. As telas de autenticação, skills, carreira, vagas e o
          fluxo de adaptação chegam nas próximas entregas.
        </p>
      </div>
      <p className="text-sm text-foreground/80">
        Frontend Next.js consumindo a API do{" "}
        <code className="rounded bg-foreground/10 px-1.5 py-0.5 font-mono text-xs">sc-api</code>.
      </p>
    </main>
  );
}
