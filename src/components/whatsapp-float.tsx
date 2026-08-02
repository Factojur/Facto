"use client";

import { usePathname } from "next/navigation";

const WHATSAPP_URL =
  "https://wa.me/5511985036364?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20com%20o%20FACTO";

/** Rotas autenticadas onde o suporte pode aparecer (não exibe na landing/login). */
const ROTAS_PERMITIDAS = [/^\/dashboard\/?$/, /^\/dashboard\/jec(\/|$)/];

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16.04 3C9.39 3 4 8.34 4 14.92c0 2.1.56 4.15 1.62 5.96L4 29l8.35-2.18a12.1 12.1 0 0 0 3.69.57h.01c6.65 0 12.04-5.34 12.04-11.92C28.09 8.34 22.7 3 16.04 3zm0 21.78h-.01a10 10 0 0 1-5.1-1.4l-.37-.22-4.95 1.3 1.32-4.82-.24-.39a9.86 9.86 0 0 1-1.52-5.33c0-5.45 4.49-9.89 10.02-9.89 5.53 0 10.02 4.44 10.02 9.89 0 5.46-4.49 9.9-10.02 9.9zm5.5-7.41c-.3-.15-1.78-.88-2.06-.98-.27-.1-.47-.15-.67.15-.2.3-.77.98-.95 1.18-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.17-1.43-.07-.12-.27-.2-.57-.35z" />
    </svg>
  );
}

/**
 * Botão flutuante 3D no verde oliva da marca (facto-dark / facto-gold).
 * Só em /dashboard (home) e /dashboard/jec — evita expor o número na landing.
 */
export function WhatsAppFloat() {
  const pathname = usePathname();
  const visivel = ROTAS_PERMITIDAS.some((re) => re.test(pathname));

  if (!visivel) return null;

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com o suporte do FACTO no WhatsApp"
      title="Suporte no WhatsApp"
      className="group fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#6e6a52] via-[#3f3e32] to-facto-dark text-facto-gold shadow-[0_10px_24px_rgba(28,28,22,0.55),0_2px_0_rgba(144,139,106,0.35),inset_0_2px_6px_rgba(255,255,255,0.22),inset_0_-4px_10px_rgba(0,0,0,0.45)] ring-1 ring-facto-gold/45 transition duration-200 hover:scale-110 hover:from-[#8a8466] hover:via-[#4a4838] hover:to-[#12120e] hover:shadow-[0_14px_32px_rgba(144,139,106,0.45),0_2px_0_rgba(144,139,106,0.5),inset_0_2px_8px_rgba(255,255,255,0.28),inset_0_-4px_10px_rgba(0,0,0,0.5)] hover:ring-facto-gold/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-facto-gold active:scale-105"
    >
      {/* Brilho superior “3D” */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-2 top-1 h-4 rounded-full bg-gradient-to-b from-white/35 to-transparent opacity-80"
      />
      <WhatsAppIcon className="relative h-7 w-7 drop-shadow-[0_2px_2px_rgba(0,0,0,0.45)] transition group-hover:scale-105" />
      <span className="sr-only">Abrir WhatsApp de suporte</span>
    </a>
  );
}
