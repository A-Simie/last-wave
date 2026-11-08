export type CutsceneBeat = {
    readonly id: string;
    readonly speaker: string;
    readonly text: string;
    readonly shot: string;
    readonly dialoguePlacement?: 'top-left' | 'top-right';
};

export type CutsceneDefinition = {
    readonly id: string;
    readonly title: string;
    readonly setting: string;
    readonly finishLabel?: string;
    readonly skipLabel?: string;
    readonly beats: readonly CutsceneBeat[];
};

export type CutsceneState = {
    readonly cutsceneId: string;
    readonly title: string;
    readonly setting: string;
    readonly finishLabel?: string;
    readonly skipLabel?: string;
    readonly beat: CutsceneBeat;
    readonly index: number;
    readonly totalCount: number;
};

export class CutsceneSystem {
    onStateChange: ((state: CutsceneState | null) => void) | null = null;
    onFinished: ((cutsceneId: string, skipped: boolean) => void) | null = null;

    private definition: CutsceneDefinition | null = null;
    private index = 0;
    private destroyed = false;

    get state(): CutsceneState | null {
        if (!this.definition) return null;
        return {
            cutsceneId: this.definition.id,
            title: this.definition.title,
            setting: this.definition.setting,
            finishLabel: this.definition.finishLabel,
            skipLabel: this.definition.skipLabel,
            beat: { ...this.definition.beats[this.index] },
            index: this.index,
            totalCount: this.definition.beats.length
        };
    }

    play(definition: CutsceneDefinition): boolean {
        if (this.destroyed || this.definition) return false;
        if (!definition.id.trim() || definition.beats.length === 0) {
            throw new Error('Cutscenes require an ID and at least one beat.');
        }
        const ids = new Set<string>();
        for (const beat of definition.beats) {
            if (!beat.id.trim() || !beat.text.trim() || ids.has(beat.id)) {
                throw new Error(`Cutscene ${definition.id}: invalid or duplicate beat ${beat.id}.`);
            }
            ids.add(beat.id);
        }
        this.definition = { ...definition, beats: definition.beats.map((beat) => ({ ...beat })) };
        this.index = 0;
        this.onStateChange?.(this.state);
        return true;
    }

    advance(cutsceneId: string, beatId: string): boolean {
        if (this.definition?.id !== cutsceneId || this.definition.beats[this.index].id !== beatId) return false;
        if (this.index + 1 === this.definition.beats.length) {
            this.finish(false);
        } else {
            this.index++;
            this.onStateChange?.(this.state);
        }
        return true;
    }

    skip(cutsceneId: string): boolean {
        if (this.definition?.id !== cutsceneId) return false;
        this.finish(true);
        return true;
    }

    cancel() {
        if (!this.definition) return;
        this.definition = null;
        this.index = 0;
        this.onStateChange?.(null);
    }

    private finish(skipped: boolean) {
        const id = this.definition!.id;
        this.definition = null;
        this.index = 0;
        this.onFinished?.(id, skipped);
        this.onStateChange?.(this.state);
    }

    destroy() {
        this.destroyed = true;
        this.definition = null;
        this.index = 0;
        this.onStateChange = null;
        this.onFinished = null;
    }
}
