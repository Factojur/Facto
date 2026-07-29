"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton({
  variant = "default",
}: {
  variant?: "default" | "sidebar";
}) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await fetch("/api/auth/sessao", { method: "DELETE" });
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (variant === "sidebar") {
    return (
      <button
        onClick={handleLogout}
        className="w-full rounded-lg border border-stone-700 px-4 py-2 text-sm font-medium text-stone-300 transition hover:border-stone-600 hover:bg-stone-800 hover:text-white"
      >
        Sair
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg border border-slate-700 px-8 py-3 font-semibold text-white transition hover:border-slate-500 hover:bg-slate-900"
    >
      Sair
    </button>
  );
}
