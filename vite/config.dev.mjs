import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    server: {
        proxy: {
            "/api": {
                target: "http://92.205.187.214:8080",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ""),
            },

            "/ws": {
                target: "ws://92.205.187.214:8080",
                ws: true,
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/ws/, ""),
                // Extra options that often help:
                secure: false,
                rewriteWsOrigin: true,
            },
        },
    },
});

