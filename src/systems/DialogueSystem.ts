export type DialogueChoice = {
    readonly id: string;
    readonly label: string;
    readonly next: string | null;
};

export type DialogueNode = {
    readonly text: string;
    readonly choices: readonly DialogueChoice[];
};

export type DialogueDefinition = {
    readonly id: string;
    readonly speaker: string;
    readonly start: string;
    readonly nodes: Readonly<Record<string, DialogueNode>>;
};

export type DialogueState = {
    readonly dialogueId: string;
    readonly nodeId: string;
    readonly speaker: string;
    readonly text: string;
    readonly choices: readonly DialogueChoice[];
};

const validateDialogue = ({ id, start, nodes }: DialogueDefinition) => {
    if (!Object.hasOwn(nodes, start)) throw new Error(`Dialogue ${id}: missing start node ${start}.`);

    for (const [nodeId, node] of Object.entries(nodes)) {
        const choices = new Set<string>();
        for (const choice of node.choices) {
            if (choices.has(choice.id)) throw new Error(`Dialogue ${id}/${nodeId}: duplicate choice ${choice.id}.`);
            choices.add(choice.id);
            if (choice.next !== null && !Object.hasOwn(nodes, choice.next)) {
                throw new Error(`Dialogue ${id}/${nodeId}: missing destination ${choice.next}.`);
            }
        }
    }
};

export class DialogueSystem {
    onStateChange: ((state: DialogueState | null) => void) | null = null;

    private dialogue: DialogueDefinition | null = null;
    private nodeId = '';

    get state(): DialogueState | null {
        if (!this.dialogue) return null;
        const node = this.dialogue.nodes[this.nodeId];
        return {
            dialogueId: this.dialogue.id,
            nodeId: this.nodeId,
            speaker: this.dialogue.speaker,
            text: node.text,
            choices: node.choices
        };
    }

    open(dialogue: DialogueDefinition): boolean {
        if (this.dialogue) return false;
        validateDialogue(dialogue);
        this.dialogue = dialogue;
        this.nodeId = dialogue.start;
        this.onStateChange?.(this.state);
        return true;
    }

    choose(nodeId: string, choiceId: string): boolean {
        if (!this.dialogue || nodeId !== this.nodeId) return false;
        const choice = this.dialogue.nodes[this.nodeId].choices.find((entry) => entry.id === choiceId);
        if (!choice) return false;
        if (choice.next === null) {
            this.close();
        } else {
            this.nodeId = choice.next;
            this.onStateChange?.(this.state);
        }
        return true;
    }

    close() {
        if (!this.dialogue) return;
        this.dialogue = null;
        this.nodeId = '';
        this.onStateChange?.(null);
    }

    destroy() {
        this.close();
        this.onStateChange = null;
    }
}
