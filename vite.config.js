import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const devCertificatePath = fileURLToPath(new URL("./.cert/localhost-dev.pfx", import.meta.url));
  const devCertificatePassphrase = env.DEV_CERT_PASSPHRASE || "payments-portal-local-dev";
  const httpsConfig = existsSync(devCertificatePath)
    ? {
        pfx: devCertificatePath,
        passphrase: devCertificatePassphrase
      }
    : undefined;

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      https: httpsConfig,
      proxy: {
        "/api": {
          target: "https://localhost:8080",
          changeOrigin: true,
          secure: false,
          configure(proxy) {
            proxy.on("proxyReq", (proxyReq) => {
              proxyReq.setHeader("origin", "https://localhost:8080");
              proxyReq.setHeader("referer", "https://localhost:8080/");
            });
          }
        }
      }
    },
    preview: {
      https: httpsConfig
    }
  };
});
