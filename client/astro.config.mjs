// @ts-check
import { defineConfig } from 'astro/config';

import solidJs from '@astrojs/solid-js';

import netlify from '@astrojs/netlify';

import lucidePreprocess from 'vite-plugin-lucide-preprocess'

// https://astro.build/config
export default defineConfig({
    output: 'server',
    integrations: [solidJs()],

    // https://maplibre.org/maplibre-gl-js/docs/#__tabbed_1_1
    // ssr: {noExternal: ['maplibre-gl']}
    server: {
        port: 5173
    },

    adapter: netlify({
        excludeFiles: ['./src/pages/map.astro']
    }),

    vite: {
        optimizeDeps: {
            include: [
                'moment',
                'moment-timezone'
            ]
        },
        plugins: [
            // For some reason, lucide loads extremely slow without preprocessing it
            lucidePreprocess()
        ]
    }
});