import { redirect } from "next/navigation";

/** Alias legado — o workspace do assistente vive em `/dashboard`. */
export default async function DashboardChatPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (v == null) continue;
    if (Array.isArray(v)) {
      for (const item of v) params.append(k, item);
    } else {
      params.set(k, v);
    }
  }
  const q = params.toString();
  redirect(q ? `/dashboard?${q}` : "/dashboard");
}
