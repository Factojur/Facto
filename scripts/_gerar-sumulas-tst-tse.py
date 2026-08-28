# -*- coding: utf-8 -*-
"""Gera lotes TypeScript de súmulas TST (livro oficial) e TSE (portal)."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = Path(
    r"C:\Users\jefee\.cursor\projects\c-Users-jefee-Projects-facto"
    r"\agent-tools\84caa498-cbd5-428f-b2d5-57962f55e157.txt"
)
OUT_DIR = ROOT / "src" / "lib" / "sumulas"


def ts_escape(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def parse_tst(text: str) -> list[tuple[int, str, str]]:
    parts = re.split(r"(?=SUM-\d+\b)", text)
    by: dict[int, dict] = {}
    for part in parts:
        m = re.match(r"SUM-(\d+)\s+(.+)", part, re.S)
        if not m:
            continue
        num = int(m.group(1))
        body = m.group(2)
        head = re.sub(r"\s+", " ", body[:600]).strip()
        status = "ativa"
        if re.search(r"\(cancelad", head, re.I):
            status = "cancelada"
        elif re.search(r"\(superad", head, re.I):
            status = "superada"

        enunciado = body
        hi = re.search(r"\bHistórico\s*:", enunciado)
        if hi:
            enunciado = enunciado[: hi.start()]
        em = re.search(r"(?:DEJT|DJ)\s+[^.]*\.\s*(.+)", enunciado, re.S | re.I)
        if em:
            enunciado = em.group(1)
        else:
            em2 = re.search(r"\)\s*[–\-—]?\s*(?:Res\.[^.]*\.\s*)?(.+)", enunciado, re.S)
            if em2:
                enunciado = em2.group(1)

        enunciado = re.sub(r"Súmulas\s*A-\d+", " ", enunciado)
        enunciado = re.sub(r"S\s*Ú\s*M\s*(?:\n\s*)*U\s*L\s*A\s*S?", " ", enunciado)
        # hifenação de PDF: "pa gamento" / "pré vio" — junta sílabas óbvias cortadas
        enunciado = re.sub(r"(\w)-\s+(\w)", r"\1\2", enunciado)
        enunciado = re.sub(r"\s+", " ", enunciado).strip()
        enunciado = re.sub(r"^(?:\d{1,2}\.){1,2}\d{2,4}\.\s*", "", enunciado)
        enunciado = re.sub(
            r"^(?:\d{1,2},?\s+)+(?:e\s+)?(?:\d{1,2}\.){1,2}\d{2,4}\.\s*",
            "",
            enunciado,
        )
        enunciado = re.sub(r"\s+S\s*Ú\s*L\s*A\s*S?V?", " ", enunciado)
        enunciado = re.sub(r"\s+", " ", enunciado).strip()

        if len(enunciado) < 25:
            continue
        item = {"num": num, "status": status, "texto": enunciado[:4500]}
        prev = by.get(num)
        if not prev or len(item["texto"]) > len(prev["texto"]):
            by[num] = item

    return [(by[n]["num"], by[n]["status"], by[n]["texto"]) for n in sorted(by)]


TSE: list[tuple[int, str, str]] = [
    (
        1,
        "cancelada",
        "Proposta a ação para desconstituir a decisão que rejeitou as contas, anteriormente à impugnação, fica suspensa a inelegibilidade (Lei Complementar n. 64/90, art. 1º, I, g).",
    ),
    (
        2,
        "ativa",
        "Assinada e recebida a ficha de filiação partidária até o termo final do prazo fixado em lei, considera-se satisfeita a correspondente condição de elegibilidade, ainda que não tenha fluído, até a mesma data, o tríduo legal de impugnação.",
    ),
    (
        3,
        "ativa",
        "No processo de registro de candidatos, não tendo o juiz aberto prazo para o suprimento de defeito da instrução do pedido, pode o documento, cuja falta houver motivado o indeferimento, ser juntado com o recurso ordinário.",
    ),
    (
        4,
        "ativa",
        "Não havendo preferência entre candidatos que pretendam o registro da mesma variação nominal, defere-se o do que primeiro o tenha requerido.",
    ),
    (
        5,
        "ativa",
        "Serventuário de cartório, celetista, não se inclui na exigência do art. 1º, II, l, da LC n. 64/90.",
    ),
    (
        6,
        "ativa",
        "São inelegíveis para o cargo de Chefe do Executivo o cônjuge e os parentes, indicados no § 7º do art. 14 da Constituição Federal, do titular do mandato, salvo se este, reelegível, tenha falecido, renunciado ou se afastado definitivamente do cargo até seis meses antes do pleito.",
    ),
    (7, "cancelada", "É inelegível para o cargo de prefeito a irmã da concubina do atual titular do mandato."),
    (8, "cancelada", "O vice-prefeito é inelegível para o mesmo cargo."),
    (
        9,
        "ativa",
        "A suspensão de direitos políticos decorrente de condenação criminal transitada em julgado cessa com o cumprimento ou a extinção da pena, independendo de reabilitação ou de prova de reparação dos danos.",
    ),
    (
        10,
        "ativa",
        "No processo de registro de candidatos, quando a sentença for entregue em cartório antes de três dias contados da conclusão ao juiz, o prazo para o recurso ordinário, salvo intimação pessoal anterior, só se conta do termo final daquele tríduo.",
    ),
    (
        11,
        "ativa",
        "No processo de registro de candidatos, o partido que não o impugnou não tem legitimidade para recorrer da sentença que o deferiu, salvo se se cuidar de matéria constitucional.",
    ),
    (
        12,
        "ativa",
        "São inelegíveis, no município desmembrado, e ainda não instalado, o cônjuge e os parentes consangüíneos ou afins, até o segundo grau ou por adoção, do prefeito do município-mãe, ou de quem o tenha substituído, dentro dos seis meses anteriores ao pleito, salvo se já titular de mandato eletivo.",
    ),
    (
        13,
        "ativa",
        "Não é auto-aplicável o § 9º do art. 14 da Constituição, com a redação da Emenda Constitucional de Revisão n. 4/94.",
    ),
    (
        14,
        "cancelada",
        "A duplicidade de que cuida o parágrafo único do artigo 22 da Lei n. 9.096/1995 somente fica caracterizada caso a nova filiação houver ocorrido após a remessa das listas previstas no parágrafo único do artigo 58 da referida lei.",
    ),
    (
        15,
        "ativa",
        "O exercício de mandato eletivo não é circunstância capaz, por si só, de comprovar a condição de alfabetizado do candidato.",
    ),
    (
        16,
        "cancelada",
        "A falta de abertura de conta bancária específica não é fundamento suficiente para a rejeição de contas de campanha eleitoral, desde que, por outros meios, se possa demonstrar sua regularidade.",
    ),
    (
        17,
        "cancelada",
        "Não é admissível a presunção de que o candidato, por ser beneficiário de propaganda eleitoral irregular, tenha prévio conhecimento de sua veiculação.",
    ),
    (
        18,
        "ativa",
        "Conquanto investido de poder de polícia, não tem legitimidade o juiz eleitoral para, de ofício, instaurar procedimento com a finalidade de impor multa pela veiculação de propaganda eleitoral em desacordo com a Lei nº 9.504/97.",
    ),
    (
        19,
        "ativa",
        "O prazo de inelegibilidade decorrente da condenação por abuso do poder econômico ou político tem início no dia da eleição em que este se verificou e finda no dia de igual número no oitavo ano seguinte (art. 22, XIV, da LC n. 64/1990).",
    ),
    (
        20,
        "ativa",
        "A prova de filiação partidária daquele cujo nome não constou da lista de filiados de que trata o art. 19 da Lei n. 9.096/1995, pode ser realizada por outros elementos de convicção, salvo quando se tratar de documentos produzidos unilateralmente, destituídos de fé pública.",
    ),
    (
        21,
        "cancelada",
        "O prazo para ajuizamento da representação contra doação de campanha acima do limite legal é de 180 dias, contados da data da diplomação.",
    ),
    (
        22,
        "ativa",
        "Não cabe mandado de segurança contra decisão judicial recorrível, salvo situações de teratologia ou manifestamente ilegais.",
    ),
    (23, "ativa", "Não cabe mandado de segurança contra decisão judicial transitada em julgado."),
    (
        24,
        "ativa",
        "Não cabe recurso especial eleitoral para simples reexame do conjunto fático-probatório.",
    ),
    (
        25,
        "ativa",
        "É indispensável o esgotamento das instâncias ordinárias para a interposição de recurso especial eleitoral.",
    ),
    (
        26,
        "ativa",
        "É inadmissível o recurso que deixa de impugnar especificamente fundamento da decisão recorrida que é, por si só, suficiente para a manutenção desta.",
    ),
    (
        27,
        "ativa",
        "É inadmissível recurso cuja deficiência de fundamentação impossibilite a compreensão da controvérsia.",
    ),
    (
        28,
        "ativa",
        "A divergência jurisprudencial que fundamenta o recurso especial interposto com base na alínea b do inciso I do art. 276 do Código Eleitoral somente estará demonstrada mediante a realização de cotejo analítico e a existência de similitude fática entre os acórdãos paradigma e o aresto recorrido.",
    ),
    (
        29,
        "ativa",
        "A divergência entre julgados do mesmo Tribunal não se presta a configurar dissídio jurisprudencial apto a fundamentar recurso especial eleitoral.",
    ),
    (
        30,
        "ativa",
        "Não se conhece de recurso especial eleitoral por dissídio jurisprudencial, quando a decisão recorrida estiver em conformidade com a jurisprudência do Tribunal Superior Eleitoral.",
    ),
    (
        31,
        "ativa",
        "Não cabe recurso especial eleitoral contra acórdão que decide sobre pedido de medida liminar.",
    ),
    (
        32,
        "ativa",
        "É inadmissível recurso especial eleitoral por violação à legislação municipal ou estadual, ao Regimento Interno dos Tribunais Eleitorais ou às normas partidárias.",
    ),
    (
        33,
        "ativa",
        "Somente é cabível ação rescisória de decisões do Tribunal Superior Eleitoral que versem sobre a incidência de causa de inelegibilidade.",
    ),
    (
        34,
        "ativa",
        "Não compete ao Tribunal Superior Eleitoral processar e julgar mandado de segurança contra ato de membro de Tribunal Regional Eleitoral.",
    ),
    (
        35,
        "ativa",
        "Não é cabível reclamação para arguir o descumprimento de resposta a consulta ou de ato normativo do Tribunal Superior Eleitoral.",
    ),
    (
        36,
        "ativa",
        "Cabe recurso ordinário de acórdão de Tribunal Regional Eleitoral que decida sobre inelegibilidade, expedição ou anulação de diploma ou perda de mandato eletivo nas eleições federais ou estaduais (art. 121, § 4º, incisos III e IV, da Constituição Federal).",
    ),
    (
        37,
        "ativa",
        "Compete originariamente ao Tribunal Superior Eleitoral processar e julgar recurso contra expedição de diploma envolvendo eleições federais ou estaduais.",
    ),
    (
        38,
        "ativa",
        "Nas ações que visem à cassação de registro, diploma ou mandato, há litisconsórcio passivo necessário entre o titular e o respectivo vice da chapa majoritária.",
    ),
    (
        39,
        "ativa",
        "Não há formação de litisconsórcio necessário em processos de registro de candidatura.",
    ),
    (
        40,
        "ativa",
        "O partido político não é litisconsorte passivo necessário em ações que visem à cassação de diploma.",
    ),
    (
        41,
        "ativa",
        "Não cabe à Justiça Eleitoral decidir sobre o acerto ou desacerto das decisões proferidas por outros Órgãos do Judiciário ou dos Tribunais de Contas que configurem causa de inelegibilidade.",
    ),
    (
        42,
        "ativa",
        "A decisão que julga não prestadas as contas de campanha impede o candidato de obter a certidão de quitação eleitoral durante o curso do mandato ao qual concorreu, persistindo esses efeitos, após esse período, até a efetiva apresentação das contas.",
    ),
    (
        43,
        "ativa",
        "As alterações fáticas ou jurídicas supervenientes ao registro que beneficiem o candidato, nos termos da parte final do art. 11, § 10, da Lei n. 9.504/97, também devem ser admitidas para as condições de elegibilidade.",
    ),
    (
        44,
        "ativa",
        "O disposto no art. 26-C da LC n. 64/1990 não afasta o poder geral de cautela conferido ao magistrado pelo Código de Processo Civil.",
    ),
    (
        45,
        "ativa",
        "Nos processos de registro de candidatura, o Juiz Eleitoral pode conhecer de ofício da existência de causas de inelegibilidade ou da ausência de condição de elegibilidade, desde que resguardados o contraditório e a ampla defesa.",
    ),
    (
        46,
        "ativa",
        "É ilícita a prova colhida por meio da quebra do sigilo fiscal sem prévia e fundamentada autorização judicial, podendo o Ministério Público Eleitoral acessar diretamente apenas a relação dos doadores que excederam os limites legais, para os fins da representação cabível, em que poderá requerer, judicialmente e de forma individualizada, o acesso aos dados relativos aos rendimentos do doador.",
    ),
    (
        47,
        "ativa",
        "A inelegibilidade superveniente que autoriza a interposição de recurso contra expedição de diploma, fundado no art. 262 do Código Eleitoral, é aquela de índole constitucional ou, se infraconstitucional, superveniente ao registro de candidatura, e que surge até a data do pleito.",
    ),
    (
        48,
        "ativa",
        "A retirada da propaganda irregular, quando realizada em bem particular, não é capaz de elidir a multa prevista no art. 37, § 1º, da Lei nº 9.504/97.",
    ),
    (
        49,
        "ativa",
        "O prazo de cinco dias, previsto no art. 3º da LC n. 64/90, para o Ministério Público impugnar o registro inicia-se com a publicação do edital, caso em que é excepcionada a regra que determina a sua intimação pessoal.",
    ),
    (
        50,
        "ativa",
        "O pagamento da multa eleitoral pelo candidato ou a comprovação do cumprimento regular de seu parcelamento após o pedido de registro, mas antes do julgamento respectivo, afasta a ausência de quitação eleitoral.",
    ),
    (
        51,
        "ativa",
        "O processo de registro de candidatura não é o meio adequado para se afastarem os eventuais vícios apurados no processo de prestação de contas de campanha ou partidárias.",
    ),
    (
        52,
        "ativa",
        "Em registro de candidatura, não cabe examinar o acerto ou desacerto da decisão que examinou, em processo específico, a filiação partidária do eleitor.",
    ),
    (
        53,
        "ativa",
        "O filiado a partido político, ainda que não seja candidato, possui legitimidade e interesse para impugnar pedido de registro de coligação partidária da qual é integrante, em razão de eventuais irregularidades havidas em convenção.",
    ),
    (
        54,
        "ativa",
        "A desincompatibilização de servidor público que possui cargo em comissão é de três meses antes do pleito e pressupõe a exoneração do cargo comissionado, e não apenas seu afastamento de fato.",
    ),
    (
        55,
        "ativa",
        "A Carteira Nacional de Habilitação gera a presunção da escolaridade necessária ao deferimento do registro de candidatura.",
    ),
    (
        56,
        "ativa",
        "A multa eleitoral constitui dívida ativa de natureza não tributária, submetendo-se ao prazo prescricional de 10 (dez) anos, nos moldes do art. 205 do Código Civil.",
    ),
    (
        57,
        "ativa",
        "A apresentação das contas de campanha é suficiente para a obtenção da quitação eleitoral, nos termos da nova redação conferida ao art. 11, § 7º, da Lei nº 9.504/97, pela Lei nº 12.034/2009.",
    ),
    (
        58,
        "ativa",
        "Não compete à Justiça Eleitoral, em processo de registro de candidatura, verificar a prescrição da pretensão punitiva ou executória do candidato e declarar a extinção da pena imposta pela Justiça Comum.",
    ),
    (
        59,
        "ativa",
        "O reconhecimento da prescrição da pretensão executória pela Justiça Comum não afasta a inelegibilidade prevista no art. 1º, I, e, da LC nº 64/90, porquanto não extingue os efeitos secundários da condenação.",
    ),
    (
        60,
        "ativa",
        "O prazo da causa de inelegibilidade prevista no art. 1º, I, e, da LC n. 64/90 deve ser contado a partir da data em que ocorrida a prescrição da pretensão executória e não do momento da sua declaração judicial.",
    ),
    (
        61,
        "ativa",
        "O prazo concernente à hipótese de inelegibilidade prevista no art. 1º, I, e, da LC n. 64/90 projeta-se por oito anos após o cumprimento da pena, seja ela privativa de liberdade, restritiva de direito ou multa.",
    ),
    (
        62,
        "ativa",
        "Os limites do pedido são demarcados pelos fatos imputados na inicial, dos quais a parte se defende, e não pela capitulação legal atribuída pelo autor.",
    ),
    (
        63,
        "ativa",
        "A execução fiscal de multa eleitoral só pode atingir os sócios se preenchidos os requisitos para a desconsideração da personalidade jurídica previstos no art. 50 do Código Civil, tendo em vista a natureza não tributária da dívida, observados, ainda, o contraditório e a ampla defesa.",
    ),
    (
        64,
        "ativa",
        "Contra acórdão que discute, simultaneamente, condições de elegibilidade e de inelegibilidade, é cabível o recurso ordinário.",
    ),
    (
        65,
        "ativa",
        "Considera-se tempestivo o recurso interposto antes da publicação da decisão recorrida.",
    ),
    (
        66,
        "ativa",
        "A incidência do § 2º do art. 26-C da LC n. 64/1990 não acarreta o imediato indeferimento do registro ou o cancelamento do diploma, sendo necessário o exame da presença de todos os requisitos essenciais à configuração da inelegibilidade, observados os princípios do contraditório e da ampla defesa.",
    ),
    (
        67,
        "ativa",
        "A perda do mandato em razão da desfiliação partidária não se aplica aos candidatos eleitos pelo sistema majoritário.",
    ),
    (
        68,
        "ativa",
        "A União é parte legítima para requerer a execução de astreintes, fixada por descumprimento de ordem judicial no âmbito da Justiça Eleitoral.",
    ),
    (
        69,
        "ativa",
        "Os prazos de inelegibilidade previstos nas alíneas j e h do inciso I do art. 1º da LC nº 64/90 têm termo inicial no dia do primeiro turno da eleição e termo final no dia de igual número no oitavo ano seguinte.",
    ),
    (
        70,
        "ativa",
        "O encerramento do prazo de inelegibilidade antes do dia da eleição constitui fato superveniente que afasta a inelegibilidade, nos termos do art. 11, § 10, da Lei n. 9.504/97.",
    ),
    (
        71,
        "ativa",
        "Na hipótese de negativa de seguimento ao recurso especial e da consequente interposição de agravo, a parte deverá apresentar contrarrazões tanto ao agravo quanto ao recurso especial, dentro do mesmo tríduo legal.",
    ),
    (
        72,
        "ativa",
        "É inadmissível o recurso especial eleitoral quando a questão suscitada não foi debatida na decisão recorrida e não foi objeto de embargos de declaração.",
    ),
    (
        73,
        "ativa",
        "A fraude à cota de gênero, consistente no desrespeito ao percentual mínimo de 30% (trinta por cento) de candidaturas femininas, nos termos do art. 10, § 3º, da Lei n. 9.504/1997, configura-se com a presença de um ou alguns dos seguintes elementos, quando os fatos e as circunstâncias do caso concreto assim permitirem concluir: (1) votação zerada ou inexpressiva; (2) prestação de contas zerada, padronizada ou ausência de movimentação financeira relevante; e (3) ausência de atos efetivos de campanhas, divulgação ou promoção da candidatura de terceiros. O reconhecimento do ilícito acarretará: (a) a cassação do Demonstrativo de Regularidade de Atos Partidários (Drap) da legenda e dos diplomas dos candidatos a ele vinculados, independentemente de prova de participação, ciência ou anuência deles; (b) a inelegibilidade daqueles que praticaram ou anuíram com a conduta, nas hipóteses de Ação de Investigação Judicial Eleitoral (AIJE); (c) a nulidade dos votos obtidos pelo partido, com a recontagem dos quocientes eleitoral e partidário (art. 222 do Código Eleitoral), inclusive para fins de aplicação do art. 224 do Código Eleitoral.",
    ),
]


def write_lotes(
    prefix: str,
    helper: str,
    tribunal: str,
    items: list[tuple[int, str, str]],
    fonte: str,
) -> list[dict]:
    files: list[dict] = []
    lote_i = 1
    for start in range(0, len(items), 10):
        batch = items[start : start + 10]
        n0, n1 = batch[0][0], batch[-1][0]
        fname = f"{prefix}-lote-{lote_i:02d}.ts"
        export = f"SUMULAS_{tribunal}_LOTE_{lote_i:02d}"
        lines = [
            "/**",
            f" * {tribunal} — Lote {lote_i}: Súmulas {n0} a {n1}.",
            f" * Fonte: {fonte}",
            " */",
            "",
            f'import {{ {helper}, type SumulaLoteItem }} from "@/lib/sumulas/types";',
            "",
            f"export const {export}: SumulaLoteItem[] = [",
        ]
        for num, status, texto in batch:
            if status == "ativa":
                lines += [
                    f"  {helper}(",
                    f"    {num},",
                    f"    {ts_escape(texto)}",
                    "  ),",
                ]
            else:
                lines += [
                    f"  {helper}(",
                    f"    {num},",
                    f"    {ts_escape(texto)},",
                    f'    {{ status: "{status}" }}',
                    "  ),",
                ]
        lines += ["];", ""]
        (OUT_DIR / fname).write_text("\n".join(lines), encoding="utf-8")
        files.append({"lote": lote_i, "file": fname, "export": export})
        lote_i += 1
    return files


def main() -> None:
    text = SRC.read_text(encoding="utf-8")
    tst_items = parse_tst(text)
    print(
        "TST",
        len(tst_items),
        "ativas",
        sum(1 for _, s, _ in tst_items if s == "ativa"),
    )
    tst_files = write_lotes(
        "tst",
        "sumulaTst",
        "TST",
        tst_items,
        "Livro de Súmulas/OJs/PNs do TST (Res. 225/2025 — portal TST)",
    )
    tse_files = write_lotes(
        "tse",
        "sumulaTse",
        "TSE",
        TSE,
        "Portal TSE — Súmulas do TSE (codigo-eleitoral/sumulas)",
    )
    meta = {
        "tst": tst_files,
        "tse": tse_files,
        "tst_count": len(tst_items),
        "tst_ativas": sum(1 for _, s, _ in tst_items if s == "ativa"),
        "tse_count": len(TSE),
        "tse_ativas": sum(1 for _, s, _ in TSE if s == "ativa"),
    }
    (ROOT / "tmp" / "sumulas-tst-tse-meta.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print("TST lotes", len(tst_files), "TSE lotes", len(tse_files))
    print("SUM-1", tst_items[0][2][:100])


if __name__ == "__main__":
    main()
