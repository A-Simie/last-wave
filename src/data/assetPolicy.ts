import { PREPARED_MODELS } from './newModels.ts';
import type { ModelGroup, PreparedModelId } from './newModels.ts';

/**
 * `full` ships every supplied model, including the non-commercial (NC) ones, which is suitable for free,
 * non-commercial play. `commercial` drops every NC model so the build can be sold, monetised or entered
 * where commercial use may be argued; scenes fall back to licence-safe substitutes listed in
 * docs/ASSET_LICENSES.md. Select it with `VITE_ASSET_POLICY=commercial pnpm build`.
 */
export type AssetPolicy = 'full' | 'commercial';

const environment = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
export const ASSET_POLICY: AssetPolicy = environment?.VITE_ASSET_POLICY === 'commercial' ? 'commercial' : 'full';

export const isCommercialSafe = (id: PreparedModelId) => !PREPARED_MODELS[id].license.includes('-NC');

export const isModelAllowed = (id: PreparedModelId, policy: AssetPolicy = ASSET_POLICY) =>
    policy === 'full' || isCommercialSafe(id);

export const allowedModels = (groups: readonly ModelGroup[], policy: AssetPolicy = ASSET_POLICY) =>
    (Object.keys(PREPARED_MODELS) as PreparedModelId[]).filter(
        (id) => groups.includes(PREPARED_MODELS[id].group) && isModelAllowed(id, policy)
    );

/** Licence-safe stand-ins used when a non-commercial model is excluded. `null` means the prop is omitted. */
export const COMMERCIAL_SUBSTITUTES: Partial<Record<PreparedModelId, PreparedModelId | 'procedural' | null>> = {
    vampireBat: 'procedural',
    bus: 'policeCar',
    pickup: 'policeCar',
    yellowUmbrella: 'umbrellaB',
    goblet: null
};
