/**
 * Memória de cliente: local + sync opcional na nuvem (LGPD).
 */

import {
  salvarPerfilCliente,
  type PerfilClienteSalvo,
  buscarPerfilCliente,
  listarPerfisRecentes,
  mesclarPerfilLocal,
} from "@/lib/memoria-cliente-local";
import type { AutorValue } from "@/lib/autor-types";
import type { ReuValue } from "@/lib/reu-types";
import type { PoloAdvocacia } from "@/lib/polo-advocacia";
import {
  puxarMemoriaClientesNuvem,
  sincronizarMemoriaClienteNuvem,
} from "@/lib/sync-nuvem-client";
import { lerOptInSyncNuvemChat } from "@/lib/chat-minuta-storage";

export { buscarPerfilCliente, listarPerfisRecentes };

export function salvarPerfilClienteLocal(params: {
  autores: AutorValue[];
  reus: ReuValue[];
  polo: PoloAdvocacia;
}): PerfilClienteSalvo | null {
  return salvarPerfilCliente(params);
}

/** Grava local e, se opt-in ativo, replica na nuvem (fire-and-forget). */
export function salvarPerfilClienteComSync(params: {
  autores: AutorValue[];
  reus: ReuValue[];
  polo: PoloAdvocacia;
  syncNuvem?: boolean;
}): PerfilClienteSalvo | null {
  const perfil = salvarPerfilCliente(params);
  const sync = params.syncNuvem ?? lerOptInSyncNuvemChat();
  if (perfil && sync) {
    void sincronizarMemoriaClienteNuvem(perfil);
  }
  return perfil;
}

/** Puxa perfis da nuvem e mescla no localStorage (mais recente vence). */
export async function hidratarMemoriaClientesDaNuvem(): Promise<number> {
  if (!lerOptInSyncNuvemChat()) return 0;
  const remotos = await puxarMemoriaClientesNuvem();
  let n = 0;
  for (const p of remotos) {
    mesclarPerfilLocal(p);
    n += 1;
  }
  return n;
}
