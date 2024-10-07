import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

// https://vitejs.dev/config/
export default defineConfig({
    root: 'src',
    build: {
        outDir: '../dist',
        rollupOptions: {
            input: 'src/index.html',
        },
        emptyOutDir: true,
    },
    plugins: [react(), wasm(), topLevelAwait()],
    optimizeDeps: {
        // Don't optimize these packages as they contain web workers and WASM files.
        // https://github.com/vitejs/vite/issues/11672#issuecomment-1415820673
        exclude: ['@journeyapps/wa-sqlite', '@powersync/web'],
        include: ['@powersync/web > js-logger'],
    },
    worker: {
        format: 'es',
        plugins: () => [wasm(), topLevelAwait()],
    },
});
