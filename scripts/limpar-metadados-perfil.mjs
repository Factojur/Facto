// Script de correção pontual: remove qualquer "foto_base64" presa em
// user_metadata.perfil_dados da sua conta no Supabase. Esse dado nunca deveria
// estar lá (deveria morar só na tabela `profiles`) e é a causa do erro 431
// (Request Header Fields Too Large) que trava o site.
//
// Como rodar:
//   npm run corrigir-metadados
//
// O script vai pedir seu e-mail e senha de login do FACTO. Ele conecta
// diretamente ao Supabase (sem passar pelo site), então funciona mesmo se o
// site estiver travado.

import { createClient } from "@supabase/supabase-js";
import { createInterface } from "node:readline/promises";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

function carregarEnvLocal() {
  const dir = path.dirname(fileURLToPath(import.meta.url));
  const envPath = path.join(dir, "..", ".env.local");
  try {
    const conteudo = readFileSync(envPath, "utf8");
    for (const linha of conteudo.split("\n")) {
      const match = linha.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match) process.env[match[1]] = match[2].trim();
    }
  } catch {
    // segue sem .env.local; variáveis podem já estar no ambiente
  }
}

async function perguntarSenha(rl, pergunta) {
  // Node não tem "input oculto" nativo simples sem dependências extras;
  // avisamos o usuário que a senha ficará visível no terminal.
  return rl.question(pergunta);
}

async function main() {
  carregarEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error(
      "Não encontrei NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Rode este script na raiz do projeto (onde está o .env.local)."
    );
    process.exit(1);
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });

  console.log("== Correção de metadados de perfil (FACTO) ==");
  console.log(
    "Aviso: a senha digitada aqui ficará visível no terminal (é só local, não é enviada a nada além do Supabase).\n"
  );

  const email = (await rl.question("E-mail de login: ")).trim();
  const senha = await perguntarSenha(rl, "Senha: ");

  const supabase = createClient(url, anonKey);

  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({ email, password: senha });

  if (signInError || !signInData.user) {
    console.error("Falha ao entrar:", signInError?.message ?? "usuário não encontrado");
    rl.close();
    process.exit(1);
  }

  const user = signInData.user;
  const metadataOriginal = user.user_metadata ?? {};
  const tamanhoOriginal = JSON.stringify(metadataOriginal).length;
  console.log(`Tamanho atual de user_metadata: ~${Math.round(tamanhoOriginal / 1024)} KB`);

  // Remove QUALQUER chave "foto_base64", em qualquer nível do objeto — a foto
  // pode ter ficado presa direto na raiz (versões antigas do código) e/ou
  // dentro de perfil_dados (versão intermediária).
  let removidas = 0;
  function limpar(obj) {
    if (!obj || typeof obj !== "object") return obj;
    const copia = Array.isArray(obj) ? [...obj] : { ...obj };
    for (const chave of Object.keys(copia)) {
      if (chave === "foto_base64") {
        const tamanho = String(copia[chave] ?? "").length;
        console.log(`  - removendo "${chave}" (~${Math.round(tamanho / 1024)} KB)`);
        delete copia[chave];
        removidas += 1;
      } else if (copia[chave] && typeof copia[chave] === "object") {
        copia[chave] = limpar(copia[chave]);
      }
    }
    return copia;
  }

  const metadataLimpo = limpar(metadataOriginal);

  if (removidas === 0) {
    console.log("Nenhuma foto presa encontrada em user_metadata. Sua conta já está limpa.");
    await supabase.auth.signOut();
    rl.close();
    return;
  }

  const tamanhoNovo = JSON.stringify(metadataLimpo).length;
  console.log(`Novo tamanho após limpeza: ~${Math.round(tamanhoNovo / 1024)} KB. Enviando atualização...`);

  // Chamada direta (sem passar pelo cliente supabase-js) para conseguirmos
  // ver o status HTTP e o corpo bruto da resposta em caso de erro.
  const accessToken = signInData.session?.access_token;
  const respostaBruta = await fetch(`${url}/auth/v1/user`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ data: metadataLimpo }),
  });

  const textoResposta = await respostaBruta.text();

  if (!respostaBruta.ok) {
    console.error(`Falha ao atualizar. Status HTTP: ${respostaBruta.status} ${respostaBruta.statusText}`);
    console.error("Corpo da resposta (primeiros 500 caracteres):");
    console.error(textoResposta.slice(0, 500));
    rl.close();
    process.exit(1);
  }

  console.log("Pronto! Metadado limpo. O cookie de sessão deve voltar ao tamanho normal.");

  await supabase.auth.signOut();
  rl.close();
}

main();
