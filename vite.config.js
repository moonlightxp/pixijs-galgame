import { defineConfig } from 'vite';

export default defineConfig({
    base: '/pixijs-galgame/',
    build: {
        outDir: 'docs',
        assetsDir: 'assets',
        rollupOptions: {
            input: {
                main: 'index.html'
            },
            output: {
                entryFileNames: 'assets/[name]-[hash].js',
                chunkFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]'
            }
        },
        copyPublicDir: false,
        manifest: true,
        emptyOutDir: true
    },
    server: {
        headers: {
            'Cache-Control': 'no-store'
        }
    }
}); 