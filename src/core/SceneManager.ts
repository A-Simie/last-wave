import type { AppBase } from 'playcanvas';
import { Entity } from 'playcanvas';

export class SceneManager {
    private readonly app: AppBase;
    private root: Entity | null = null;

    constructor(app: AppBase) {
        this.app = app;
    }

    load<T>(name: string, build: (root: Entity) => T): T {
        this.destroy();
        const root = new Entity(name);
        this.root = root;
        this.app.root.addChild(root);

        try {
            return build(root);
        } catch (error) {
            this.destroy();
            throw error;
        }
    }

    destroy() {
        this.root?.destroy();
        this.root = null;
    }
}
