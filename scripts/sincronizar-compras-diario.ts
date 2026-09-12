/**
 * Rede de segurança local: sync MP → assinaturas → e-mails/ntfy.
 * Uso: npx tsx scripts/sincronizar-compras-diario.ts
 * Agenda: scripts/instalar-tarefa-sincronizar-compras.ps1 (a cada 15 min)
 */
import { config } from "dotenv";
import { resolve } from "path";
import { executarSincronizarCompras } from "../src/lib/mercadopago/sincronizar-compras-job";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const r = await executarSincronizarCompras();
  console.log(JSON.stringify(r, null, 2));
  const falhas = (r.resultados || []).filter(
    (x) => x && typeof x === "object" && "erro" in x
  );
  process.exit(falhas.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
