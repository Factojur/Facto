import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // pdf-parse e mammoth (extração de texto de PDF/Word na base de
  // conhecimento) usam APIs do Node e leitura dinâmica de módulos — não
  // devem ser processados pelo bundler do Next, só carregados como estão.
  serverExternalPackages: ["pdf-parse", "mammoth", "playwright", "pdfjs-dist"],
};

export default withSentryConfig(nextConfig, {
  // Source maps: só sobe se org/project/token estiverem definidos.
  ...(process.env.SENTRY_ORG && process.env.SENTRY_PROJECT
    ? {
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        widenClientFileUpload: Boolean(process.env.SENTRY_AUTH_TOKEN),
      }
    : { sourcemaps: { disable: true } }),
  silent: !process.env.CI,
  // Evita bloqueio de ad blockers no browser.
  tunnelRoute: "/monitoring",
  disableLogger: true,
  automaticVercelMonitors: false,
});
