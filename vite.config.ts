import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    // Dengarkan di semua interface (IPv4 & IPv6)
    host: true,
    // Replit memberi PORT via env; fallback ke 5000 bila lokal
    port: Number(process.env.PORT) || 5000,
    // Izinkan host Replit (dinamis) + yang spesifik dari error kamu
    allowedHosts: [
      "165c189d-d4ac-4df1-8be0-9259c8638a67-00-436bdlwqjc8b.spock.replit.dev",
      /.*\.replit\.dev/,
      /.*\.replit\.app/,
      /.*\.spock\.replit\.dev/
    ],
    // Bantu HMR di balik proxy HTTPS Replit
    hmr: {
      clientPort: 443
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
