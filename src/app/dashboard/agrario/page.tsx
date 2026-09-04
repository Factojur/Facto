import { redirecionarAreaParaChat } from "@/components/dashboard/area-minuta-page";

export default async function Page() {
  await redirecionarAreaParaChat("agrario");
}
