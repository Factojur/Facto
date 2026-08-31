"use client";

import Link from "next/link";
import { JurisCasoSection } from "@/components/dashboard/juris-caso-form";
import { ProvasDoFatoSection } from "@/components/dashboard/provas-do-fato-section";
import { ValoresCausaSection } from "@/components/dashboard/valores-causa-form";
import { SyncNuvemOptInControl } from "@/components/dashboard/sync-nuvem-opt-in-control";
import type { EstadoCasoChat } from "@/lib/chat-minuta";
import { lerOptInSyncNuvemChat } from "@/lib/chat-minuta-storage";

type Props = {
  estado: EstadoCasoChat;
  onChange: (patch: Partial<EstadoCasoChat>) => void;
  leigo?: boolean;
  syncNuvemOptIn?: boolean;
  onSyncNuvemOptInChange?: (v: boolean) => void;
};

export function ChatComplementosSection({
  estado,
  onChange,
  leigo,
  syncNuvemOptIn = lerOptInSyncNuvemChat(),
  onSyncNuvemOptInChange,
}: Props) {
  function toggleSync(v: boolean) {
    onSyncNuvemOptInChange?.(v);
  }

  return (
    <div className="space-y-6">
      <ProvasDoFatoSection
        provas={estado.provasCaso}
        onProvasChange={(provasCaso) => onChange({ provasCaso })}
        linkNuvem={estado.linkNuvem}
        onLinkNuvemChange={(linkNuvem) => onChange({ linkNuvem })}
        midiasNomes={estado.midiasNomes}
        onMidiasChange={(midiasNomes) => onChange({ midiasNomes })}
        mostrarMidiasOpcionais={estado.mostrarMidiasOpcionais}
        onMostrarMidiasChange={(mostrarMidiasOpcionais) =>
          onChange({ mostrarMidiasOpcionais })
        }
      />

      <JurisCasoSection
        value={estado.jurisCaso}
        onChange={(jurisCaso) => onChange({ jurisCaso })}
      />

      <p className="rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-xs text-amber-950">
        <strong>Jurisprudência do caso:</strong> cole a ementa ou anexe o PDF do
        acórdão aqui. Isso entra na verificação junto com a base FACTO (mesmo
        filtro de lastro). A base curada também pode sugerir julgados na redação
        — o anexo do caso tem prioridade de citação quando pertinente.
      </p>

      <ValoresCausaSection
        value={estado.valoresCausa}
        onChange={(valoresCausa) => onChange({ valoresCausa })}
        comAdvogado={!leigo}
        tituloSecao="Valores da causa (opcional)"
        textoAjuda="Mesma planilha do formulário completo — entra no pedido e no valor da causa."
      />

      <section className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
        <h4 className="text-sm font-semibold text-slate-900">Lei municipal (opcional)</h4>
        <p className="mt-1 text-xs text-slate-600">
          Cole o texto da norma municipal pertinente (título + artigos). Não é
          upload de PDF aqui — use o texto oficial ou o trecho que vai embasar o
          pedido. Isso alimenta a peça e o painel de citações.
        </p>
        <label className="mt-3 block text-xs font-medium text-slate-600">
          Título / identificação
          <input
            type="text"
            value={estado.leiMunicipalTitulo}
            onChange={(e) => onChange({ leiMunicipalTitulo: e.target.value })}
            placeholder="Ex.: Lei municipal 12.345/2020 — IPTU"
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
          />
        </label>
        <label className="mt-3 block text-xs font-medium text-slate-600">
          Texto da norma
          <textarea
            value={estado.leiMunicipalTexto}
            onChange={(e) => onChange({ leiMunicipalTexto: e.target.value })}
            rows={5}
            placeholder="Cole aqui os artigos aplicáveis…"
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
          />
        </label>
      </section>

      <SyncNuvemOptInControl optIn={syncNuvemOptIn} onChange={toggleSync} />
    </div>
  );
}
