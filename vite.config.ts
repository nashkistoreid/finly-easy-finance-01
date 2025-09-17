import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    // Dengarkan semua koneksi
    host: true,

    // Gunakan PORT dari Replit, fallback 5000
    port: Number(process.env.PORT) || 5000,

    // IZINKAN HOST secara eksplisit
    allowedHosts: [
      "165c189d-d4ac-4df1-8be0-9259c8638a67-00-436bdlwqjc8b.spock.replit.dev",
      ".replit.dev",
      ".replit.app",
      ".spock.replit.dev"
    ],

    // Agar HMR tetap jalan di balik HTTPS Replit
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
