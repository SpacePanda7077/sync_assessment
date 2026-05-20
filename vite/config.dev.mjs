import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        proxy: {
            // Proxy HTTP requests (login, etc.)
            "/api": {
                target: "http://92.205.187.214:8080",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ""),
            },

            // Proxy WebSocket
            "/ws": {
                target: "ws://92.205.187.214:8080", // Note: use ws:// here
                ws: true, // ← Very important
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/ws/, ""),
            },
        },
    },
});

