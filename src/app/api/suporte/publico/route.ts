import { NextResponse } from "next/server";
import {
  enviarEmailSuporte,
  isAssuntoSuporte,
} from "@/lib/email/suporte";
import { verificarLimiteSuportePublico } from "@/lib/email/eventos";
import { apenasDigitos } from "@/lib/mascaras-endereco";

function emailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * POST /api/suporte/publico
 * Formulário aberto (sem login) — exige nome, e-mail e celular.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const dados = body as {
    assunto?: unknown;
    mensagem?: unknown;
    nome?: unknown;
    email?: unknown;
    telefone?: unknown;
  };

  const nome = typeof dados.nome === "string" ? dados.nome.trim() : "";
  const email =
    typeof dados.email === "string" ? dados.email.trim().toLowerCase() : "";
  const telefone =
    typeof dados.telefone === "string" ? dados.telefone.trim() : "";
  const mensagem =
    typeof dados.mensagem === "string" ? dados.mensagem.trim() : "";

  if (nome.length < 2) {
    return NextResponse.json(
      { error: "Informe seu nome completo." },
      { status: 400 }
    );
  }
  if (!emailValido(email)) {
    return NextResponse.json(
      { error: "Informe um e-mail válido para retorno." },
      { status: 400 }
    );
  }

  const digitosTel = apenasDigitos(telefone);
  if (digitosTel.length < 10 || digitosTel.length > 11) {
    return NextResponse.json(
      { error: "Informe um celular válido com DDD (10 ou 11 dígitos)." },
      { status: 400 }
    );
  }

  if (!isAssuntoSuporte(dados.assunto)) {
    return NextResponse.json(
      { error: "Selecione um assunto válido." },
      { status: 400 }
    );
  }

  if (mensagem.length < 10) {
    return NextResponse.json(
      { error: "Descreva a situação com pelo menos 10 caracteres." },
      { status: 400 }
    );
  }
  if (mensagem.length > 8000) {
    return NextResponse.json(
      { error: "Mensagem longa demais (máx. 8000 caracteres)." },
      { status: 400 }
    );
  }

  const limite = await verificarLimiteSuportePublico(email);
  if (!limite.ok) {
    return NextResponse.json(
      {
        error: `Limite de mensagens atingido. Aguarde cerca de ${limite.retryAfterMin} minutos antes de enviar outra.`,
      },
      { status: 429 }
    );
  }

  try {
    const resultado = await enviarEmailSuporte({
      assunto: dados.assunto,
      mensagem,
      emailUsuario: email,
      nomeUsuario: nome,
      telefoneUsuario: telefone,
      userId: null,
      origemPublica: true,
    });

    return NextResponse.json({
      ok: true,
      destino: resultado.destino,
      mensagem:
        "Mensagem enviada. Em breve a equipe do FACTO responderá no e-mail informado.",
    });
  } catch (erro) {
    console.error("[api/suporte/publico]", erro);
    return NextResponse.json(
      {
        error:
          erro instanceof Error
            ? erro.message
            : "Não foi possível enviar a mensagem.",
      },
      { status: 500 }
    );
  }
}
