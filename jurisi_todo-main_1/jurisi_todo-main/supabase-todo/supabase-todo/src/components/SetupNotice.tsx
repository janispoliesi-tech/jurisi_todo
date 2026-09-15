const STEPS = [
  {
    title: "Pievieno Supabase Vercel projektam",
    body: 'Vercel → tavs projekts → Storage → Create Database → Supabase. Nosaukums: "supabase-todo". Integrācija pati ieliks vides mainīgos.',
  },
  {
    title: "Palaid datubāzes shēmu",
    body: "Supabase → SQL Editor → ielīmē supabase/schema.sql saturu → Run.",
  },
  {
    title: "Pārpublicē projektu",
    body: "Vercel → Deployments → Redeploy, lai jaunie vides mainīgie nonāk līdz aplikācijai.",
  },
];

export default function SetupNotice() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-5 py-12">
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-sm)]">
        <h1 className="text-[20px] font-semibold tracking-tight">
          Vēl jāpieslēdz datubāze
        </h1>
        <p className="mt-1.5 text-[14px] leading-relaxed text-muted">
          Aplikācija nevar atrast Supabase vides mainīgos{" "}
          <code className="rounded bg-surface-2 px-1 py-0.5 text-[12.5px]">
            NEXT_PUBLIC_SUPABASE_URL
          </code>{" "}
          un{" "}
          <code className="rounded bg-surface-2 px-1 py-0.5 text-[12.5px]">
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </code>
          .
        </p>

        <ol className="mt-5 space-y-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-[12px] font-semibold text-[var(--accent-contrast)]">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-[14px] font-medium">{step.title}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-muted">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-6 border-t border-line pt-4 text-[13px] text-muted">
          Lokālai izstrādei nokopē <code>.env.example</code> uz{" "}
          <code>.env.local</code> un ieraksti tur tās pašas vērtības.
        </p>
      </div>
    </main>
  );
}
