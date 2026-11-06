export type InventoryItemDefinition = {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly source: string;
    readonly kind?: 'clue' | 'quest';
};

export type InventoryState = {
    readonly items: readonly InventoryItemDefinition[];
};

export type InventorySnapshot = {
    readonly itemIds: readonly string[];
};

export const isInventorySnapshot = (value: unknown, knownIds: readonly string[]): value is InventorySnapshot => {
    if (!value || typeof value !== 'object') return false;
    const snapshot = value as Partial<InventorySnapshot>;
    return (
        Array.isArray(snapshot.itemIds) &&
        Array.from(snapshot.itemIds).every((id) => typeof id === 'string' && knownIds.includes(id)) &&
        new Set(snapshot.itemIds).size === snapshot.itemIds.length
    );
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

    get snapshot(): InventorySnapshot {
        return { itemIds: [...this.acquired] };
    }

    restore(snapshot: unknown): boolean {
        if (this.destroyed || !isInventorySnapshot(snapshot, [...this.definitions.keys()])) return false;
        const current = [...this.acquired];
        if (current.length !== snapshot.itemIds.length || current.some((id, index) => id !== snapshot.itemIds[index])) {
            this.acquired.clear();
            snapshot.itemIds.forEach((id) => this.acquired.add(id));
            this.onStateChange?.(this.state);
        }
        return true;
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
