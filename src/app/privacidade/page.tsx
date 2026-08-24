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
      atualizacao="24 de agosto de 2026"
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
          domínio <strong>factoia.com.br</strong>. Pedidos de identificação
          completa do controlador (razão social, CNPJ e demais dados
          cadastrais) e comunicações ao encarregado (DPO) devem ser dirigidos
          aos canais abaixo.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Privacidade, direitos do titular e encarregado:{" "}
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
          Quando o Usuário (ex.: advogado ou escritório) inserir dados de seus
          clientes ou partes processuais, ele figura, em regra, como{" "}
          <strong>controlador</strong> desses dados perante o titular final; o
          FACTO atua como <strong>operador</strong> / prestador tecnológico,
          processando as informações conforme as instruções do Usuário e as
          finalidades do Serviço. O Usuário é responsável por base legal,
          minimização, orientações aos titulares e por vazamentos decorrentes
          de seu próprio ato ou omissão.
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
            tokens de sessão, registros de login e segurança; dados fornecidos
            por provedores de identidade (ex.: Google), quando o Usuário
            optar por esse meio de entrada.
          </li>
          <li>
            <strong>Assinatura, trial e pagamento:</strong> plano, trial,
            status da assinatura, cotas e pacotes extras, histórico de
            cobranças, identificadores do intermediário de pagamento (ex.:
            Mercado Pago). O FACTO não armazena o número completo do cartão.
          </li>
          <li>
            <strong>Conteúdo do produto:</strong> relatos de fatos, pedidos,
            valores, dados de partes, textos colados, arquivos enviados (PDF,
            Word, imagens), áudio enviado para transcrição, links fornecidos,
            configurações e amostras de estilo/timbre de escritório, e peças /
            textos gerados durante o processamento.
          </li>
          <li>
            <strong>Jurisprudência do caso:</strong> ementas, súmulas e
            arquivos anexados pelo Usuário para citação na peça e, quando
            aplicável, conferência interna / eventual inclusão no acervo FACTO.
          </li>
          <li>
            <strong>Lei municipal:</strong> norma colada ou anexada, usada
            apenas como fundamento daquele caso — não como lastro geral
            automático da base.
          </li>
          <li>
            <strong>Dados no dispositivo do Usuário:</strong> rascunhos,
            preferências de interface (ex.: menu recolhido) e memória local de
            qualificação de clientes, quando o recurso estiver ativo no
            navegador (localStorage ou similar), sob controle do dispositivo.
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
            monitoramento de falhas, sem gravação de sessão tipo
            &quot;replay&quot; por padrão).
          </li>
          <li>
            <strong>Planos Escritório:</strong> quando contratados, dados de
            membros, papéis e uso compartilhado de cota/assentos vinculados à
            conta administradora.
          </li>
        </ul>
        <p className="mt-2">
          Solicitamos que o Usuário evite enviar dados sensíveis ou de menores
          quando não forem estritamente necessários ao caso. Dados sensíveis,
          se enviados por iniciativa do Usuário para geração de peça, serão
          tratados apenas para essa finalidade e com o cuidado reforçado
          exigido pela LGPD. Áudio pode conter voz; o tratamento destina-se
          exclusivamente à transcrição / preenchimento assistido solicitado
          pelo Usuário.
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
            autenticar, operar trial/planos, gerar peças, debitar cotas,
            prestar suporte e gerir assinatura.
          </li>
          <li>
            <strong>Obrigação legal / regulatória</strong> (art. 7º, II):
            obrigações fiscais, respostas a autoridades e conservação mínima
            exigida.
          </li>
          <li>
            <strong>Legítimo interesse</strong> (art. 7º, IX), com avaliação de
            impacto quando cabível: segurança, prevenção a fraudes, abuso de
            trial/cota e ilícitos, melhoria de produto, métricas agregadas e
            comunicações operacionais da conta.
          </li>
          <li>
            <strong>Consentimento</strong> (art. 7º, I / art. 11), quando
            exigido para finalidades específicas — inclusive o aceite
            eletrônico de Termos e Privacidade e, se houver, comunicações
            opcionais de marketing (que podem ser revogadas).
          </li>
          <li>
            Para dados de terceiros inseridos pelo Usuário no caso concreto,
            a base legal perante o titular final compete precipuamente ao
            Usuário controlador; o FACTO processa sob instrução contratual /
            operacional do Serviço.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          4. Inteligência artificial e conteúdo jurídico
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Fatos, textos, PDFs, imagens (inclusive com OCR), áudio para
            transcrição, amostras de estilo de redação e demais arquivos
            enviados podem ser processados por modelos e infraestrutura de
            inteligência artificial de terceiros (ex.: provedores de modelos
            generativos) para produzir peças e análises.
          </li>
          <li>
            O conteúdo gerado é auxiliar. A conferência jurídica, o protocolo e
            a responsabilidade profissional permanecem com o Usuário /
            advogado responsável.
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
          <li>
            O FACTO não utiliza o conteúdo do caso do Usuário para treinar
            modelos próprios abertos ao público; o processamento por
            prestadores de IA observa os termos contratados com esses
            prestadores (incluindo políticas de não uso para treino, quando
            disponíveis e aplicáveis).
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          5. O que armazenamos e o que não fica na conta
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Por desenho de produto, a peça gerada e os dados das partes{" "}
            <strong>não são mantidos como arquivo permanente consultável
            na conta do cliente</strong>, salvo recursos expressamente
            indicados na interface (ex.: rascunhos no navegador ou módulos de
            casos quando habilitados).
          </li>
          <li>
            Ainda assim, durante e após o processamento, podem existir
            registros técnicos limitados (logs, métricas de cota, filas,
            incidentes de segurança, evidências de aceite e cobrança) e
            trânsito temporário em provedores, pelo tempo necessário às
            finalidades desta Política.
          </li>
          <li>
            Dados apenas no dispositivo do Usuário (localStorage e correlatos)
            não são controlados pelo FACTO após a gravação local; o Usuário
            deve protegê-los e está ciente de que limpeza ou falha do aparelho
            podem apagá-los.
          </li>
          <li>
            A preservação do arquivo final protocolado é obrigação exclusiva
            do Usuário.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          6. Compartilhamento e operadores
        </h2>
        <p>
          Podemos compartilhar dados com prestadores essenciais à operação, por
          exemplo: hospedagem e banco de dados (ex.: infraestrutura em nuvem /
          Supabase), autenticação (incluindo Google, quando utilizado), e-mail
          transacional, pagamentos (ex.: Mercado Pago), monitoramento de erros
          (ex.: Sentry, sem session replay por padrão) e infraestrutura de IA
          (ex.: provedores Gemini / Anthropic, conforme recurso utilizado). O
          compartilhamento ocorre nos limites da finalidade e com deveres de
          confidencialidade / segurança.
        </p>
        <p className="mt-2">
          Também poderemos divulgar dados quando exigido por lei, ordem judicial
          ou autoridade competente, ou para exercer direitos em processos
          judiciais, administrativos ou arbitrais, inclusive em face de mau uso
          ou ilícito.
        </p>
        <p className="mt-2">
          <strong>Não vendemos</strong> dados pessoais.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          7. Transferências internacionais
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
          8. Cookies e tecnologias semelhantes
        </h2>
        <p>
          Utilizamos cookies e armazenamento local necessários à autenticação,
          sessão, preferências (incluindo estado do menu) e funcionamento do
          Serviço. Cookies estritamente necessários não dependem de
          consentimento adicional. Quando utilizarmos cookies analíticos ou de
          marketing não essenciais, informaremos e obteremos a base legal
          adequada.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          9. Retenção
        </h2>
        <p>
          Mantemos dados pelo tempo necessário às finalidades, à vigência da
          conta/assinatura/trial, a obrigações legais e à defesa de direitos.
          Aceites de Termos/Privacidade, registros financeiros e evidências de
          segurança relevantes podem ser conservados pelo prazo prescricional
          aplicável. Após o encerramento, poderemos anonimizar ou eliminar
          dados quando não houver outra base legal para retenção.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          10. Segurança e vazamentos
        </h2>
        <p>
          Adotamos medidas técnicas e organizacionais razoáveis (controle de
          acesso, criptografia em trânsito quando aplicável, segregação de
          ambientes, monitoramento).{" "}
          <strong>Nenhum sistema é 100% isento de risco.</strong> O Usuário
          deve proteger suas credenciais, dispositivos, exports e cópias
          locais.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Vazamentos ou acessos indevidos causados por ato/omissão do
            Usuário (compartilhamento de senha, phishing, aparelho sem
            proteção, envio da peça a terceiros etc.) são de responsabilidade
            do Usuário.
          </li>
          <li>
            Incidentes atribuíveis a provedores de terceiros, quando o FACTO
            tiver agido com diligência razoável na seleção e no uso
            contratual, serão tratados conforme a lei e os contratos com esses
            prestadores, sem transferência automática de responsabilidade ao
            FACTO além do legalmente cabível.
          </li>
          <li>
            Em incidente de segurança relevante sob esfera do FACTO, adotaremos
            as providências legais cabíveis, inclusive comunicação quando
            exigida.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          11. Direitos do titular
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
          Titulares finais (clientes do advogado) devem, em regra, exercer
          direitos perante o Usuário controlador do caso; o FACTO cooperará
          nos limites operacionais e legais quando o pedido for encaminhado
          corretamente.
        </p>
        <p className="mt-2">
          Você também pode apresentar reclamação à Autoridade Nacional de
          Proteção de Dados (ANPD).
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          12. Crianças e adolescentes
        </h2>
        <p>
          A Plataforma não se destina a menores de 18 anos como titulares de
          conta. Se tomarmos conhecimento de cadastro irregular de menor,
          poderemos encerrar o acesso e eliminar dados, ressalvadas obrigações
          legais. Dados de menores em peças só devem ser inseridos quando
          estritamente necessários ao caso e com base legal do Usuário.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          13. Mau uso e ilícitos
        </h2>
        <p>
          O tratamento de dados não autoriza o Usuário a praticar ilícitos,
          fraude, abuso de trial/cota, violação de segredo profissional ou
          uso indevido de dados de terceiros. O FACTO poderá suspender contas,
          preservar evidências e cooperar com autoridades quando houver indício
          de ilícito, nos termos da lei e dos Termos de Uso.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          14. Alterações desta Política
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
          15. Lei aplicável
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
