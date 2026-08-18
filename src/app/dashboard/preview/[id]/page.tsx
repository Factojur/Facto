import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getUsuarioServidor } from "@/lib/sessao-servidor";
import { getAreaById } from "@/lib/areas-atuacao";
import { hrefMinutaSeExistir } from "@/lib/minuta-modulo";
import { aberturaPorAreaId } from "@/lib/abertura-areas";
import { isEmailPreviewAreas } from "@/lib/emails-preview-areas";
import { AreaIllustration } from "@/components/dashboard/area-illustration";
import { getAreaTema } from "@/lib/area-temas";

export default async function PreviewAreaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUsuarioServidor();

  if (!isEmailPreviewAreas(user?.email)) {
    notFound();
  }

  const href = hrefMinutaSeExistir(id);
  if (href) {
    redirect(href);
  }

  const area = getAreaById(id);
  if (!area) notFound();

  const abertura = aberturaPorAreaId(id);
  const tema = getAreaTema(id);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
        Preview interno — clientes não veem este módulo
      </p>
      <div className="mt-4 flex items-start gap-4">
        <AreaIllustration
          areaId={area.id}
          className={`h-20 w-20 ${tema.accent}`}
        />
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">{area.title}</h1>
          {area.law ? (
            <p className="mt-1 text-sm text-slate-500">{area.law}</p>
          ) : null}
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        {area.description}
      </p>
      {abertura ? (
        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Ordem {abertura.ordem} na abertura
          </p>
          <p className="mt-2 text-sm text-slate-600">{abertura.porQue}</p>
          <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-slate-700">
            {abertura.especifico.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="mt-8 text-sm text-slate-500">
          Área no catálogo; checklist de abertura ainda não detalhado.
        </p>
      )}
      <p className="mt-8 text-sm text-slate-500">
        A geração de peça desta área só entra quando o checklist específico
        estiver fechado. Até lá o JEC permanece a base de desenvolvimento.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-block text-sm font-medium text-stone-800 underline-offset-2 hover:underline"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
