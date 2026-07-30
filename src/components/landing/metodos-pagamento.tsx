function Selo({
  children,
  bg = "bg-white",
}: {
  children: React.ReactNode;
  bg?: string;
}) {
  return (
    <div
      className={`flex h-10 items-center justify-center rounded-md px-2.5 shadow-sm ${bg}`}
    >
      {children}
    </div>
  );
}

function SeloPix() {
  return (
    <Selo>
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
        <path
          fill="#32BCAD"
          d="M5.283 18.36a3.505 3.505 0 0 0 2.493-1.032l3.6-3.6a.684.684 0 0 1 .946 0l3.613 3.613a3.504 3.504 0 0 0 2.493 1.032h.71l-4.56 4.56a3.647 3.647 0 0 1-5.156 0L4.85 18.36ZM18.428 5.627a3.505 3.505 0 0 0-2.493 1.032l-3.613 3.614a.67.67 0 0 1-.946 0l-3.6-3.6A3.505 3.505 0 0 0 5.283 5.64h-.434l4.573-4.572a3.646 3.646 0 0 1 5.156 0l4.559 4.559ZM1.068 9.422 3.79 6.699h1.492a2.483 2.483 0 0 1 1.744.722l3.6 3.6a1.73 1.73 0 0 0 2.443 0l3.614-3.613a2.482 2.482 0 0 1 1.744-.723h1.767l2.737 2.737a3.646 3.646 0 0 1 0 5.156l-2.736 2.736h-1.768a2.482 2.482 0 0 1-1.744-.722l-3.613-3.613a1.77 1.77 0 0 0-2.444 0l-3.6 3.6a2.483 2.483 0 0 1-1.744.722H3.791l-2.723-2.723a3.646 3.646 0 0 1 0-5.156"
        />
      </svg>
      <span className="ml-2 text-base font-semibold text-[#32BCAD]">Pix</span>
    </Selo>
  );
}

function SeloVisa() {
  return (
    <Selo>
      <svg viewBox="0 0 24 24" className="h-8 w-[4.5rem]" aria-hidden>
        <path
          fill="#1A1F71"
          d="M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z"
        />
      </svg>
    </Selo>
  );
}

function SeloMastercard() {
  return (
    <Selo>
      <svg viewBox="0 0 32 20" className="h-8 w-12" aria-hidden>
        <circle cx="12.5" cy="10" r="8" fill="#EB001B" />
        <circle cx="19.5" cy="10" r="8" fill="#F79E1B" />
        <path
          d="M16 4.06A7.98 7.98 0 0113 10a7.98 7.98 0 013 5.94A7.98 7.98 0 0119 10a7.98 7.98 0 01-3-5.94z"
          fill="#FF5F00"
        />
      </svg>
    </Selo>
  );
}

function SeloAmex() {
  return (
    <Selo bg="bg-[#016FD0]">
      <span className="text-sm font-black italic tracking-wide text-white">
        AMEX
      </span>
    </Selo>
  );
}

function SeloElo() {
  return (
    <Selo>
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
        <circle cx="12" cy="12" r="9.5" fill="none" stroke="#000" strokeWidth="1.6" />
        <path d="M7 14.5a7 7 0 0110-8.6" fill="none" stroke="#FFCB05" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M8 17.8a7 7 0 009.6-4.3" fill="none" stroke="#EF4123" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="2.4" fill="#00A4E0" />
      </svg>
      <span className="ml-2 text-base font-black tracking-tight text-stone-900">
        elo
      </span>
    </Selo>
  );
}

export function MetodosPagamento() {
  return (
    <div className="mt-10 flex flex-col items-center gap-4">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-600">
        Formas de pagamento aceitas
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <SeloPix />
        <SeloVisa />
        <SeloMastercard />
        <SeloElo />
        <SeloAmex />
      </div>
    </div>
  );
}
