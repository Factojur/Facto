"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

/** Drawer lateral via portal no body — evita corte por overflow/transform dos pais. */
export function PainelLateralPortal({
  aberto,
  onFechar,
  ariaLabel,
  maxWidthClass = "max-w-md",
  children,
}: {
  aberto: boolean;
  onFechar: () => void;
  ariaLabel: string;
  maxWidthClass?: string;
  children: React.ReactNode;
}) {
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  useEffect(() => {
    if (!aberto) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onFechar();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [aberto, onFechar]);

  if (!aberto || !montado) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Fechar"
        onClick={onFechar}
      />
      <aside
        className={`relative flex h-dvh max-h-dvh w-full ${maxWidthClass} flex-col bg-white shadow-xl`}
      >
        {children}
      </aside>
    </div>,
    document.body
  );
}
