/**
 * Login page.
 *
 * Server Component with a Client Component form (useActionState + loginAction).
 * Visual reference: design/stitch/login-code.html (Google Stitch).
 *
 * Reference: system-architecture.md §8, §9
 */

import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#0b0b0e] selection:bg-secondary selection:text-black">
      {/* Ambient background (decorative only) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        {/* Ambient emerald glow from center-top */}
        <div className="absolute -top-40 left-1/2 h-[650px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-secondary/12 via-secondary/5 to-transparent blur-[120px]" />
        {/* Deep subtle bottom glow */}
        <div className="absolute -bottom-48 right-1/4 h-[500px] w-[600px] rounded-full bg-secondary/10 blur-[130px]" />
        {/* Delicate tech grid pattern overlay */}
        <div className="bg-mesh-pattern absolute inset-0 opacity-40" />
      </div>

      {/* Top bar */}
      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#19191d] shadow-inner">
            <span className="text-xs font-bold tracking-wider text-secondary">
              RP
            </span>
          </div>
          <div className="text-[13px] font-semibold tracking-wide text-zinc-400">
            PORTAL OFICIAL{" "}
            <span className="mx-1 text-zinc-600">|</span>{" "}
            <span className="text-zinc-300">SISTEMA INTEGRAL DE VENTAS</span>
          </div>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-white/5 bg-[#17171b]/80 px-3 py-1.5 text-xs text-zinc-400 sm:flex">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-secondary" />
          <span className="text-[11px] font-medium tracking-wide">
            RED AUTENTICADA · CONEXIÓN SEGURA
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[440px]">
          {/* Brand crest & header */}
          <div className="mb-8 text-center">
            <div className="group relative mb-5 inline-flex items-center justify-center">
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-secondary/20 to-secondary/10 blur-lg transition duration-500 group-hover:blur-xl" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-b from-[#212126] to-[#141417] p-3.5 shadow-2xl">
                <svg
                  aria-hidden="true"
                  className="h-full w-full text-secondary"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <path d="M4 19h16" />
                  <path d="M4 15l2-8 5 4 1-7 1 7 5-4 2 8H4z" />
                  <circle cx="12" cy="4" fill="currentColor" r="0.75" />
                  <circle cx="6" cy="7" fill="currentColor" r="0.75" />
                  <circle cx="18" cy="7" fill="currentColor" r="0.75" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Royal Prestige
              <sup className="ml-0.5 text-xs font-normal tracking-normal text-secondary">
                ®
              </sup>
            </h1>
            <p className="mt-2 text-sm font-normal text-zinc-400">
              Inicia sesión para continuar a tu portal de gestión
            </p>
          </div>

          {/* Login card */}
          <div className="glass-panel relative overflow-hidden rounded-2xl border border-outline-variant p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)] sm:p-9">
            {/* Top accent highlight line */}
            <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-secondary to-transparent opacity-80" />
            <LoginForm />
          </div>

          {/* Trust note */}
          <div className="mt-6 text-center">
            <p className="text-[11px] tracking-wide text-zinc-500">
              Acceso exclusivo para distribuidores, ejecutivos y red comercial
              autorizada.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-white/5 bg-[#0b0b0e]/90 px-6 py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-center text-xs text-zinc-500 sm:flex-row sm:text-left">
          <span>© 2026 Royal Prestige. Todos los derechos reservados.</span>
          <span className="rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1 font-mono-data text-[11px] text-zinc-400">
            RP v0.1.0
          </span>
        </div>
      </footer>
    </div>
  );
}
