import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col items-center justify-center gap-3 px-5 text-center">
      <p className="text-[40px] font-semibold tracking-tight text-faint">404</p>
      <h1 className="text-[17px] font-medium">Tāda lapa neeksistē</h1>
      <Link
        href="/"
        className="text-[14px] text-[var(--accent)] underline-offset-4 hover:underline"
      >
        Atgriezties uz sarakstu
      </Link>
    </main>
  );
}
