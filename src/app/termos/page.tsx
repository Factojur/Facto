import type { Metadata } from "next";
import { LegalShell } from "@/components/legal/legal-shell";

export const metadata: Metadata = {
  title: "Termos de Uso — FACTO",
  description:
    "Termos de Uso do FACTO: condições de acesso à plataforma de peças jurídicas com apoio de inteligência artificial.",
};

export default function TermosPage() {
  return (
    <LegalShell titulo="Termos de Uso" atualizacao="24 de agosto de 2026">
      <p>
        Estes Termos de Uso (&quot;Termos&quot;) regulam o acesso e a utilização
        do site <strong>factoia.com.br</strong>, do aplicativo e de quaisquer
        serviços correlatos do <strong>FACTO</strong> (em conjunto, a
        &quot;Plataforma&quot; ou o &quot;Serviço&quot;).
      </p>
      <p>
        Ao criar conta, aceitar estes Termos no primeiro acesso ou quando
        solicitada nova versão, navegar no site ou utilizar qualquer
        funcionalidade da Plataforma, você (&quot;Usuário&quot;) declara ter
        lido, compreendido e concordado integralmente com estes Termos e com a{" "}
        <a
          href="/privacidade"
          className="font-medium text-stone-900 underline-offset-2 hover:underline"
        >
          Política de Privacidade
        </a>
        . Se não concordar, não utilize o Serviço.
      </p>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          1. Natureza do Serviço — ferramenta auxiliar, não advocacia
        </h2>
        <p>
          O FACTO é uma ferramenta tecnológica de apoio à organização de
          informações e à redação assistida de peças, análises e textos de
          natureza jurídica, inclusive com uso de inteligência artificial.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            O FACTO <strong>não presta serviços advocatícios</strong>, não
            constitui escritório de advocacia, não estabelece relação
            cliente-advogado com o Usuário e{" "}
            <strong>não substitui</strong> o advogado, o parecer jurídico
            profissional nem a análise humana do caso concreto.
          </li>
          <li>
            Todo conteúdo gerado (peças, análises, sugestões de tese,
            fundamentação, pedidos, valores, endereçamento, nome de ação,
            jurisprudência sugerida etc.) é{" "}
            <strong>minuta / sugestão técnica auxiliar</strong>, sujeita a
            revisão, edição, validação e responsabilidade exclusiva do Usuário
            antes de qualquer uso, protocolo, intimação, petição ou divulgação.
          </li>
          <li>
            O FACTO <strong>não garante</strong> êxito em processos, deferimento
            de pedidos, correção absoluta de jurisprudência, doutrina,
            legislação, cálculos, prazos, competência, legitimidade, tipificação
            da ação ou adequação da peça ao juízo competente.
          </li>
          <li>
            Referências a leis, súmulas, julgados ou doutrina podem estar
            incompletas, desatualizadas ou inadequadas ao caso. Cabe ao Usuário
            conferir a fonte oficial e a aplicabilidade.
          </li>
          <li>
            O FACTO <strong>não protocola</strong> peças em tribunais nem
            envia petições ao juízo. O protocolo, a juntada de anexos e a
            guarda do arquivo final são exclusivamente do Usuário.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          2. Aceite, capacidade e elegibilidade
        </h2>
        <p>
          O Usuário declara ser maior de 18 anos e ter capacidade civil para
          contratar. Contas de advogados devem observar as normas da OAB e o
          Código de Ética e Disciplina. Contas de não advogados (quando
          admitidas, inclusive em trial ou causa própria no Juizado) devem
          observar os limites legais de atuação perante o Juizado Especial e
          demais normas aplicáveis.
        </p>
        <p className="mt-2">
          O aceite eletrônico (checkbox e registro de data/hora/versão) tem
          validade jurídica entre as partes, nos termos da legislação vigente,
          inclusive como evidência de ciência e concordância. Alterações
          relevantes destes Termos ou da Política de Privacidade podem exigir
          novo aceite antes da continuidade do uso.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          3. Conta, autenticação, credenciais e veracidade
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            O acesso completo à Plataforma exige cadastro e, em regra, plano
            ativo (incluindo trial, quando disponível), assinatura ou convite
            válido vinculado a pagamento.
          </li>
          <li>
            A autenticação pode ocorrer por e-mail/senha ou por provedores de
            identidade de terceiros (ex.: Google). O Usuário autoriza o
            tratamento dos dados necessários a essa autenticação conforme a
            Política de Privacidade e as políticas do provedor escolhido.
          </li>
          <li>
            Convites, assentos e acessos são pessoais e intransferíveis, salvo
            nos planos Escritório em que o administrador gerencia assentos
            autorizados. É vedado compartilhar login, revendê-lo ou permitir
            uso por terceiros não autorizados.
          </li>
          <li>
            O Usuário é responsável pela veracidade dos dados cadastrais (nome,
            e-mail, OAB, CPF/CNPJ quando informados, endereço etc.) e pela guarda
            das credenciais, dispositivos e sessões. Atividades realizadas na
            conta presumem-se feitas pelo titular ou por quem este autorizou,
            salvo prova de acesso indevido comunicado de imediato ao FACTO.
          </li>
          <li>
            O FACTO pode suspender ou encerrar contas em caso de dados falsos,
            uso indevido, inadimplemento, risco à segurança, ilícito ou
            violação destes Termos.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          4. Planos, trial, cotas e pacotes extras
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Planos, preços, benefícios, cotas de peças, limites de redator
            avançado (quando houver), trial e condições comerciais são os
            divulgados na página de compra, no painel do Usuário ou em proposta
            específica. Em caso de divergência, prevalece o que estiver vigente
            no momento da contratação.
          </li>
          <li>
            Em regra, a <strong>Entrada do caso</strong> e análises auxiliares
            não consomem cota de peça; o débito ocorre no{" "}
            <strong>Gerar peça</strong> (ou equivalente), conforme regras do
            plano.
          </li>
          <li>
            Trial e períodos promocionais, quando oferecidos, são pessoais,
            sujeitos a limite de uso e podem ser encerrados ou alterados a
            qualquer tempo, sem criar expectativa de continuidade gratuita.
          </li>
          <li>
            Pacotes extras de peças, quando disponíveis, acrescentam cota
            conforme a oferta; não alteram automaticamente outros limites do
            plano (ex.: teto de redator avançado), salvo indicação expressa.
          </li>
          <li>
            Planos Escritório (quando contratados) operam com assentos e, quando
            aplicável, cota em pool sob responsabilidade do administrador da
            conta. O administrador responde pelo uso dos membros vinculados.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          5. Obrigações do Usuário — revisão, dados e protocolo
        </h2>
        <p>O Usuário obriga-se a:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Revisar integralmente cada peça antes de protocolar ou utilizar
            (fatos, qualificações, pedidos, valores, fundamentos, jurisprudência,
            documentos anexos, prazos, foro, tutelas e formatação).
          </li>
          <li>
            Completar campos entre colchetes ou lacunas e corrigir qualquer
            imprecisão gerada automaticamente.
          </li>
          <li>
            Não inserir na Plataforma dados desnecessários, sensíveis em excesso
            ou de terceiros sem base legal / autorização.
          </li>
          <li>
            Obter e manter base legal (consentimento, legítimo interesse,
            exercício regular de direitos etc.) para tratar dados de clientes,
            partes, testemunhas e terceiros inseridos no Serviço.
          </li>
          <li>
            Respeitar segredo profissional, ética da advocacia, LGPD, direitos
            de personalidade e demais normas aplicáveis ao caso e aos documentos
            enviados.
          </li>
          <li>
            Juntar no protocolo eletrônico os documentos que assinalar na peça
            (ex.: hipossuficiência, MLE e provas), sob sua exclusiva
            responsabilidade.
          </li>
          <li>
            Manter cópias locais de conteúdo relevante; o FACTO não é arquivo
            permanente obrigatório de processos nem substitui o sistema do
            tribunal.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          6. Uso permitido e proibido — ilícitos e mau uso
        </h2>
        <p>
          É permitido utilizar a Plataforma para fins lícitos profissionais ou
          de estudo, nos limites do plano contratado.
        </p>
        <p className="mt-2">É vedado, entre outras condutas:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Utilizar o Serviço para fraude, prática ilícita, lavagem de
            capitais, assédio, discriminação ilegal, violação de direitos de
            terceiros, falsidade ideológica, uso indevido de dados pessoais ou
            qualquer atividade tipificada como crime ou ilícito civil.
          </li>
          <li>
            Inserir, gerar ou difundir conteúdo calunioso, difamatório,
            discriminatório ilegal, obsceno ilegal, ou que viole segredo de
            justiça, medida cautelar ou ordem judicial.
          </li>
          <li>
            Tentar burlar limites de acesso, cotas, trial, engenharia reversa
            indevida, scraping abusivo, exploração de falhas, ataque a sistemas,
            envio de malware, spam ou sobrecarga intencional da infraestrutura.
          </li>
          <li>
            Representar que o conteúdo gerado é parecer oficial do FACTO,
            decisão judicial, ou que o FACTO é o responsável pelo patrocínio da
            causa.
          </li>
          <li>
            Remover avisos de minuta, marcas ou menções de autoria/ferramenta
            quando a lei ou o contrato exigirem transparência.
          </li>
          <li>
            Usar a Plataforma para treinar modelos concorrentes ou extrair
            volumes anômalos de conteúdo sem autorização.
          </li>
          <li>
            Compartilhar, revender ou ceder acesso, peças ou dados obtidos via
            FACTO de forma a violar estes Termos, a LGPD ou direitos de
            terceiros.
          </li>
        </ul>
        <p className="mt-2">
          O Usuário é o <strong>único responsável</strong> por qualquer ilícito,
          mau uso, abuso de direito ou dano decorrente do conteúdo que inserir,
          gerar, exportar, protocolar ou divulgar. O FACTO não endossa nem
          assume autoria advocatícia desse conteúdo.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          7. Inteligência artificial e limitações técnicas
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            A geração de texto, triagem de peça, sugestão de nome de ação,
            análise de anexos, OCR, transcrição de áudio, resumo de estilo de
            redação e demais recursos assistidos podem utilizar modelos e
            infraestrutura de terceiros (incluindo provedores de nuvem e de IA).
            Saídas podem conter imprecisões, omissões, alucinações (inclusive
            citações inexistentes) ou vieses.
          </li>
          <li>
            Anexos cujo conteúdo não seja lido pelo sistema (quando a interface
            indicar que apenas nomes entram na peça) não são considerados
            analisados pela ferramenta.
          </li>
          <li>
            Fundamentos, leis municipais e jurisprudência anexados pelo Usuário
            são tratados como insumos; o FACTO não valida autenticidade de
            documentos públicos ou privados.
          </li>
          <li>
            Jurisprudência ou súmula anexada pelo Usuário pode ser usada na
            peça e, quando aplicável, encaminhada a fila interna de
            conferência do FACTO para eventual inclusão no acervo — sem
            garantia de aceite, prazo ou publicação.
          </li>
          <li>
            Disponibilidade, latência e qualidade podem variar conforme carga,
            manutenção, limites de provedores e condições de rede.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          8. Armazenamento de conteúdo, rascunhos e preservação
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Por desenho de produto, a peça gerada e os dados das partes{" "}
            <strong>não são armazenados como arquivo permanente na conta
            do cliente</strong> para consulta posterior, salvo funcionalidades
            expressamente indicadas na interface (ex.: rascunhos no navegador,
            casos JEC quando habilitados, ou recursos futuros comunicados).
          </li>
          <li>
            Rascunhos e memórias no dispositivo (ex.: armazenamento local do
            navegador) permanecem sob controle do Usuário e do equipamento;
            limpeza do navegador, troca de aparelho ou falha local podem
            resultar em perda — o FACTO não se obriga a recuperar esse
            conteúdo.
          </li>
          <li>
            Durante o processamento, dados e arquivos podem transitar por
            servidores, filas, logs técnicos e provedores de IA/nuvem pelo
            tempo necessário à prestação, segurança, cobrança de cota, suporte
            e cumprimento legal, conforme a Política de Privacidade.
          </li>
          <li>
            A preservação do arquivo final (PDF, DOCX, protocolo) é{" "}
            <strong>obrigação exclusiva do Usuário</strong>.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          9. Assinatura, pagamento, renovação e cancelamento
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            O pagamento é processado por intermediário (ex.: Mercado Pago); o
            FACTO não armazena o número completo do cartão.
          </li>
          <li>
            A assinatura pode renovar-se automaticamente conforme a modalidade
            contratada, até cancelamento pelo Usuário ou encerramento por
            inadimplemento / violação destes Termos.
          </li>
          <li>
            Cancelamentos, estornos e arrependimento observam o Código de Defesa
            do Consumidor quando aplicável, a política comunicada na compra e as
            regras do meio de pagamento. Contato financeiro:{" "}
            <a
              href="mailto:financeiro@factoia.com.br"
              className="font-medium text-stone-900 underline-offset-2 hover:underline"
            >
              financeiro@factoia.com.br
            </a>
            .
          </li>
          <li>
            O não pagamento pode resultar em suspensão do acesso sem prejuízo da
            cobrança de valores já devidos.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          10. Propriedade intelectual
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Marca FACTO, software, layout, bases de conhecimento internas,
            prompts de sistema, documentação e demais ativos da Plataforma
            pertencem ao FACTO ou a licenciantes. É vedada a cópia, engenharia
            reversa abusiva ou exploração comercial não autorizada desses ativos.
          </li>
          <li>
            Conteúdos e dados enviados pelo Usuário permanecem sob sua
            responsabilidade e titularidade (ou de quem os legitimou). O Usuário
            concede ao FACTO licença limitada, não exclusiva, para processar
            esses conteúdos apenas na medida necessária à prestação, segurança,
            suporte, cobrança, prevenção a abuso e melhoria do Serviço, conforme
            a Política de Privacidade.
          </li>
          <li>
            Salvo acordo em contrário, o Usuário pode utilizar as peças geradas
            para sua atividade profissional, mantendo a obrigação de revisão e a
            ciência de que a ferramenta não assume autoria advocatícia do
            patrocínio.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          11. Confidencialidade, dados de terceiros e vazamentos
        </h2>
        <p>
          O Usuário é o único responsável por obter autorização e base legal
          para tratar dados de clientes, partes, testemunhas e terceiros
          inseridos na Plataforma. O FACTO trata tais informações como
          prestador de serviço tecnológico / operador, nos limites da Política
          de Privacidade, sem assumir o papel de controlador do caso jurídico
          do Usuário perante o cliente final, salvo quando a lei dispuser de
          modo diverso quanto aos dados da própria conta FACTO.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            O Usuário responde por vazamento, divulgação indevida ou acesso não
            autorizado decorrentes de: compartilhamento de senha; dispositivos
            desprotegidos; envio de links, exports ou peças a terceiros;
            configuração inadequada de e-mail; uso em ambientes públicos; ou
            qualquer ato/omissão do Usuário ou de seus prepostos.
          </li>
          <li>
            O FACTO adota medidas razoáveis de segurança, mas{" "}
            <strong>não garante segurança absoluta</strong> contra ataques,
            falhas de terceiros ou força maior. Incidentes atribuíveis a
            provedores de nuvem, IA, pagamento, autenticação ou infraestrutura
            de terceiros, quando o FACTO tiver agido com diligência razoável,
            não geram responsabilidade automática do FACTO perante o Usuário
            além do previsto nestes Termos e na lei cogente.
          </li>
          <li>
            Em hipótese de incidente de segurança sob responsabilidade do
            FACTO, serão adotadas as providências legais cabíveis, sem que isso
            implique admissão de culpa por atos do Usuário ou de terceiros.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          12. Isenção e limitação de responsabilidade
        </h2>
        <p>
          Na máxima extensão permitida pelo ordenamento jurídico brasileiro, o
          FACTO e seus sócios, administradores, colaboradores e prestadores:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Não respondem por decisões judiciais ou administrativas, condenações,
            sucumbência, honorários devidos a terceiros, prazos decadenciais ou
            prescricionais, preclusões, erros de protocolo eletrônico, escolha
            inadequada de juízo, tese ou pedido, nem por danos decorrentes de
            uso de peça sem revisão adequada.
          </li>
          <li>
            Não respondem por ilícitos, mau uso, fraude, violação de LGPD,
            ética profissional ou direitos de terceiros praticados pelo Usuário
            ou por quem utilize suas credenciais.
          </li>
          <li>
            Não respondem por vazamento ou perda de dados causados por ato ou
            omissão do Usuário, de seus colaboradores, de destinatários a quem
            o Usuário enviar conteúdo, ou por armazenamento apenas local no
            dispositivo do Usuário.
          </li>
          <li>
            Não respondem por falhas de internet, navegador, dispositivos do
            Usuário, indisponibilidade de tribunais (PJe e correlatos),
            provedores de nuvem, pagamento, autenticação ou inteligência
            artificial.
          </li>
          <li>
            Prestam o Serviço &quot;como está&quot; e &quot;conforme
            disponível&quot;, sem garantia de resultado específico, de ausência
            total de erros ou de adequação a um propósito particular não
            expressamente contratado.
          </li>
          <li>
            Em qualquer hipótese em que seja reconhecida responsabilidade
            indenizatória do FACTO perante o Usuário, o valor total estará
            limitado, salvo dolo ou culpa grave comprovados e ressalvados
            direitos indisponíveis do consumidor, ao montante efetivamente pago
            pelo Usuário ao FACTO nos 12 (doze) meses anteriores ao evento
            danoso (ou ao valor do trial/benefício equivalente, se não houver
            pagamento).
          </li>
        </ul>
        <p className="mt-2">
          Nada nestes Termos exclui direitos irrenunciáveis previstos no CDC
          quando o Usuário for consumidor final nos termos da lei, nem
          responsabilidades que a LGPD imponha de forma cogente ao FACTO na
          qualidade de controlador dos dados da conta do Usuário.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          13. Indenização
        </h2>
        <p>
          O Usuário indenizará e manterá indene o FACTO, seus sócios,
          administradores, colaboradores e prestadores de reclamações,
          processos, prejuízos, custas e honorários razoáveis decorrentes de:
          (a) uso da Plataforma em desacordo com estes Termos ou com a lei; (b)
          conteúdo enviado, gerado, exportado ou protocolado pelo Usuário; (c)
          protocolo ou divulgação de peças sem revisão adequada; (d) violação
          de direitos de terceiros, LGPD ou segredo profissional imputável ao
          Usuário; (e) ilícito, fraude ou mau uso praticado por meio da conta;
          (f) vazamento ou acesso indevido causado por falha do Usuário na
          guarda de credenciais, dispositivos ou cópias locais.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          14. Suspensão, encerramento e sobrevivência
        </h2>
        <p>
          O FACTO pode suspender ou encerrar o acesso, total ou parcialmente,
          imediatamente e sem indenização, em caso de violação destes Termos,
          ilícito, risco à segurança, ordem legal, abuso de trial/cota ou
          encerramento do Serviço. Cláusulas de propriedade intelectual,
          limitação de responsabilidade, indenização, confidencialidade,
          retenção legal e foro sobrevivem ao término.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          15. Alterações destes Termos
        </h2>
        <p>
          Podemos atualizar estes Termos a qualquer tempo. A data de
          &quot;Última atualização&quot; indica a versão vigente. Alterações
          relevantes poderão exigir novo aceite eletrônico e/ou comunicação por
          e-mail ou aviso na Plataforma. O uso continuado após a vigência, quando
          a lei permitir, implica ciência; quando exigido novo aceite, o acesso
          poderá ficar condicionado a ele.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          16. Privacidade
        </h2>
        <p>
          O tratamento de dados pessoais está descrito na{" "}
          <a
            href="/privacidade"
            className="font-medium text-stone-900 underline-offset-2 hover:underline"
          >
            Política de Privacidade
          </a>
          , parte integrante destes Termos.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          17. Contato, lei aplicável e foro
        </h2>
        <p>
          Suporte: formulário na área logada ou{" "}
          <a
            href="mailto:suporte@factoia.com.br"
            className="font-medium text-stone-900 underline-offset-2 hover:underline"
          >
            suporte@factoia.com.br
          </a>
          . Privacidade:{" "}
          <a
            href="mailto:privacidade@factoia.com.br"
            className="font-medium text-stone-900 underline-offset-2 hover:underline"
          >
            privacidade@factoia.com.br
          </a>
          .
        </p>
        <p className="mt-2">
          Estes Termos são regidos pelas leis da República Federativa do Brasil.
          Fica eleito o foro da comarca do domicílio do Usuário consumidor,
          quando aplicável o CDC; nos demais casos, o foro da comarca da sede do
          prestador do Serviço, com renúncia a qualquer outro, por mais
          privilegiado que seja, salvo disposição legal cogente em contrário.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          18. Disposições gerais
        </h2>
        <p>
          A invalidade de qualquer cláusula não prejudica as demais. A tolerância
          quanto a infrações não implica renúncia de direitos. Estes Termos
          constituem o acordo integral quanto ao uso da Plataforma, prevalecendo
          sobre comunicações anteriores conflitantes, salvo contrato escrito
          específico em contrário.
        </p>
      </section>
    </LegalShell>
  );
}
