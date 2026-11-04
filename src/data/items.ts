import type { InventoryItemDefinition } from '../systems/InventorySystem';

export const SIGNAL_BOX_NOTE = {
    id: 'signal-box-note',
    title: 'Signal box note',
    source: 'Amber signal box',
    description:
        'A maintenance note attached to the panel reads:\n“After inspecting the signal box, return to the guide and report your findings.”'
} satisfies InventoryItemDefinition;
