import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // La raíz del repo tiene su propio package-lock (tooling husky+commitlint);
  // se fija la raíz de Turbopack en app/ para evitar el warning de lockfiles.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
