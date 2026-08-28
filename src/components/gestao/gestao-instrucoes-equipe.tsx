import { GestaoPainel } from "@/components/gestao/gestao-ui";

type Props = {
  /** Mostra passos para quem vai aceitar o convite (colaborador/estagiário). */
  variante?: "admin" | "convidado";
};

export function GestaoInstrucoesEquipe({ variante = "admin" }: Props) {
  if (variante === "convidado") {
    return (
      <GestaoPainel titulo="Como entrar no escritório">
        <ol className="list-decimal space-y-3 pl-5 text-sm text-stone-300">
          <li>
            Abra o <strong className="text-white">link de convite</strong> que o
            administrador enviou (WhatsApp, e-mail etc.).
          </li>
          <li>
            Faça login com <strong className="text-white">Google</strong> ou o
            e-mail/senha da <strong className="text-white">sua conta</strong> —
            não use a conta do administrador.
          </li>
          <li>
            Se pedir, informe o <strong className="text-white">código</strong>{" "}
            de 6 caracteres que veio junto com o link.
          </li>
          <li>
            Toque em <strong className="text-white">Aceitar convite</strong>.
            Você entrará como colaborador com acesso ao FACTO Gestão.
          </li>
        </ol>
        <p className="mt-4 rounded-lg border border-stone-800 bg-stone-950/60 px-3 py-2 text-xs text-stone-500">
          Este módulo é independente — use a conta indicada pelo administrador
          do escritório.
        </p>
      </GestaoPainel>
    );
  }

  return (
    <GestaoPainel titulo="Como cadastrar sócios, colaboradores e estagiários">
      <div className="space-y-4 text-sm text-stone-300">
        <section>
          <h3 className="font-medium text-white">Quem é o administrador?</h3>
          <p className="mt-1 text-stone-400">
            Quem <strong className="text-stone-300">cria o escritório</strong>{" "}
            (titular com OAB informada) é o administrador. Só ele gera convites
            e vê limites do plano.
          </p>
        </section>

        <section>
          <h3 className="font-medium text-white">
            Sócio, advogado associado ou estagiário
          </h3>
          <p className="mt-1 text-stone-400">
            No FACTO Gestão o convidado entra como{" "}
            <em>colaborador</em>. O titular pode promover a{" "}
            <strong className="text-stone-300">sócio</strong> em Equipe — sócios
            veem honorários contratados; colaboradores e estagiários não.
          </p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-stone-400">
            <li>
              Clique em <strong className="text-stone-300">Gerar link de convite</strong>.
            </li>
            <li>
              Envie o <strong className="text-stone-300">link</strong> e o{" "}
              <strong className="text-stone-300">código</strong> para a pessoa
              (os dois juntos evitam uso indevido).
            </li>
            <li>
              A pessoa abre o link, faz login na{" "}
              <strong className="text-stone-300">própria conta FACTO</strong> e
              aceita o convite.
            </li>
            <li>
              Pronto — ela passa a ver o escritório em{" "}
              <strong className="text-stone-300">Equipe</strong> e nas demais
              telas.
            </li>
          </ol>
        </section>

        <section>
          <h3 className="font-medium text-white">Boas práticas</h3>
          <ul className="mt-1 list-inside list-disc space-y-1 text-stone-400">
            <li>
              <strong className="text-stone-300">Estagiário:</strong> convide o
              e-mail pessoal ou institucional do estagiário — nunca compartilhe
              login.
            </li>
            <li>
              <strong className="text-stone-300">Sócio:</strong> use o e-mail
              profissional dele; se precisar de minutas, ele assina o plano
              FACTO de peças à parte.
            </li>
            <li>
              Cada convite vale <strong className="text-stone-300">14 dias</strong>{" "}
              e é de uso único. Gere outro se expirar.
            </li>
          </ul>
        </section>
      </div>
    </GestaoPainel>
  );
}
