import type { Metadata } from "next";
import { LegalShell } from "@/components/legal/legal-shell";

export const metadata: Metadata = {
  title: "Termos de Uso — FACTO",
  description:
    "Termos de Uso do FACTO: condições de acesso à plataforma de peças jurídicas com IA.",
};

export default function TermosPage() {
  return (
    <LegalShell titulo="Termos de Uso">
      <p>
        Ao acessar o site <strong>factoia.com.br</strong> ou utilizar o FACTO,
        você concorda com estes Termos. Se não concordar, não utilize o
        serviço.
      </p>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          1. O serviço
        </h2>
        <p>
          O FACTO é uma plataforma de apoio à redação de peças e análises
          jurídicas com inteligência artificial. O resultado é{" "}
          <strong>sugestão técnica auxiliar</strong>, não parecer jurídico
          vinculante nem substituição do advogado responsável pelo caso.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          2. Conta e elegibilidade
        </h2>
        <p>
          O acesso completo exige cadastro e, em regra, assinatura ativa.
          Convites após pagamento são pessoais e intransferíveis. Você é
          responsável pela veracidade dos dados e pela guarda das credenciais.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          3. Uso permitido e proibido
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Use o FACTO para fins lícitos, no exercício profissional ou estudo,
            respeitando a ética da OAB e a legislação aplicável.
          </li>
          <li>
            É vedado tentar burlar limites de acesso, explorar falhas de
            segurança, enviar malware, spam ou conteúdo ilícito, ou utilizar o
            serviço para prejudicar terceiros.
          </li>
          <li>
            Revise sempre a peça gerada (fatos, pedidos, jurisprudência, prazos
            e formatação) antes de protocolar.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          4. Assinatura, pagamento e cancelamento
        </h2>
        <p>
          Planos e preços são os divulgados na página de compra. O pagamento é
          processado pelo Mercado Pago. Cancelamentos e cobranças seguem as
          regras do plano, do CDC quando aplicável, e as comunicações enviadas
          por{" "}
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
          5. Propriedade intelectual
        </h2>
        <p>
          Marca, software, layout e materiais do FACTO pertencem aos seus
          titulares. O conteúdo que você envia permanece sob sua
          responsabilidade; você nos licencia o uso necessário à prestação do
          serviço.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          6. Limitação de responsabilidade
        </h2>
        <p>
          Na máxima extensão permitida pela lei, o FACTO não se responsabiliza
          por decisões judiciais, prazos perdidos, erros de protocolo ou
          interpretações jurídicas decorrentes do uso das peças geradas. O
          serviço é prestado &quot;como está&quot;, podendo haver
          indisponibilidade temporária para manutenção ou falhas de terceiros
          (IA, nuvem, pagamento).
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          7. Privacidade
        </h2>
        <p>
          O tratamento de dados pessoais está descrito na{" "}
          <a
            href="/privacidade"
            className="font-medium text-stone-900 underline-offset-2 hover:underline"
          >
            Política de Privacidade
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          8. Contato e foro
        </h2>
        <p>
          Suporte: pelo formulário na área logada ou{" "}
          <a
            href="mailto:suporte@factoia.com.br"
            className="font-medium text-stone-900 underline-offset-2 hover:underline"
          >
            suporte@factoia.com.br
          </a>
          . Fica eleito o foro da comarca do domicílio do consumidor, quando
          aplicável o CDC; nos demais casos, o foro da sede do prestador, salvo
          disposição legal em contrário.
        </p>
      </section>
    </LegalShell>
  );
}
