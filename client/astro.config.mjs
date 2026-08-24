// @ts-check
import { defineConfig } from 'astro/config';

import solidJs from '@astrojs/solid-js';

// https://astro.build/config
export default defineConfig({
  integrations: [solidJs()],
  server: {
    port: 5173
  },
  // https://maplibre.org/maplibre-gl-js/docs/#__tabbed_1_1
  // ssr: {noExternal: ['maplibre-gl']}
});