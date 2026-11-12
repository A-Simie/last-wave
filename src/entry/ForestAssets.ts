import { Asset, AssetListLoader } from 'playcanvas';
import type { AppBase, ContainerResource } from 'playcanvas';

import { allowedModels } from '../data/assetPolicy';
import { PREPARED_MODELS } from '../data/newModels';
import type { PreparedModelId } from '../data/newModels';

import { FOREST_MODELS } from './forestModels';
import type { ForestModelId } from './forestModels';

/** Supplied login-scene models (bat, headstone, cobwebs, skeletons…). Loaded after the core forest, never blocking. */
export const loadLoginModels = async (app: AppBase) => {
    const ids = allowedModels(['login']);
    const entries = ids.map(
        (id) =>
            [
                id,
                new Asset(`login-${id}`, 'container', {
                    url: `${import.meta.env.BASE_URL}assets/models/${PREPARED_MODELS[id].file}`
                })
            ] as const
    );
    const release = () => {
        for (const [, asset] of entries) {
            app.assets.remove(asset);
            asset.unload();
        }
    };
    const loader = new AssetListLoader(
        entries.map(([, asset]) => asset),
        app.assets
    );
    try {
        await new Promise<void>((resolve, reject) =>
            loader.load((error?: string) => (error ? reject(new Error(error)) : resolve()))
        );
        return {
            models: Object.fromEntries(entries.map(([id, asset]) => [id, asset.resource])) as Partial<
                Record<PreparedModelId, ContainerResource>
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
