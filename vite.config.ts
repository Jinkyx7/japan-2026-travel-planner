import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["favicon.svg", "icons/apple-touch-icon.png"],
      manifest: {
        id: "/",
        name: "Japan 2026",
        short_name: "Japan 2026",
        description: "Your family journey through Hokkaido and Tokyo.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#2f6b5b",
        background_color: "#f6f7f8",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        shortcuts: [
          { name: "Itinerary · 行程", url: "/itinerary" },
          { name: "Expenses · 支出", url: "/expenses" },
        ],
      },
      workbox: {
        // Only our bundled app/photos. Never cache Google's SDK, tiles or API responses.
        globPatterns: ["**/*.{js,css,html,svg,png,jpg,webmanifest}"],
        maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
