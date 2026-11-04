import { WasmModule } from 'playcanvas';

export const loadPhysics = () =>
    new Promise<void>((resolve, reject) => {
        WasmModule.setConfig('Ammo', {
            glueUrl: `${import.meta.env.BASE_URL}ammo/ammo.wasm.js`,
            wasmUrl: `${import.meta.env.BASE_URL}ammo/ammo.wasm.wasm`,
            errorHandler: (error) => reject(new Error(`Unable to load Ammo: ${error}`))
        });
        WasmModule.getInstance('Ammo', () => resolve());
    });
