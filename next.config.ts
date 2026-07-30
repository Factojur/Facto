import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse e mammoth (extração de texto de PDF/Word na base de
  // conhecimento) usam APIs do Node e leitura dinâmica de módulos — não
  // devem ser processados pelo bundler do Next, só carregados como estão.
  serverExternalPackages: ["pdf-parse", "mammoth"],
};

export default nextConfig;
