/**
 * Exclui conta de teste por e-mail (Auth + dados relacionados).
 * Uso: npx tsx scripts/excluir-conta-teste.ts nathalia.gomes1@gmail.com
 *
 * Carrega .env.local. So permite e-mails de teste conhecidos, a menos que
 * FORCE_EXCLUIR_CONTA=1.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const EMAILS_TESTE_PERMITIDOS = new Set([
  "nathalia.gomes1@gmail.com",
  "teste@factoia.com.br",
]);

function carregarEnvLocal() {
  const caminho = resolve(process.cwd(), ".env.local");
  if (!existsSync(caminho)) return;
  for (const linha of readFileSync(caminho, "utf8").split(/\r?\n/)) {
    const t = linha.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const chave = t.slice(0, i).trim();
    let valor = t.slice(i + 1).trim();
    if (
      (valor.startsWith('"') && valor.endsWith('"')) ||
      (valor.startsWith("'") && valor.endsWith("'"))
    ) {
      valor = valor.slice(1, -1);
    }
    if (!process.env[chave]) process.env[chave] = valor;
  }
}

async function main() {
  carregarEnvLocal();
  const emailArg = (process.argv[2] ?? "").trim().toLowerCase();
  if (!emailArg || !emailArg.includes("@")) {
    console.error("Uso: npx tsx scripts/excluir-conta-teste.ts email@dominio.com");
    process.exit(1);
  }

  if (
    !EMAILS_TESTE_PERMITIDOS.has(emailArg) &&
    process.env.FORCE_EXCLUIR_CONTA !== "1"
  ) {
    console.error(
      `E-mail nao esta na lista de teste. Use FORCE_EXCLUIR_CONTA=1 se tiver certeza.`
    );
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    console.error("Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no .env.local");
    process.exit(1);
  }

  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const log: string[] = [];
  const ok = (m: string) => {
    log.push(m);
    console.log("OK:", m);
  };
  const warn = (m: string) => {
    log.push("WARN " + m);
    console.warn("WARN:", m);
  };

  // 1) Perfil
  const { data: perfil } = await admin
    .from("profiles")
    .select("id, email, nome_completo")
    .ilike("email", emailArg)
    .maybeSingle();

  let userId = (perfil?.id as string | undefined) ?? null;
  if (perfil) ok(`perfil encontrado: ${perfil.nome_completo ?? "—"} (${perfil.id})`);
  else warn("nenhum perfil em profiles");

  // 2) Auth user (se perfil nao achou, varre listUsers)
  if (!userId) {
    let page = 1;
    while (page <= 20 && !userId) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw error;
      const hit = data.users.find(
        (u) => (u.email ?? "").toLowerCase() === emailArg
      );
      if (hit) userId = hit.id;
      if (!data.users.length || data.users.length < 200) break;
      page += 1;
    }
  }

  // 3) Assinaturas + pagamentos
  const { data: assinaturas } = await admin
    .from("assinaturas")
    .select("id, mp_preapproval_id, status, plano")
    .ilike("email", emailArg);

  const assinaturaIds = (assinaturas ?? []).map((a) => a.id as string);
  if (assinaturaIds.length) {
    const { error: errPag } = await admin
      .from("pagamentos")
      .delete()
      .in("assinatura_id", assinaturaIds);
    if (errPag) warn(`pagamentos: ${errPag.message}`);
    else ok(`pagamentos removidos (${assinaturaIds.length} assinatura(s))`);

    const { error: errAss } = await admin
      .from("assinaturas")
      .delete()
      .in("id", assinaturaIds);
    if (errAss) warn(`assinaturas: ${errAss.message}`);
    else ok(`assinaturas removidas: ${assinaturaIds.join(", ")}`);
  } else ok("nenhuma assinatura local");

  // 4) Convites
  const { data: convites, error: errConvSel } = await admin
    .from("convites_pagos")
    .select("id")
    .ilike("email", emailArg);
  if (errConvSel) warn(`convites select: ${errConvSel.message}`);
  if ((convites ?? []).length) {
    const { error: errConv } = await admin
      .from("convites_pagos")
      .delete()
      .ilike("email", emailArg);
    if (errConv) warn(`convites: ${errConv.message}`);
    else ok(`convites_pagos removidos: ${(convites ?? []).length}`);
  } else ok("nenhum convite");

  // 5) E-mail eventos (idempotencia)
  const { data: emails } = await admin
    .from("email_eventos")
    .select("id")
    .ilike("destinatario", emailArg);
  const { error: errEm } = await admin
    .from("email_eventos")
    .delete()
    .ilike("destinatario", emailArg);
  if (errEm) warn(`email_eventos destinatario: ${errEm.message}`);
  else ok(`email_eventos (destinatario) removidos: ${(emails ?? []).length}`);

  // tambem remove aviso interno que cita o cliente no assunto
  const { data: emailsAssunto } = await admin
    .from("email_eventos")
    .select("id")
    .ilike("assunto", `%${emailArg}%`);
  if ((emailsAssunto ?? []).length) {
    const { error: errEm2 } = await admin
      .from("email_eventos")
      .delete()
      .ilike("assunto", `%${emailArg}%`);
    if (errEm2) warn(`email_eventos assunto: ${errEm2.message}`);
    else ok(`email_eventos (assunto) removidos: ${(emailsAssunto ?? []).length}`);
  }

  if (userId) {
    // 6) Tabelas por user_id
    for (const tabela of ["aceites_termos", "cota_pecas_ciclo", "pagamentos_extras"] as const) {
      const { error } = await admin.from(tabela).delete().eq("user_id", userId);
      if (error) warn(`${tabela}: ${error.message}`);
      else ok(`${tabela} limpo`);
    }

    const { error: errEmUser } = await admin
      .from("email_eventos")
      .delete()
      .eq("user_id", userId);
    if (errEmUser) warn(`email_eventos user_id: ${errEmUser.message}`);
    else ok("email_eventos por user_id limpo");

    // 7) Profile
    const { error: errProf } = await admin.from("profiles").delete().eq("id", userId);
    if (errProf) warn(`profiles: ${errProf.message}`);
    else ok("perfil removido");

    // 8) Auth
    const { error: errAuth } = await admin.auth.admin.deleteUser(userId);
    if (errAuth) {
      console.error("FALHA auth.deleteUser:", errAuth.message);
      process.exit(1);
    }
    ok(`auth.users removido: ${userId}`);
  } else {
    warn("nenhum usuario Auth encontrado — so dados por e-mail foram limpos");
  }

  console.log("\nConta pronta para reteste:", emailArg);
  console.log("Proximos passos: comprar de novo no MP e validar e-mails + cadastro + termos + admin + JEC.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});