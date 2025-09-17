import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    // Dengarkan di semua interface IPv4 & IPv6
    host: true,

    // Gunakan PORT dari env (Replit otomatis kasih), fallback ke 5000
    port: Number(process.env.PORT) || 5000,

    // Tambahkan host yang diizinkan
    allowedHosts: [
      // Host spesifik yang muncul di error
      "165c189d-d4ac-4df1-8be0-9259c8638a67-00-436bdlwqjc8b.spock.replit.dev",

      // Pola umum agar tidak perlu update manual jika URL Replit berubah
      /.*\.replit\.dev/,
      /.*\.replit\.app/,
      /.*\.spock\.replit\.dev/,
    ],

    // Agar HMR bekerja di balik HTTPS proxy Replit
    hmr: {
      clientPort: 443,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
