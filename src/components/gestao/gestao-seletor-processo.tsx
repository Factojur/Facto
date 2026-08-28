"use client";

import { useEffect, useState } from "react";
import { GESTAO_SELECT } from "@/components/gestao/gestao-ui";

type ProcessoOpcao = {
  id: string;
  numero: string;
  cliente: string;
};

export function GestaoSeletorProcesso({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (processoId: string) => void;
  className?: string;
}) {
  const [processos, setProcessos] = useState<ProcessoOpcao[]>([]);

  useEffect(() => {
    void fetch("/api/gestao/processos")
      .then((r) => r.json())
      .then((data: { processos?: ProcessoOpcao[] }) => {
        setProcessos(data.processos ?? []);
      });
  }, []);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className ?? GESTAO_SELECT}
    >
      <option value="">Sem vínculo com pasta</option>
      {processos.map((p) => (
        <option key={p.id} value={p.id}>
          {p.cliente}
          {p.numero ? ` · ${p.numero}` : ""}
        </option>
      ))}
    </select>
  );
}
