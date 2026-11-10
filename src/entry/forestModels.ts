import { modelTuning } from '../data/modelTuning';

import { FOREST_DETAILS } from './forestDetails';

export const FOREST_MODELS = {
    ...FOREST_DETAILS,
    bare: modelTuning('Tree_Bare_1_A.glb', [1.1286, 2.8569, 1.0341], [0.0521, 1.1671, -0.0773], 0.2613, 7.8),
    twisted: modelTuning('Tree_Bare_2_B.glb', [1.7878, 5.5417, 0.6639], [-0.0617, 2.412, 0.0982], 0.3588, 9.5),
    leafy: modelTuning('Tree_1_A.glb', [3.181, 4.1607, 3.2511], [-0.3441, 1.819, 0], 0.2613, 8.2),
    rock: modelTuning('Rock_1_A.glb', [0.578, 0.5403, 0.6078], [-0.0305, 0.2701, 0], 0, 0.65),
    bush: modelTuning('Bush_1_A.glb', [0.2672, 0.2267, 0.2341], [0, 0.1104, 0], 0.0029, 0.7),
    pumpkin: modelTuning('Pumpkin_Lantern_1.glb', [21.3895, 18.3218, 21.107], [0, 9.147, -0.2174], 0.014, 0.55),
    grave: modelTuning('Gravestone_1.glb', [35.963, 38.9129, 28.6592], [0.0001, 1.9565, 4.3065], 17.5, 1.2),
    lantern: modelTuning('Lantern_1.glb', [13.4516, 23.2558, 13.4484], [0, 11.6279, 0], 0, 0.7),
    skull: modelTuning('Big_Cat_Skull.glb', [15.4903, 15.6315, 20.127], [0, 3.2074, 0.0823], 4.6083, 0.28)
};

export type ForestModelId = keyof typeof FOREST_MODELS;
