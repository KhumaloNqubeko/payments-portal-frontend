import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const devCertificatePath = fileURLToPath(new URL("./.cert/localhost-dev.pfx", import.meta.url));
const devCertificatePassphrase = process.env.DEV_CERT_PASSPHRASE;
const httpsConfig = existsSync(devCertificatePath) && devCertificatePassphrase
  ? {
      pfx: devCertificatePath,
      passphrase: devCertificatePassphrase
    }
  : undefined;

export default defineConfig({
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
});
