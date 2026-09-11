import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LandingPage } from "@/components/landing/landing-page";
import { contarLastroLanding } from "@/lib/stats-juris-landing";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const totalLastro = await contarLastroLanding();

  return <LandingPage totalLastro={totalLastro} />;
}
