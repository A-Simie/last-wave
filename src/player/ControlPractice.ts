import { KEY_A, KEY_D, KEY_DOWN, KEY_LEFT, KEY_RIGHT, KEY_S, KEY_UP, KEY_W, Script, Vec3 } from 'playcanvas';
import type { Entity } from 'playcanvas';

export class ControlPractice extends Script {
    static scriptName = 'controlPractice';

    camera!: Entity;
    onPractised!: (control: 'move' | 'look') => void;
    private mode: 'move' | 'look' | null = null;
    private amount = 0;
    private leftGesture = false;
    private rightGesture = false;
    private lookInputTime = 0;
    private readonly position = new Vec3();
    private readonly forward = new Vec3();
    private readonly lookPointers = new Map<number, { x: number; y: number }>();
    private readonly onLeft = (bx: number, by: number, sx: number, sy: number) => {
        this.leftGesture = Math.hypot(sx - bx, sy - by) > 8;
    };
    private readonly onRight = (bx: number, by: number, sx: number, sy: number) => {
        this.rightGesture = Math.hypot(sx - bx, sy - by) > 8;
    };
    private readonly onMouse = (event: MouseEvent) => {
        if (
            this.mode === 'look' &&
            document.pointerLockElement === this.app.graphicsDevice.canvas &&
            Math.hypot(event.movementX, event.movementY) > 0
        )
            this.lookInputTime = 0.2;
    };
    private readonly onPointerDown = (event: PointerEvent) => {
        if (this.mode === 'look' && event.pointerType === 'touch' && event.clientX >= window.innerWidth * 0.5) {
            this.lookPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        }
    };
    private readonly onPointerMove = (event: PointerEvent) => {
        const pointer = this.lookPointers.get(event.pointerId);
        if (!pointer) return;
        if (event.clientX !== pointer.x || event.clientY !== pointer.y) this.lookInputTime = 0.2;
        pointer.x = event.clientX;
        pointer.y = event.clientY;
    };
    private readonly onPointerUp = (event: PointerEvent) => {
        this.lookPointers.delete(event.pointerId);
    };

    initialize() {
        const canvas = this.app.graphicsDevice.canvas;
        this.app.on('joystick:left', this.onLeft);
        this.app.on('joystick:right', this.onRight);
        window.addEventListener('mousemove', this.onMouse);
        canvas.addEventListener('pointerdown', this.onPointerDown);
        canvas.addEventListener('pointermove', this.onPointerMove);
        canvas.addEventListener('pointerup', this.onPointerUp);
        canvas.addEventListener('pointercancel', this.onPointerUp);
        canvas.addEventListener('lostpointercapture', this.onPointerUp);
        this.on('destroy', () => {
            this.app.off('joystick:left', this.onLeft);
            this.app.off('joystick:right', this.onRight);
            window.removeEventListener('mousemove', this.onMouse);
            canvas.removeEventListener('pointerdown', this.onPointerDown);
            canvas.removeEventListener('pointermove', this.onPointerMove);
            canvas.removeEventListener('pointerup', this.onPointerUp);
            canvas.removeEventListener('pointercancel', this.onPointerUp);
            canvas.removeEventListener('lostpointercapture', this.onPointerUp);
            this.lookPointers.clear();
        });
    }

    setMode(mode: 'move' | 'look' | null) {
        if (mode === this.mode) return;
        this.mode = mode;
        this.amount = 0;
        this.lookInputTime = 0;
        this.leftGesture = false;
        this.rightGesture = false;
        this.lookPointers.clear();
        this.position.copy(this.entity.getPosition());
        this.forward.copy(this.camera.forward);
    }

    postUpdate(dt: number) {
        if (!this.mode || dt <= 0 || document.hidden) return;
        const position = this.entity.getPosition();
        const forward = this.camera.forward;
        const pads = navigator.getGamepads?.() ?? [];
        const gamepadMove = Array.from(pads).some((pad) => pad && Math.hypot(pad.axes[0] ?? 0, pad.axes[1] ?? 0) > 0.3);
        const gamepadLook = Array.from(pads).some((pad) => pad && Math.hypot(pad.axes[2] ?? 0, pad.axes[3] ?? 0) > 0.3);
        if (this.mode === 'move') {
            const moving =
                this.leftGesture ||
                gamepadMove ||
                [KEY_W, KEY_A, KEY_S, KEY_D, KEY_UP, KEY_DOWN, KEY_LEFT, KEY_RIGHT].some((key) =>
                    this.app.keyboard?.isPressed(key)
                );
            const distance = Math.hypot(position.x - this.position.x, position.z - this.position.z);
            if (moving && distance < 1) this.amount += distance;
        } else if (this.rightGesture || gamepadLook || this.lookInputTime > 0) {
            this.amount += Math.acos(Math.max(-1, Math.min(1, forward.dot(this.forward))));
        }
        this.position.copy(position);
        this.forward.copy(forward);
        this.lookInputTime = Math.max(0, this.lookInputTime - dt);
        if (this.amount >= (this.mode === 'move' ? 1.3 : Math.PI / 9)) {
            const mode = this.mode;
            this.setMode(null);
            this.onPractised(mode);
        }
    }
}
