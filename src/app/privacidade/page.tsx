import type { Metadata } from "next";
import { LegalShell } from "@/components/legal/legal-shell";

export const metadata: Metadata = {
  title: "Privacidade — FACTO",
  description:
    "Política de Privacidade do FACTO: tratamento de dados pessoais conforme a LGPD.",
};

export default function PrivacidadePage() {
  return (
    <LegalShell
      titulo="Política de Privacidade"
      atualizacao="4 de agosto de 2026"
    >
      <p>
        Esta Política de Privacidade (&quot;Política&quot;) descreve como o{" "}
        <strong>FACTO</strong> (&quot;nós&quot;, &quot;nosso&quot;) trata dados
        pessoais no site <strong>factoia.com.br</strong>, no aplicativo e nos
        serviços correlatos de apoio à redação de peças e análises jurídicas, em
        conformidade com a Lei nº 13.709/2018 (LGPD) e demais normas aplicáveis.
      </p>
      <p>
        Ao utilizar a Plataforma e, quando solicitado, aceitar os Termos e esta
        Política, você declara ciência das práticas aqui descritas. Leia também
        os{" "}
        <a
          href="/termos"
          className="font-medium text-stone-900 underline-offset-2 hover:underline"
        >
          Termos de Uso
        </a>
        .
      </p>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          1. Controlador, encarregado e contatos
        </h2>
        <p>
          O controlador dos dados pessoais tratados no âmbito da conta FACTO e
          da operação da Plataforma é o responsável pelo Serviço FACTO no
          domínio factoia.com.br.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Privacidade e direitos do titular:{" "}
            <a
              href="mailto:privacidade@factoia.com.br"
              className="font-medium text-stone-900 underline-offset-2 hover:underline"
            >
              privacidade@factoia.com.br
            </a>
          </li>
          <li>
            Financeiro / assinatura:{" "}
            <a
              href="mailto:financeiro@factoia.com.br"
              className="font-medium text-stone-900 underline-offset-2 hover:underline"
            >
              financeiro@factoia.com.br
            </a>
          </li>
          <li>
            Suporte:{" "}
            <a
              href="mailto:suporte@factoia.com.br"
              className="font-medium text-stone-900 underline-offset-2 hover:underline"
            >
              suporte@factoia.com.br
            </a>
          </li>
        </ul>
        <p className="mt-2">
          Quando o Usuário (ex.: advogado) inserir dados de seus clientes ou
          partes processuais, ele poderá figurar como controlador desses dados
          perante o titular final; o FACTO atua, em regra, como operador /
          prestador tecnológico nesse contexto, processando as informações
          conforme instruções e finalidades do Serviço.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          2. Quais dados coletamos
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Cadastro e conta:</strong> nome completo, e-mail, telefone,
            CPF (quando informado), número de OAB e UF (quando informado),
            endereço, foto de perfil, preferências e tipo de usuário.
          </li>
          <li>
            <strong>Autenticação e sessão:</strong> identificadores de conta,
            tokens de sessão, registros de login e segurança.
          </li>
          <li>
            <strong>Assinatura e pagamento:</strong> status da assinatura,
            histórico de cobranças, identificadores do intermediário de
            pagamento (ex.: Mercado Pago). O FACTO não armazena o número
            completo do cartão.
          </li>
          <li>
            <strong>Conteúdo do produto:</strong> relatos de fatos, pedidos,
            valores, dados de partes, textos colados, arquivos enviados (quando
            o fluxo permitir leitura), links fornecidos, configurações de
            timbre/escritório no dispositivo ou conta, e minutas geradas.
          </li>
          <li>
            <strong>Aceite legal:</strong> data/hora, versão dos Termos/
            Privacidade e confirmação do aceite.
          </li>
          <li>
            <strong>Suporte e comunicações:</strong> mensagens enviadas ao
            suporte, e-mails transacionais e logs de entrega.
          </li>
          <li>
            <strong>Dados técnicos:</strong> endereço IP, tipo de navegador,
            páginas acessadas, horários, eventos de erro e métricas de
            desempenho / segurança (incluindo, quando ativo, ferramentas de
            monitoramento de falhas).
          </li>
        </ul>
        <p className="mt-2">
          Solicitamos que o Usuário evite enviar dados sensíveis ou de menores
          quando não forem estritamente necessários ao caso. Dados sensíveis,
          se enviados por iniciativa do Usuário para geração de peça, serão
          tratados apenas para essa finalidade e com o cuidado reforçado
          exigido pela LGPD.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          3. Bases legais e finalidades (LGPD)
        </h2>
        <p>Tratamos dados pessoais com fundamento, conforme o caso, em:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Execução de contrato</strong> (art. 7º, V): criar conta,
            autenticar, gerar minutas, prestar suporte e gerir assinatura.
          </li>
          <li>
            <strong>Obrigação legal / regulatória</strong> (art. 7º, II):
            obrigações fiscais, respostas a autoridades e conservação mínima
            exigida.
          </li>
          <li>
            <strong>Legítimo interesse</strong> (art. 7º, IX), com avaliação de
            impacto quando cabível: segurança, prevenção a fraudes e abusos,
            melhoria de produto, métricas agregadas e comunicações operacionais
            da conta.
          </li>
          <li>
            <strong>Consentimento</strong> (art. 7º, I / art. 11), quando
            exigido para finalidades específicas — inclusive o aceite
            eletrônico de Termos e Privacidade e, se houver, comunicações
            opcionais de marketing (que podem ser revogadas).
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          4. Inteligência artificial e conteúdo jurídico
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Fatos, textos e arquivos enviados podem ser processados por modelos
            e infraestrutura de inteligência artificial de terceiros para
            produzir minutas e análises.
          </li>
          <li>
            O conteúdo gerado é auxiliar. A conferência jurídica, o protocolo e
            a responsabilidade profissional permanecem com o Usuário / advogado
            responsável.
          </li>
          <li>
            Não utilize a Plataforma para dados desnecessários ao caso. Evite
            dados excessivos de saúde, origem racial, orientação sexual,
            biometria ou de crianças/adolescentes, salvo necessidade
            comprovada e base legal.
          </li>
          <li>
            Provedores de IA e nuvem podem processar insumos em ambientes sob
            suas próprias políticas e medidas de segurança; o FACTO seleciona
            prestadores sob obrigação contratual de confidencialidade e limites
            de finalidade, na medida do razoável e disponível no mercado.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          5. Compartilhamento e operadores
        </h2>
        <p>
          Podemos compartilhar dados com prestadores essenciais à operação, por
          exemplo: hospedagem e banco de dados, autenticação, e-mail
          transacional, pagamentos, monitoramento de erros e infraestrutura de
          IA. O compartilhamento ocorre nos limites da finalidade e com deveres
          de confidencialidade / segurança.
        </p>
        <p className="mt-2">
          Também poderemos divulgar dados quando exigido por lei, ordem judicial
          ou autoridade competente, ou para exercer direitos em processos
          judiciais, administrativos ou arbitrais.
        </p>
        <p className="mt-2">
          <strong>Não vendemos</strong> dados pessoais.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          6. Transferências internacionais
        </h2>
        <p>
          Alguns prestadores podem processar dados fora do Brasil. Nessas
          hipóteses, adotamos salvaguardas compatíveis com a LGPD (cláusulas
          contratuais, políticas do fornecedor e demais mecanismos admitidos),
          buscando nível de proteção adequado.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          7. Cookies e tecnologias semelhantes
        </h2>
        <p>
          Utilizamos cookies e armazenamento local necessários à autenticação,
          sessão, preferências e funcionamento do Serviço. Cookies estritamente
          necessários não dependem de consentimento adicional. Quando
          utilizarmos cookies analíticos ou de marketing não essenciais,
          informaremos e obteremos a base legal adequada.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          8. Retenção
        </h2>
        <p>
          Mantemos dados pelo tempo necessário às finalidades, à vigência da
          conta/assinatura, a obrigações legais e à defesa de direitos. Aceites
          de Termos/Privacidade e registros financeiros relevantes podem ser
          conservados pelo prazo prescricional aplicável. Após o encerramento,
          poderemos anonimizar ou eliminar dados quando não houver outra base
          legal para retenção.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          9. Segurança
        </h2>
        <p>
          Adotamos medidas técnicas e organizacionais razoáveis (controle de
          acesso, criptografia em trânsito quando aplicável, segregação de
          ambientes, monitoramento). Nenhum sistema é 100% isento de risco. O
          Usuário deve proteger suas credenciais e dispositivos. Em incidente
          de segurança relevante, adotaremos as providências legais cabíveis,
          inclusive comunicação quando exigida.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          10. Direitos do titular
        </h2>
        <p>
          Nos termos da LGPD, você pode solicitar: confirmação de tratamento,
          acesso, correção, anonimização, bloqueio ou eliminação de dados
          desnecessários, portabilidade (quando aplicável), informação sobre
          compartilhamentos, informação sobre a possibilidade de não fornecer
          consentimento e respectivas consequências, e revogação de
          consentimento.
        </p>
        <p className="mt-2">
          Pedidos:{" "}
          <a
            href="mailto:privacidade@factoia.com.br"
            className="font-medium text-stone-900 underline-offset-2 hover:underline"
          >
            privacidade@factoia.com.br
          </a>
          . Poderemos solicitar confirmação de identidade. Há hipóteses legais
          em que a eliminação imediata não é possível (ex.: obrigação legal ou
          exercício regular de direitos).
        </p>
        <p className="mt-2">
          Você também pode apresentar reclamação à Autoridade Nacional de
          Proteção de Dados (ANPD).
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          11. Crianças e adolescentes
        </h2>
        <p>
          A Plataforma não se destina a menores de 18 anos como titulares de
          conta. Se tomarmos conhecimento de cadastro irregular de menor,
          poderemos encerrar o acesso e eliminar dados, ressalvadas obrigações
          legais.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          12. Alterações desta Política
        </h2>
        <p>
          Podemos atualizar esta Política a qualquer tempo. A data de
          &quot;Última atualização&quot; indica a versão vigente. Mudanças
          relevantes poderão exigir novo aceite e/ou comunicação por e-mail ou
          aviso na Plataforma.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          13. Lei aplicável
        </h2>
        <p>
          Esta Política é interpretada conforme a legislação brasileira,
          especialmente a LGPD, o Marco Civil da Internet e, quando aplicável,
          o Código de Defesa do Consumidor.
        </p>
      </section>
    </LegalShell>
  );
}
