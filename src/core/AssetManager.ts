import { Asset, AssetListLoader, WasmModule } from 'playcanvas';
import type { AppBase, ContainerResource } from 'playcanvas';

import { CAFE_MODELS } from '../data/cafeModels';
import type { CafeModelId } from '../data/cafeModels';
import { CHARACTER_MODELS } from '../data/characterModels';
import type { CharacterModelId } from '../data/characterModels';
import { VEHICLE_MODELS } from '../data/vehicleModels';
import type { VehicleModelId } from '../data/vehicleModels';

export type CafeAssets = Record<CafeModelId, ContainerResource>;
export type CharacterAssets = Record<CharacterModelId, ContainerResource>;
export type VehicleAssets = Record<VehicleModelId, ContainerResource>;
export type GameAssets = { cafe: CafeAssets; characters: CharacterAssets; vehicles: VehicleAssets };
export type ForestCharacters = Pick<CharacterAssets, 'patronBeard' | 'patronLong'>;

const modelAssets = (app: AppBase, prefix: string, folder: string, models: Record<string, { file: string }>) =>
    Object.entries(models).map(([id, { file }]) => {
        const name = `${prefix}-${id}`;
        const asset =
            app.assets.find(name, 'container') ??
            new Asset(name, 'container', {
                url: `${import.meta.env.BASE_URL}assets/${folder}/${file}`
            });
        return [id, asset] as const;
    });

export const loadForestCharacters = async (app: AppBase): Promise<ForestCharacters> => {
    const entries = modelAssets(app, 'character', 'characters', {
        patronBeard: CHARACTER_MODELS.patronBeard,
        patronLong: CHARACTER_MODELS.patronLong
    });
    const loader = new AssetListLoader(
        entries.map(([, asset]) => asset),
        app.assets
    );
    try {
        await new Promise<void>((resolve, reject) =>
            loader.load((error?: string) => (error ? reject(new Error(error)) : resolve()))
        );
        return Object.fromEntries(entries.map(([id, asset]) => [id, asset.resource])) as ForestCharacters;
    } finally {
        loader.destroy();
    }
};

export const loadGameAssets = async (app: AppBase): Promise<GameAssets> => {
    const create = (prefix: string, folder: string, models: Record<string, { file: string }>) =>
        modelAssets(app, prefix, folder, models);
    const cafe = create('cafe', 'props/tideline', CAFE_MODELS);
    const characters = create('character', 'characters', CHARACTER_MODELS);
    const vehicles = create('vehicle', 'vehicles', VEHICLE_MODELS);
    const entries = [...cafe, ...characters, ...vehicles];
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
            characters: Object.fromEntries(characters.map(([id, asset]) => [id, asset.resource])) as CharacterAssets,
            vehicles: Object.fromEntries(vehicles.map(([id, asset]) => [id, asset.resource])) as VehicleAssets
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
