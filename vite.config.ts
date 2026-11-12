import { readFile, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';

import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
    plugins: [
        {
            name: 'commercial-model-exclusion',
            apply: 'build',
            async writeBundle(options) {
                const policy = process.env.VITE_ASSET_POLICY ?? loadEnv(mode, process.cwd()).VITE_ASSET_POLICY;
                if (policy !== 'commercial') return;
                if (!options.dir) throw new Error('Commercial model exclusion requires a build output directory');
                const models = JSON.parse(
                    await readFile(new URL('./scripts/new-assets.prepared.json', import.meta.url), 'utf8')
                );
                for (const model of models.filter((entry: { license: string }) => entry.license.includes('-NC'))) {
                    if (!/^[a-zA-Z0-9_-]+\.glb$/.test(model.file))
                        throw new Error(`Invalid model filename: ${model.file}`);
                    await unlink(resolve(options.dir, 'assets/models', model.file));
                }
            }
        }
    ],
    // Relative URLs, so the build runs wherever it's served from: a domain root, a subpath such as
    // GitHub Pages or itch.io, or a Snapchat Web Lens
    base: './',
    build: {
        // A PlayCanvas build is 1-2.5 MB minified (300-600 kB gzipped), nearly all of it engine code the
        // first frame needs, so warn only for chunks well past that rather than at Vite's 500 kB default
        chunkSizeWarningLimit: 3000
    },
    optimizeDeps: { include: ['@playcanvas/inspector'] }
}));
