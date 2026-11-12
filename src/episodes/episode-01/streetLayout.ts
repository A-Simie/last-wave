import type { BoxDefinition, Vector3Tuple } from '../../data/foundation.ts';
import { STREET_EXTENTS } from '../../data/foundation.ts';
import type { PreparedModelId } from '../../data/newModels.ts';

/**
 * Street blocks whose procedural facade is replaced by a supplied building model. The collision box (and therefore
 * checkpoint validation) is unchanged; the model is uniformly fitted inside the block footprint and faces the road.
 */
export const STREET_BUILDING_MODELS: Readonly<Record<string, PreparedModelId>> = {
    'tideline-neighbor': 'house',
    'market-terrace': 'countryHouse',
    'coast-pharmacy': 'modernHouse',
    'seabreeze-homes': 'americanHouse',
    'tram-house': 'oldHouse',
    'paper-and-post': 'lowPolyStreetHouse',
    'palm-apartments': 'suburbanHouse',
    'west-seafront-shop-1': 'cornerShop',
    'west-seafront-shop-3': 'fishShop',
    'shell-house': 'lowPolyStreetHouse',
    'south-townhouses': 'americanHouse',
    'west-seafront-homes-0': 'smallHouse',
    'west-seafront-homes-1': 'countryHouse',
    'west-seafront-homes-2': 'house',
    'west-seafront-homes-3': 'oldHouse',
    'east-residences': 'smallHouse',
    'marina-homes': 'luginHouse',
    'sailmakers-court': 'suburbanHouse',
    'market-street-building-0': 'americanHouse',
    'market-street-building-1': 'countryHouse',
    'market-street-building-2': 'modernHouse',
    'market-street-building-5': 'smallHouse',
    'market-street-building-7': 'house',
    'market-street-building-9': 'oldHouse'
};

export type KioskDefinition = BoxDefinition & {
    readonly sign: readonly [string, string];
    readonly goods: 'water' | 'soda' | 'juice' | 'fruit';
    /** Unit vector the serving window faces; customers queue along it. */
    readonly facing: readonly [number, number];
};

const kiosk = (
    name: string,
    x: number,
    z: number,
    facing: readonly [number, number],
    goods: KioskDefinition['goods'],
    sign: readonly [string, string]
): KioskDefinition => ({
    name,
    position: [x, 1.2, z],
    size: facing[0] ? [1.5, 2.4, 2.8] : [2.8, 2.4, 1.5],
    facing,
    goods,
    sign
});

/** Refreshment kiosks beside the beach approach and on the market-street plaza. */
export const STREET_KIOSKS: readonly KioskDefinition[] = [
    kiosk('kiosk-spring-water', 55.4, -7.2, [1, 0], 'water', ['SPRING WATER', 'ICE COLD · 2 CREDITS']),
    kiosk('kiosk-soft-drinks', 55.4, -3, [1, 0], 'soda', ['FIZZ & POP', 'SOFT DRINKS · COLA · LEMONADE']),
    kiosk('kiosk-juice-bar', 55.4, 1.2, [1, 0], 'juice', ['JUICE BAR', 'ORANGE · MANGO · WATERMELON']),
    kiosk('kiosk-fruit-stand', -10, 36.2, [0, 1], 'fruit', ['FRESH FRUIT', 'MANGO · BANANA · PINEAPPLE']),
    kiosk('kiosk-market-water', 4, 36.2, [0, 1], 'water', ['MARKET WATER', 'BOTTLES & ICE']),
    kiosk('kiosk-market-juice', 18, 36.2, [0, 1], 'juice', ['PRESSED DAILY', 'FRUIT JUICE · SMOOTHIES'])
];

/** A parked patrol car beside the beach entrance, in front of the east fence. */
export const ENTRANCE_POLICE_CAR: BoxDefinition = {
    name: 'entrance-police-car',
    position: [94.9, 0.7, -6.4],
    size: [1.8, 1.4, 4.75]
};

export const STREET_EXTRA_SOLIDS: readonly BoxDefinition[] = [...STREET_KIOSKS, ENTRANCE_POLICE_CAR];

/** Pedestrian crossings: x position, road centre z and the curb lines either side. */
export const STREET_CROSSINGS: readonly { x: number; road: number; near: number; far: number }[] = [
    { x: 10.3, road: 13.2, near: 8.95, far: 17.45 },
    { x: -96, road: 13.2, near: 8.95, far: 17.45 },
    { x: 116, road: 13.2, near: 8.95, far: 17.45 },
    { x: -28, road: STREET_EXTENTS.marketZ, near: STREET_EXTENTS.marketZ - 4.05, far: STREET_EXTENTS.marketZ + 4.05 },
    { x: 104, road: STREET_EXTENTS.marketZ, near: STREET_EXTENTS.marketZ - 4.05, far: STREET_EXTENTS.marketZ + 4.05 }
];

/** Where each kiosk's customers stand, front of the queue first. */
export const kioskQueue = (definition: KioskDefinition, count: number): Vector3Tuple[] =>
    Array.from({ length: count }, (_, i) => {
        const distance = definition.size[definition.facing[0] ? 0 : 2] / 2 + 0.75 + i * 0.95;
        return [
            definition.position[0] + definition.facing[0] * distance,
            0.048,
            definition.position[2] + definition.facing[1] * distance
        ];
    });
