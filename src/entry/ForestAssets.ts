import { Asset, AssetListLoader } from 'playcanvas';
import type { AppBase, ContainerResource } from 'playcanvas';

import { FOREST_MODELS } from './forestModels';
import type { ForestModelId } from './forestModels';

export const loadForestAssets = async (app: AppBase) => {
    const entries = Object.entries({ ...FOREST_MODELS, performances: { file: 'forest-performances.glb' } }).map(
        ([id, model]) =>
            [
                id,
                new Asset(`forest-${id}`, 'container', {
                    url: `${import.meta.env.BASE_URL}assets/forest/${model.file}`
                })
            ] as const
    );
    const loader = new AssetListLoader(
        entries.map(([, asset]) => asset),
        app.assets
    );
    const release = () => {
        for (const [, asset] of entries) {
            app.assets.remove(asset);
            asset.unload();
        }
    };
    try {
        await new Promise<void>((resolve, reject) =>
            loader.load((error?: string) => (error ? reject(new Error(error)) : resolve()))
        );
        return {
            models: Object.fromEntries(entries.map(([id, asset]) => [id, asset.resource])) as Record<
                ForestModelId | 'performances',
                ContainerResource
            >,
            release
        };
    } catch (error) {
        release();
        throw error;
    } finally {
        loader.destroy();
    }
};
