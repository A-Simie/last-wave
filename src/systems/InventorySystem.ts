export type InventoryItemDefinition = {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly source: string;
};

export type InventoryState = {
    readonly items: readonly InventoryItemDefinition[];
};

export class InventorySystem {
    onStateChange: ((state: InventoryState) => void) | null = null;

    private readonly definitions = new Map<string, InventoryItemDefinition>();
    private readonly acquired = new Set<string>();
    private destroyed = false;

    constructor(definitions: readonly InventoryItemDefinition[]) {
        for (const definition of definitions) {
            if (!definition.id.trim()) throw new Error('Inventory items require a non-empty ID.');
            if (this.definitions.has(definition.id)) throw new Error(`Duplicate inventory item: ${definition.id}.`);
            this.definitions.set(definition.id, { ...definition });
        }
    }

    get state(): InventoryState {
        return { items: [...this.acquired].map((id) => ({ ...this.definitions.get(id)! })) };
    }

    acquire(itemId: string): boolean {
        if (this.destroyed || !this.definitions.has(itemId) || this.acquired.has(itemId)) return false;
        this.acquired.add(itemId);
        this.onStateChange?.(this.state);
        return true;
    }

    reset() {
        if (this.destroyed || this.acquired.size === 0) return;
        this.acquired.clear();
        this.onStateChange?.(this.state);
    }

    destroy() {
        this.destroyed = true;
        this.onStateChange = null;
        this.acquired.clear();
        this.definitions.clear();
    }
}
