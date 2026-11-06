import { Asset, AssetListLoader, WasmModule } from 'playcanvas';
import type { AppBase, ContainerResource } from 'playcanvas';

import { CAFE_MODELS } from '../data/cafeModels';
import type { CafeModelId } from '../data/cafeModels';
import { CHARACTER_MODELS } from '../data/characterModels';
import type { CharacterModelId } from '../data/characterModels';

export type CafeAssets = Record<CafeModelId, ContainerResource>;
export type CharacterAssets = Record<CharacterModelId, ContainerResource>;
export type GameAssets = { cafe: CafeAssets; characters: CharacterAssets };

export const loadGameAssets = async (app: AppBase): Promise<GameAssets> => {
    const create = (prefix: string, folder: string, models: Record<string, { file: string }>) =>
        Object.entries(models).map(
            ([id, { file }]) =>
                [
                    id,
                    new Asset(`${prefix}-${id}`, 'container', {
                        url: `${import.meta.env.BASE_URL}assets/${folder}/${file}`
                    })
                ] as const
        );
    const cafe = create('cafe', 'props/tideline', CAFE_MODELS);
    const characters = create('character', 'characters', CHARACTER_MODELS);
    const entries = [...cafe, ...characters];
    const loader = new AssetListLoader(
        entries.map(([, asset]) => asset),
        app.assets
    );
    try {
        await new Promise<void>((resolve, reject) => {
            loader.load((error?: string, failed: Asset[] = []) => {
                if (error)
                    reject(new Error(`Unable to load game models: ${failed.map((asset) => asset.name).join(', ')}`));
                else resolve();
            });
        });
        return {
            cafe: Object.fromEntries(cafe.map(([id, asset]) => [id, asset.resource])) as CafeAssets,
            characters: Object.fromEntries(characters.map(([id, asset]) => [id, asset.resource])) as CharacterAssets
        };
    } finally {
        loader.destroy();
    }
};

export const loadPhysics = () =>
    new Promise<void>((resolve, reject) => {
        WasmModule.setConfig('Ammo', {
            glueUrl: `${import.meta.env.BASE_URL}ammo/ammo.wasm.js`,
            wasmUrl: `${import.meta.env.BASE_URL}ammo/ammo.wasm.wasm`,
            errorHandler: (error) => reject(new Error(`Unable to load Ammo: ${error}`))
        });
        WasmModule.getInstance('Ammo', () => resolve());
    });
