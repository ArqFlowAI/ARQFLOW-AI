import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-brand-bg px-6 py-12 dark:bg-brand-black">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-beige/30 via-transparent to-brand-light/10" />
      <div className="absolute -left-32 top-20 h-64 w-64 rounded-full bg-brand-beige/40 blur-3xl" />
      <div className="absolute -right-32 bottom-20 h-64 w-64 rounded-full bg-brand-light/20 blur-3xl" />

      <div className="relative w-full max-w-md">{children}</div>

      <Link
        href="/"
        className="relative mt-8 text-sm text-brand-dark/60 hover:text-brand-dark hover:underline"
      >
        ← Voltar ao site
      </Link>
    </div>
  );
}
