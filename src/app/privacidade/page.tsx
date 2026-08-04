import type { Metadata } from "next";
import { LegalShell } from "@/components/legal/legal-shell";

export const metadata: Metadata = {
  title: "Privacidade — FACTO",
  description:
    "Política de Privacidade do FACTO: tratamento de dados pessoais conforme a LGPD.",
};

export default function PrivacidadePage() {
  return (
    <LegalShell titulo="Política de Privacidade">
      <p>
        Esta Política descreve como o FACTO (&quot;nós&quot;) trata dados
        pessoais no site{" "}
        <strong>factoia.com.br</strong> e no aplicativo de geração de peças
        jurídicas, em conformidade com a Lei nº 13.709/2018 (LGPD).
      </p>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          1. Controlador e contato
        </h2>
        <p>
          Para questões de privacidade e exercício de direitos do titular,
          utilize:{" "}
          <a
            href="mailto:privacidade@factoia.com.br"
            className="font-medium text-stone-900 underline-offset-2 hover:underline"
          >
            privacidade@factoia.com.br
          </a>
          . Assuntos financeiros:{" "}
          <a
            href="mailto:financeiro@factoia.com.br"
            className="font-medium text-stone-900 underline-offset-2 hover:underline"
          >
            financeiro@factoia.com.br
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          2. Dados que coletamos
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Cadastro e conta:</strong> nome, e-mail, telefone, OAB (quando
            informada), dados de perfil e preferências.
          </li>
          <li>
            <strong>Assinatura e pagamento:</strong> dados necessários ao
            processamento via Mercado Pago (o FACTO não armazena o número
            completo do cartão).
          </li>
          <li>
            <strong>Uso do produto:</strong> relatos de fatos, documentos e
            arquivos que você envia para gerar peças, mensagens de suporte e
            registros técnicos de acesso (logs de segurança e operação).
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          3. Finalidades e bases legais
        </h2>
        <p>
          Tratamos dados para prestar o serviço contratado (execução de
          contrato), cumprir obrigações legais, prevenir fraudes, melhorar o
          produto e comunicar informações essenciais da conta e da assinatura.
          Quando aplicável, poderemos solicitar consentimento específico.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          4. Inteligência artificial e conteúdo jurídico
        </h2>
        <p>
          Textos e documentos enviados podem ser processados por modelos de inteligência artificial para redigir peças e análises. O conteúdo gerado é
          auxiliar: a responsabilidade pelo protocolo e pela conferência
          jurídica permanece com o advogado/usuário. Não utilize o FACTO para
          dados desnecessários ao caso.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          5. Compartilhamento
        </h2>
        <p>
          Podemos compartilhar dados com provedores essenciais à operação
          (hospedagem, autenticação, e-mail transacional, pagamentos e
          infraestrutura de IA), sempre sob obrigação de confidencialidade e
          nos limites da finalidade. Não vendemos dados pessoais.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          6. Retenção e segurança
        </h2>
        <p>
          Mantemos dados pelo tempo necessário às finalidades, à assinatura e a
          obrigações legais. Adotamos medidas técnicas e organizacionais
          razoáveis; nenhum sistema é 100% isento de risco.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          7. Direitos do titular
        </h2>
        <p>
          Você pode solicitar confirmação de tratamento, acesso, correção,
          anonimização, portabilidade, eliminação (quando cabível), informação
          sobre compartilhamentos e revogação de consentimento. Use{" "}
          <a
            href="mailto:privacidade@factoia.com.br"
            className="font-medium text-stone-900 underline-offset-2 hover:underline"
          >
            privacidade@factoia.com.br
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          8. Alterações
        </h2>
        <p>
          Esta política pode ser atualizada. A data no topo da página indica a
          versão vigente. Alterações relevantes poderão ser comunicadas no site
          ou por e-mail.
        </p>
      </section>
    </LegalShell>
  );
}
