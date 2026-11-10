import { modelTuning } from '../data/modelTuning';

export const FOREST_DETAILS = {
    pine: modelTuning('Tree_2_D.glb', [4.7396, 8.0876, 4.0344], [-0.0811, 3.6506, -0.3739], 0.3932, 10),
    canopy: modelTuning('Tree_3_B.glb', [4.1294, 4.3529, 4.1294], [-0.0269, 1.8354, 0], 0.341, 7.4),
    fir: modelTuning('Tree_4_C.glb', [3.7352, 10.774, 2.8691], [0.1367, 5.0305, -0.1128], 0.3565, 11),
    crooked: modelTuning('Tree_Bare_1_C.glb', [3.7369, 5.2554, 2.0742], [0.5018, 2.2354, -0.3582], 0.3923, 8),
    sapling: modelTuning('Tree_Bare_2_A.glb', [1.1963, 3.8428, 0.6], [-0.0941, 1.5631, 0.0909], 0.3583, 6.2),
    grass: modelTuning('Grass_1_A.glb', [0.3393, 0.5593, 0.1518], [0, 0.2597, -0.0025], 0.02, 0.38),
    reeds: modelTuning('Grass_2_B.glb', [0.4035, 0.9188, 0.3974], [-0.0119, 0.4281, -0.0754], 0.0313, 0.7),
    boulder: modelTuning('Rock_2_C.glb', [1.2953, 1.3262, 1.2953], [0, 0.6631, 0], 0, 1.2),
    bramble: modelTuning('Bush_2_D.glb', [1.5723, 0.858, 1.0185], [-0.0373, 0.429, 0], 0, 1),
    fence: modelTuning('Fence_1.glb', [49.5762, 36.7812, 4.3466], [24.7779, 18.056, -0.7997], 0.3346, 1.25),
    brokenFence: modelTuning('Fence_3.glb', [49.9325, 37.1221, 7.2439], [24.9662, 17.8855, -2.2075], 0.6755, 1.3),
    coffin: modelTuning('Coffin_1.glb', [28.189, 18.5653, 63.0582], [0, 9.2827, -1.8063], 0, 0.58),
    crossGrave: modelTuning('Gravestone_2.glb', [35.963, 45.5081, 28.6592], [0.0001, 5.2541, 4.3065], 17.5, 1.4),
    roundGrave: modelTuning('Gravestone_3.glb', [35.963, 37.495, 28.6592], [0.0001, 1.2475, 4.3065], 17.5, 1.15),
    tallPumpkin: modelTuning('Pumpkin_Lantern_2.glb', [21.3895, 22.2262, 21.107], [0, 11.1063, -0.2174], 0.0069, 0.65),
    leanPumpkin: modelTuning(
        'Pumpkin_Lantern_3.glb',
        [18.072, 24.3259, 17.8237],
        [-0.0181, 12.1262, 0.173],
        0.0368,
        0.6
    ),
    plainPumpkin: modelTuning('Pumpkin_2.glb', [21.107, 22.2262, 21.3895], [0.2174, 11.1063, 0], 0.0069, 0.43),
    hangingLantern: modelTuning('Lantern_2.glb', [15.8538, 29.2785, 16.6697], [0, 8.2034, 0], 6.4358, 0.6),
    lampPost: modelTuning('Lantern_Pole.glb', [38.5524, 120.8968, 36.2484], [3.5802, 60.4484, 0], 0, 3),
    candle: modelTuning('Candle_1.glb', [10.7486, 21.2157, 10.5068], [0, 10.6079, -0.0517], 0, 0.35),
    slab: modelTuning('Stone_Slab.glb', [81.2657, 4.0004, 16], [40.6328, 1.9998, -6.1125], 0.0004, 0.075),
    birdSkull: modelTuning('Bird_Skull.glb', [12.1893, 10.7031, 22.376], [0.0036, 4.935, 4.8024], 0.4165, 0.19),
    wolfSkull: modelTuning('Wolf_Skull.glb', [18.8098, 15.3586, 24.6309], [0, 2.5577, 3.7032], 5.1215, 0.26)
};
