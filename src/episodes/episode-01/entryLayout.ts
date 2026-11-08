import type { BoxDefinition, Vector3Tuple } from '../../data/foundation.ts';

export const OFFICER_POSITION: Vector3Tuple = [82.5, 1.04, 1.4];
export const OFFICER_PLAYER_MARK: Vector3Tuple = [82.5, 1.04, 3.55];
export const OFFICER_FRIEND_MARK: Vector3Tuple = [80.7, 1.04, 2.55];
export const QUEUE_MARK: Vector3Tuple = [86.3, 1.04, -3.25];
export const QUEUE_FRIEND_MARK: Vector3Tuple = [87.55, 1.04, -3.15];
export const ADMISSION_OFFICER_MARK: Vector3Tuple = [86.1, 1.04, -12.6];
export const TICKET_COUNTER: BoxDefinition = {
    name: 'beach-ticket-counter',
    position: [75.3, 0.55, -3.4],
    size: [3.2, 1.1, 1]
};

export const STREET_FRIEND_ROUTE: readonly Vector3Tuple[] = [
    [8.1, 1.04, 6.65],
    [12.5, 1.04, 6.4],
    [18, 1.04, 6.4],
    [18, 1.04, 7.15],
    [22, 1.04, 7.15],
    [22, 1.04, 6.4],
    [56, 1.04, 6.4],
    [70, 1.04, 6.4],
    [80.7, 1.04, 6.4],
    OFFICER_FRIEND_MARK
];

export const ENTRY_SOLIDS: readonly BoxDefinition[] = [
    TICKET_COUNTER,
    { name: 'ticket-booth-west', position: [73.6, 1.6, -4.5], size: [0.22, 3.2, 3.2] },
    { name: 'ticket-booth-east', position: [77, 1.6, -4.5], size: [0.22, 3.2, 3.2] },
    { name: 'ticket-booth-back', position: [75.3, 1.6, -6], size: [3.6, 3.2, 0.2] },
    { name: 'ticket-booth-roof', position: [75.3, 3.3, -4.5], size: [4.2, 0.24, 4] },
    { name: 'beach-arch-west', position: [72.5, 2.5, -11.8], size: [1.25, 5, 1.5] },
    { name: 'beach-arch-east', position: [93, 2.5, -11.8], size: [1.25, 5, 1.5] },
    { name: 'beach-arch-beam', position: [82.75, 5.15, -11.8], size: [22, 1, 1.7] },
    { name: 'beach-entry-gate', position: [82.75, 0.95, -14.2], size: [21, 1.9, 0.16] },
    { name: 'beach-entry-west-fence', position: [69, 0.95, -10.5], size: [0.16, 1.9, 25] },
    { name: 'beach-entry-east-fence', position: [97, 0.95, -10.5], size: [0.16, 1.9, 25] },
    { name: 'beach-entry-rear-fence', position: [83, 0.95, -23], size: [28, 1.9, 0.16] },
    { name: 'queue-rail-west', position: [84.4, 0.5, -8.5], size: [0.1, 1, 8] },
    { name: 'queue-rail-east', position: [88.3, 0.5, -8.5], size: [0.1, 1, 8] }
];

export const ENTRY_SHOTS: Record<string, { position: Vector3Tuple; target: Vector3Tuple; fov: number }> = {
    officer: { position: [87, 3.2, 6.5], target: [81.9, 1.7, 0.5], fov: 52 },
    booth: { position: [87.5, 4, 6.2], target: [78.8, 1.8, -2.2], fov: 58 },
    line: { position: [77.5, 3.7, 7], target: [85, 1.8, -4.5], fov: 56 },
    friend: { position: [78, 2.7, 5.7], target: [80.7, 1.6, 2.55], fov: 52 },
    'queue-friend': { position: [91.1, 3, 0.2], target: [86.9, 1.6, -3.8], fov: 56 },
    admission: { position: [90, 3.2, -7.5], target: [86.1, 1.7, -12.6], fov: 54 }
};

export const BEACH_ARRIVAL_SPAWN: Vector3Tuple = [0, 1.08, 3.6];
export const BEACH_FRIEND_SPAWN: Vector3Tuple = [1.7, 1.04, 3.15];
export const BEACH_ARRIVAL_GROUND: BoxDefinition = {
    name: 'beach-arrival-ground',
    position: [0, -0.1, -2],
    size: [32, 0.2, 28]
};
export const BEACH_ARRIVAL_SOLIDS: readonly BoxDefinition[] = [
    BEACH_ARRIVAL_GROUND,
    { name: 'arrival-west-rail', position: [-15.7, 0.7, -2], size: [0.16, 1.4, 28] },
    { name: 'arrival-east-rail', position: [15.7, 0.7, -2], size: [0.16, 1.4, 28] },
    { name: 'arrival-rear-rail', position: [0, 0.7, 11.7], size: [31.4, 1.4, 0.16] },
    { name: 'arrival-seafront-rail', position: [0, 0.7, -15.7], size: [31.4, 1.4, 0.16] }
];
