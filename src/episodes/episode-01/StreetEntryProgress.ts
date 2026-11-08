import type { DialogueSelection } from '../../systems/DialogueSystem.ts';
import type { InventorySystem } from '../../systems/InventorySystem.ts';
import { QuestSystem } from '../../systems/QuestSystem.ts';
import type { QuestSnapshot } from '../../systems/QuestSystem.ts';

import {
    BEACH_ADMISSION_COST,
    BEACH_PASSES,
    ENTRY_LESSONS,
    ENTRY_QUEST,
    OFFICER_CUTSCENE,
    QUEUE_CUTSCENE
} from './entry.ts';
import { STARTER_BAG } from './opening.ts';

export class StreetEntryProgress {
    readonly quest = new QuestSystem(ENTRY_QUEST);
    onArrivalRequested: (() => void) | null = null;
    private readonly inventory: InventorySystem;
    private destroyed = false;

    constructor(inventory: InventorySystem, snapshot?: QuestSnapshot) {
        this.inventory = inventory;
        if (snapshot && !this.quest.restore(snapshot)) throw new Error('Invalid beach-entry progress.');
    }

    get lesson() {
        return this.hasItem(STARTER_BAG.id) ? (ENTRY_LESSONS[this.quest.state.completedCount] ?? null) : null;
    }

    get funds() {
        return this.hasItem(STARTER_BAG.id) && !this.hasItem(BEACH_PASSES.id) ? BEACH_ADMISSION_COST : 0;
    }

    get canQueue() {
        const count = this.quest.state.completedCount;
        return !this.destroyed && this.hasItem(BEACH_PASSES.id) && (count === 6 || count === 7);
    }

    private hasItem(id: string) {
        return this.inventory.snapshot.itemIds.includes(id);
    }

    practise(control: 'move' | 'look') {
        return (
            !this.destroyed && this.hasItem(STARTER_BAG.id) && this.quest.handle({ type: 'control-practiced', control })
        );
    }

    leaveCafe() {
        if (this.destroyed || !this.hasItem(STARTER_BAG.id) || this.quest.state.completedCount < 2) return false;
        this.quest.handle({ type: 'interaction', targetId: 'cafe-exit' });
        return true;
    }

    choose(selection: DialogueSelection) {
        if (this.destroyed) return false;
        if (selection.dialogueId === 'e1-beach-tickets') {
            if (
                this.quest.state.completedCount !== 5 ||
                selection.nodeId !== 'offer' ||
                selection.choiceId !== 'buy' ||
                this.funds !== BEACH_ADMISSION_COST ||
                !this.inventory.acquire(BEACH_PASSES.id)
            )
                return false;
        }
        return this.quest.handle({ type: 'dialogue-choice', ...selection });
    }

    finishCutscene(cutsceneId: string) {
        if (this.destroyed || (cutsceneId !== OFFICER_CUTSCENE.id && cutsceneId !== QUEUE_CUTSCENE.id)) return false;
        if (cutsceneId === QUEUE_CUTSCENE.id && !this.canQueue) return false;
        const changed = this.quest.handle({ type: 'cutscene-complete', cutsceneId });
        if (changed && cutsceneId === QUEUE_CUTSCENE.id) this.requestArrival();
        return changed;
    }

    requestArrival() {
        if (!this.canQueue || this.quest.state.completedCount !== 7) return false;
        this.onArrivalRequested?.();
        return true;
    }

    destroy() {
        this.destroyed = true;
        this.onArrivalRequested = null;
        this.quest.destroy();
    }
}
