import { modelTuning as model } from './modelTuning.ts';

export const CAFE_MODELS = {
    table: model('table.glb', [2, 1, 2], [0, 0.5, 0], 0, 0.78),
    chair: model('chair.glb', [0.75, 1.2583, 0.8451], [0, 0.6292, -0.0476], 0, 1.2),
    roundTable: model('roundTable.glb', [0.6928, 0.3667, 0.8], [0.3464, -0.0866, -0.4], 0.27, 0.76),
    counter: model('counter.glb', [0.43, 0.42, 0.21], [0.215, 0.21, -0.105], 0, 1.08),
    counterEnd: model('counterEnd.glb', [0.1016, 0.42, 0.21], [0.0508, 0.21, -0.105], 0, 1.08),
    backCounter: model('backCounter.glb', [0.43, 0.45, 0.45], [0.215, 0.225, -0.225], 0, 0.94),
    shelf: model('shelf.glb', [2, 0.4, 0.5], [0, -0.1, 0.25], 0.3, 2.4, 'width'),
    fridge: model('fridge.glb', [0.43, 0.92, 0.2919], [0.215, 0.46, -0.136], 0, 1.82),
    coffeeMachine: model('coffeeMachine.glb', [0.1895, 0.1775, 0.2402], [0.0948, 0.0887, -0.1201], 0, 0.38),
    pendant: model('pendant.glb', [0.3608, 1.0121, 0.3571], [0, -0.5072, -0.0037], 1.0132, 0.95),
    television: model('television.glb', [0.6848, 0.4548, 0.1284], [0, 0.2274, 0], 0, 2.05, 'width'),
    plant: model('plant.glb', [0.2121, 0.654, 0.2415], [0, 0.327, 0], 0, 1.32),
    smallPlant: model('smallPlant.glb', [0.0947, 0.14, 0.0947], [0, 0.07, 0], 0, 0.3),
    leafPlant: model('leafPlant.glb', [0.0947, 0.14, 0.0947], [0, 0.07, 0], 0, 0.38),
    cup: model('cup.glb', [0.2163, 0.14, 0.2866], [0, 0.07, -0.0211], 0, 0.12),
    croissant: model('croissant.glb', [0.3461, 0.1936, 0.4777], [0, 0.0968, 0], 0, 0.23, 'width'),
    muffin: model('muffin.glb', [0.3047, 0.2486, 0.2639], [0, 0.1243, 0], 0, 0.13),
    plate: model('plate.glb', [0.8918, 0.09, 0.8918], [0, 0.045, 0], 0, 0.3, 'width'),
    jar: model('jar.glb', [0.5, 0.75, 0.5], [0, 0.375, 0], 0, 0.29),
    jarSmall: model('jarSmall.glb', [0.5, 0.65, 0.5], [0, 0.325, 0], 0, 0.23),
    bag: model('bag.glb', [0.2201, 0.5998, 0.4118], [0, 0.2999, 0], 0, 0.36),
    pictureFrame: model('pictureFrame.glb', [2, 1.2, 0.2], [0, 0, 0.1], 0.6, 0.72),
    books: model('books.glb', [0.78, 0.5, 0.365], [0, 0, 0.005], 0.25, 0.24),
    stool: model('stool.glb', [0.75, 0.5, 0.75], [0, 0.25, 0], 0, 0.67),
    menu: model('menu.glb', [0.5, 0.8, 0.3], [0, 0.4, 0], 0, 0.25),
    fan: model('fan.glb', [1.4629, 0.5163, 1.4629], [-0.0009, -0.2582, 0.0008], 0.5163, 1.6, 'width'),
    icedDrink: model('icedDrink.glb', [0.2618, 0.4134, 0.2967], [0, 0.2067, -0.035], 0, 0.27),
    bottle: model('bottle.glb', [0.4517, 1.5638, 0.4517], [0, 0.7808, 0], 0.0011, 0.3)
};

export type CafeModelId = keyof typeof CAFE_MODELS;
