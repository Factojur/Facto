export type AreaAtuacao = {
  id: string;
  title: string;
  description: string;
  law?: string;
  href?: string;
  available: boolean;
  icon: string;
};

export const AREAS_ATUACAO: AreaAtuacao[] = [
  {
    id: "jec",
    title: "Juizado Especial Cível",
    description:
      "Petições iniciais, execuções, embargos e recursos com base na Lei 9.099/95 e jurisprudência dos Juizados.",
    law: "Lei nº 9.099/95",
    href: "/dashboard/jec",
    available: true,
    icon: "⚖️",
  },
  {
    id: "trabalhista",
    title: "Trabalhista",
    description:
      "Reclamações, recursos e acordos na Justiça do Trabalho, com fundamentação na CLT.",
    law: "CLT",
    available: false,
    icon: "👷",
  },
  {
    id: "criminal",
    title: "Criminal",
    description:
      "Peças de habeas corpus, resposta à acusação, memoriais e recursos criminais.",
    available: false,
    icon: "🛡️",
  },
  {
    id: "empresarial",
    title: "Empresarial",
    description:
      "Contratos, notificações extrajudiciais e ações societárias para pessoas jurídicas.",
    available: false,
    icon: "🏢",
  },
];

export const IDS_AREAS_VALIDAS = new Set(AREAS_ATUACAO.map((a) => a.id));

export function getAreaById(id: string): AreaAtuacao | undefined {
  return AREAS_ATUACAO.find((a) => a.id === id);
}

export function filtrarFavoritosValidos(favoritos: string[] | null | undefined): string[] {
  if (!favoritos?.length) return [];
  return favoritos.filter((id) => IDS_AREAS_VALIDAS.has(id));
}
