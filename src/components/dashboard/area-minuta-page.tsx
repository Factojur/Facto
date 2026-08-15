import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JecForm } from "@/components/dashboard/jec-form";
import { isEmailPreviewAreas } from "@/lib/emails-preview-areas";
import type { AreaIdMinuta } from "@/lib/minuta-modulo";

export async function AreaMinutaPage({ areaId }: { areaId: AreaIdMinuta }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isEmailPreviewAreas(user?.email)) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm text-slate-500">Carregando formulário…</div>
      }
    >
      <JecForm leigo={false} areaId={areaId} />
    </Suspense>
  );
}
