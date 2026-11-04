export type QuestEvent =
    | {
          readonly type: 'dialogue-choice';
          readonly dialogueId: string;
          readonly nodeId: string;
          readonly choiceId: string;
      }
    | { readonly type: 'interaction'; readonly targetId: string };

export type QuestObjective = {
    readonly id: string;
    readonly text: string;
    readonly event: QuestEvent;
};

export type QuestDefinition = {
    readonly id: string;
    readonly title: string;
    readonly objectives: readonly QuestObjective[];
    readonly completionMessage: string;
};

export type QuestState = {
    readonly questId: string;
    readonly title: string;
    readonly completedCount: number;
    readonly totalCount: number;
    readonly completionMessage: string;
} & (
    | { readonly status: 'inactive' | 'active'; readonly objective: Pick<QuestObjective, 'id' | 'text'> }
    | { readonly status: 'completed'; readonly objective: null }
);

const matchesEvent = (expected: QuestEvent, event: QuestEvent): boolean => {
    if (expected.type === 'interaction') {
        return event.type === 'interaction' && expected.targetId === event.targetId;
    }
    return (
        event.type === 'dialogue-choice' &&
        expected.dialogueId === event.dialogueId &&
        expected.nodeId === event.nodeId &&
        expected.choiceId === event.choiceId
    );
};

const validateQuest = ({ id, objectives }: QuestDefinition) => {
    if (objectives.length === 0) throw new Error(`Quest ${id}: at least one objective is required.`);
    const ids = new Set<string>();
    const events: QuestEvent[] = [];
    for (const objective of objectives) {
        if (ids.has(objective.id)) throw new Error(`Quest ${id}: duplicate objective ${objective.id}.`);
        if (events.some((event) => matchesEvent(event, objective.event))) {
            throw new Error(`Quest ${id}: duplicate event for objective ${objective.id}.`);
        }
        ids.add(objective.id);
        events.push(objective.event);
    }
};

export class QuestSystem {
    onStateChange: ((state: QuestState) => void) | null = null;

    private readonly definition: QuestDefinition;
    private completedCount = 0;
    private destroyed = false;

    constructor(definition: QuestDefinition) {
        validateQuest(definition);
        this.definition = definition;
    }

    get state(): QuestState {
        const { id, title, objectives, completionMessage } = this.definition;
        const progress = {
            questId: id,
            title,
            completedCount: this.completedCount,
            totalCount: objectives.length,
            completionMessage
        };
        const objective = objectives[this.completedCount];
        if (!objective) return { ...progress, status: 'completed', objective: null };
        return {
            ...progress,
            status: this.completedCount === 0 ? 'inactive' : 'active',
            objective: { id: objective.id, text: objective.text }
        };
    }

    handle(event: QuestEvent): boolean {
        if (this.destroyed) return false;
        const objective = this.definition.objectives[this.completedCount];
        if (!objective || !matchesEvent(objective.event, event)) return false;
        this.completedCount++;
        this.onStateChange?.(this.state);
        return true;
    }

    reset() {
        if (this.destroyed || this.completedCount === 0) return;
        this.completedCount = 0;
        this.onStateChange?.(this.state);
    }

    destroy() {
        this.destroyed = true;
        this.onStateChange = null;
        this.completedCount = 0;
    }
}
