/**
 * Gera um scaffold de peça (0 tokens de redação) para um job da fila.
 * Usa polo inferido por espécie e fatos exemplo do rito da área (padrões atuais).
 */
import { gerarPecaJec } from "../src/lib/gerar-peca-jec";
import { placeholderFatosPorArea } from "../src/lib/placeholders-por-area";
import { inferirPoloPorEspecie } from "../src/lib/polo-especies-por-area";
import type { JobPecaTeste } from "./testes-pecas-fila";

export function gerarScaffoldJob(job: JobPecaTeste): {
  peca: string;
  vazou9099: boolean;
} {
  const poloInferido = inferirPoloPorEspecie(job.areaId, job.especieId);
  const poloAdvocacia = poloInferido ?? "ativo";

  const exemploFatos = placeholderFatosPorArea(job.areaId, job.especieRotulo)
    .replace(/^Ex\.:\s*/i, "")
    .trim();

  const fatos = [
    `Caso de teste estrutural — ${job.areaTitle} · ${job.especieRotulo}.`,
    `Polo da advocacia no teste: ${poloAdvocacia}.`,
    exemploFatos,
    "Partes fictícias para validação de molde, qualificação e rito — não usar como peça real.",
  ].join(" ");

  const out = gerarPecaJec({
    tipoAcao: job.especieRotulo,
    fatos,
    areaId: job.areaId,
    especiePeca: job.especieId,
    autores: [
      {
        id: "autor-teste-1",
        nomeCompleto: "João da Silva",
        cpf: "529.982.247-25",
        nacionalidade: "brasileiro",
        estadoCivil: "solteiro",
        profissao: "autônomo",
        rgNumero: "12.345.678-9",
        rgUf: "SP",
        cep: "13010-001",
        logradouro: "Rua Teste",
        numero: "100",
        complemento: "",
        bairro: "Centro",
        cidade: "Campinas",
        uf: "SP",
        email: "teste@exemplo.com",
        telefone: "(19) 99999-0000",
      },
    ],
    reus: [
      {
        id: "reu-teste-1",
        tipo: "pj",
        cnpj: "11.222.333/0001-81",
        razaoSocial: "Empresa Exemplo Ltda.",
        nomeFantasia: "Exemplo",
        nomeCompleto: "",
        cpf: "",
        nacionalidade: "",
        estadoCivil: "",
        profissao: "",
        cep: "13010-002",
        logradouro: "Av. Exemplo",
        numero: "200",
        complemento: "",
        bairro: "Centro",
        cidade: "Campinas",
        uf: "SP",
        email: "contato@exemplo.com",
        telefone: "(19) 3333-0000",
      },
    ],
    comarca: {
      cidade: "Campinas",
      uf: "SP",
      numeroJuizado: "2",
      numeroProcesso:
        job.especieId.includes("inicial") ||
        job.especieId === "peticao-inicial"
          ? undefined
          : "0000000-00.2024.8.26.0114",
    },
    provas: [],
    fotos: [],
    midias: [],
    documentos: {},
    baseConhecimento: [],
    tutelaUrgencia: false,
    pedirJusticaGratuita: false,
    temMle: false,
    poloAdvocacia,
  });

  const peca = out.peca ?? "";
  const vazou9099 =
    job.areaId !== "jec" &&
    job.areaId !== "jecr" &&
    /Lei\s*n[ºo°]?\s*9\.?099/i.test(peca);

  return { peca, vazou9099 };
}
