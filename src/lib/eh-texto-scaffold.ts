/**
 * Detecta se o texto ainda é scaffold/prévia (não peça redigida pela IA).
 * Usado para bloquear export e marcar Redigir como falho.
 */
export function ehTextoScaffoldOuReserva(peca: string): boolean {
  const t = peca ?? "";
  return (
    /pr[eé]-?visualiza[cç][aã]o:\s*esta se[cç][aã]o/i.test(t) ||
    /fatos ser[aã]o narrados em ordem cronol[oó]gica na reda[cç][aã]o definitiva/i.test(
      t
    ) ||
    /pe[cç]a de reserva com estrutura forense/i.test(t) ||
    /confira partes, pedidos e endere[cç]amento/i.test(t) ||
    /fundamentação jurídica desta seção será desenvolvida na redação com IA/i.test(
      t
    )
  );
}
