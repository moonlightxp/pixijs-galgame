import { defineConfig } from 'vite';

export default defineConfig({
    base: '/pixijs-galgame/',
    build: {
        outDir: 'docs',
        assetsDir: 'assets',
        rollupOptions: {
            input: {
                main: 'index.html'
            }
        },
        copyPublicDir: true
    },
    publicDir: 'assets'
}); 