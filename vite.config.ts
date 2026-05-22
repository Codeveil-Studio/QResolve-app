import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [
      "host.docker.internal",
      // Tunneling services (used to access localhost from a phone on an Indian VPN
      // for Razorpay testing — Razorpay blocks non-Indian IPs).
      ".ngrok-free.app",
      ".ngrok.io",
      ".ngrok.app",
      ".trycloudflare.com",
      ".loca.lt",
    ],
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
