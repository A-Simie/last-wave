import type { AppBase } from 'playcanvas';
import { Entity } from 'playcanvas';

export class SceneManager {
    private readonly app: AppBase;
    private root: Entity | null = null;
    private loading = false;
    private destroyed = false;

    constructor(app: AppBase) {
        this.app = app;
    }

    load<T>(name: string, build: (root: Entity) => T): T {
        if (this.destroyed) throw new Error('The scene manager has been destroyed.');
        if (this.loading) throw new Error('A scene transition is already in progress.');
        this.loading = true;
        const previous = this.root;
        const wasEnabled = previous?.enabled ?? false;
        const root = new Entity(name, this.app);
        root.enabled = false;

        try {
            let scene: T;
            try {
                this.app.root.addChild(root);
                scene = build(root);
                if (this.destroyed) throw new Error('The scene manager was destroyed during a transition.');
                if (previous) previous.enabled = false;
                root.enabled = true;
            } catch (error) {
                root.destroy();
                if (previous && !this.destroyed) previous.enabled = wasEnabled;
                throw error;
            }

            this.root = root;
            previous?.destroy();
            return scene;
        } finally {
            this.loading = false;
        }
    }

    destroy() {
        this.destroyed = true;
        const root = this.root;
        this.root = null;
        root?.destroy();
    }
}
