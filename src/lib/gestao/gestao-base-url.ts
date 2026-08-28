import { getSiteUrl } from "@/lib/site-url";

/** URL pública para links de convite do FACTO Gestão. */
export function baseUrlGestao(request?: Request): string {
  if (request) {
    const host = request.headers.get("x-forwarded-host");
    const proto = request.headers.get("x-forwarded-proto") ?? "https";
    if (host) {
      return `${proto}://${host}`.replace(/\/$/, "");
    }
  }
  return getSiteUrl();
}
