export function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

/** (00) 00000-0000 — celular com 11 dígitos */
export function formatarTelefone(valor: string): string {
  const d = apenasDigitos(valor).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function formatarCep(valor: string): string {
  const d = apenasDigitos(valor).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export type EnderecoViaCep = {
  cep: string;
  endereco: string;
  bairro: string;
  cidade: string;
  uf: string;
};

export async function buscarEnderecoPorCep(
  cep: string
): Promise<EnderecoViaCep | null> {
  const digitos = apenasDigitos(cep);
  if (digitos.length !== 8) return null;

  const res = await fetch(`https://viacep.com.br/ws/${digitos}/json/`);
  if (!res.ok) return null;

  const data = await res.json();
  if (data.erro) return null;

  return {
    cep: formatarCep(data.cep ?? digitos),
    endereco: data.logradouro ?? "",
    bairro: data.bairro ?? "",
    cidade: data.localidade ?? "",
    uf: data.uf ?? "",
  };
}
