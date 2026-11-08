export type QuestEvent =
    | {
          readonly type: 'dialogue-choice';
          readonly dialogueId: string;
          readonly nodeId: string;
          readonly choiceId: string;
      }
    | { readonly type: 'interaction'; readonly targetId: string }
    | { readonly type: 'cutscene-complete'; readonly cutsceneId: string }
    | { readonly type: 'control-practiced'; readonly control: 'move' | 'look' };

export type QuestObjective = {
    readonly id: string;
    readonly text: string;
    readonly event: QuestEvent;
};

export type QuestDefinition = {
    readonly id: string;
    readonly title: string;
    readonly order?: 'ordered' | 'any';
    readonly objectives: readonly QuestObjective[];
    readonly completionMessage: string;
};

export type QuestSnapshot = {
    readonly questId: string;
    readonly completedObjectiveIds: readonly string[];
};

export const isQuestSnapshot = (value: unknown, definition: QuestDefinition): value is QuestSnapshot => {
    if (!value || typeof value !== 'object') return false;
    const snapshot = value as Partial<QuestSnapshot>;
    return (
        snapshot.questId === definition.id &&
        Array.isArray(snapshot.completedObjectiveIds) &&
        snapshot.completedObjectiveIds.length <= definition.objectives.length &&
        new Set(snapshot.completedObjectiveIds).size === snapshot.completedObjectiveIds.length &&
        (definition.order === 'any'
            ? Array.from(snapshot.completedObjectiveIds).every((id) =>
                  definition.objectives.some((entry) => entry.id === id)
              )
            : definition.objectives
                  .slice(0, snapshot.completedObjectiveIds.length)
                  .every((objective, index) => objective.id === snapshot.completedObjectiveIds![index]))
    );
};

export type QuestState = {
    readonly questId: string;
    readonly title: string;
    readonly completedCount: number;
    readonly totalCount: number;
    readonly completionMessage: string;
    readonly order: 'ordered' | 'any';
    readonly remainingObjectives: readonly Pick<QuestObjective, 'id' | 'text'>[];
} & (
    | { readonly status: 'inactive' | 'active'; readonly objective: Pick<QuestObjective, 'id' | 'text'> }
    | { readonly status: 'completed'; readonly objective: null }
);

const matchesEvent = (expected: QuestEvent, event: QuestEvent): boolean => {
    if (expected.type === 'interaction') {
        return event.type === 'interaction' && expected.targetId === event.targetId;
    }
    if (expected.type === 'cutscene-complete') {
        return event.type === 'cutscene-complete' && expected.cutsceneId === event.cutsceneId;
    }
    if (expected.type === 'control-practiced') {
        return event.type === 'control-practiced' && expected.control === event.control;
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
    private completed = new Set<string>();
    private destroyed = false;

    constructor(definition: QuestDefinition) {
        validateQuest(definition);
        this.definition = {
            ...definition,
            objectives: definition.objectives.map((objective) => ({ ...objective, event: { ...objective.event } }))
        };
    }

    get snapshot(): QuestSnapshot {
        return {
            questId: this.definition.id,
            completedObjectiveIds: this.definition.objectives
                .filter(({ id }) => this.completed.has(id))
                .map(({ id }) => id)
        };
    }

    restore(snapshot: unknown): boolean {
        if (this.destroyed || !isQuestSnapshot(snapshot, this.definition)) return false;
        const ids = snapshot.completedObjectiveIds;
        if (ids.length !== this.completed.size || ids.some((id) => !this.completed.has(id))) {
            this.completed = new Set(ids);
            this.onStateChange?.(this.state);
        }
        return true;
    }

    get state(): QuestState {
        const { id, title, objectives, completionMessage, order = 'ordered' } = this.definition;
        const remainingObjectives = objectives
            .filter(({ id }) => !this.completed.has(id))
            .map(({ id, text }) => ({ id, text }));
        const progress = {
            questId: id,
            title,
            completedCount: this.completed.size,
            totalCount: objectives.length,
            completionMessage,
            order,
            remainingObjectives
        };
        const objective = remainingObjectives[0];
        if (!objective) return { ...progress, status: 'completed', objective: null };
        return {
            ...progress,
            status: this.completed.size === 0 && order === 'ordered' ? 'inactive' : 'active',
            objective: { id: objective.id, text: objective.text }
        };
    }

    handle(event: QuestEvent): boolean {
        if (this.destroyed) return false;
        const remaining = this.definition.objectives.filter(({ id }) => !this.completed.has(id));
        const objective =
            this.definition.order === 'any'
                ? remaining.find((entry) => matchesEvent(entry.event, event))
                : remaining[0];
        if (!objective || !matchesEvent(objective.event, event)) return false;
        this.completed.add(objective.id);
        this.onStateChange?.(this.state);
        return true;
    }

    reset() {
        if (this.destroyed || this.completed.size === 0) return;
        this.completed.clear();
        this.onStateChange?.(this.state);
    }

    destroy() {
        this.destroyed = true;
        this.onStateChange = null;
        this.completed.clear();
    }
}
