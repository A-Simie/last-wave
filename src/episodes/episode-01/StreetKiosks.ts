import { Entity, Vec3, math } from 'playcanvas';
import type { AppBase, GraphNode } from 'playcanvas';

import type { GameAssets } from '../../core/AssetManager';
import { CAFE_MODELS } from '../../data/cafeModels';
import type { CafeModelId } from '../../data/cafeModels';
import type { CharacterModelId } from '../../data/characterModels';
import { createAnimatedCharacter } from '../../player/AnimatedCharacter';
import type { AnimatedCharacter } from '../../player/AnimatedCharacter';
import { createModelInstance } from '../../scenes/createModelInstance';
import { createTextSign } from '../../scenes/createTextSign';
import { createBoxVisual as box, createMaterial, createStaticBody } from '../../scenes/primitives';

import { STREET_KIOSKS, kioskQueue } from './streetLayout';
import type { KioskDefinition } from './streetLayout';

const CUSTOMER_Y = 0.048;
const QUEUE_LENGTH = 3;

type Customer = {
    character: AnimatedCharacter;
    hand: GraphNode;
    state: 'queue' | 'leaving' | 'resting' | 'returning';
    timer: number;
    target: Vec3;
    heading: number;
    item: Entity;
    side: number;
};
type Kiosk = {
    definition: KioskDefinition;
    vendor: AnimatedCharacter;
    customers: Customer[];
    queue: Customer[];
    slots: Vec3[];
    serving: number;
};

const CUSTOMER_MODELS: readonly CharacterModelId[] = [
    'patronLong',
    'patronBuzz',
    'patronShort',
    'patronBuns',
    'patronBeard',
    'commuterSuit'
];
const GOODS: Record<KioskDefinition['goods'], { model?: CafeModelId; fruit?: readonly [number, number, number][] }> = {
    water: { model: 'bottle' },
    soda: { model: 'cup' },
    juice: { model: 'icedDrink' },
    fruit: {
        fruit: [
            [0.96, 0.55, 0.12],
            [0.95, 0.82, 0.2],
            [0.42, 0.68, 0.22],
            [0.82, 0.18, 0.15]
        ]
    }
};

export class StreetKiosks {
    readonly root: Entity;
    private readonly kiosks: Kiosk[];
    private suspended = false;
    private readonly direction = new Vec3();

    constructor(root: Entity, kiosks: Kiosk[]) {
        this.root = root;
        this.kiosks = kiosks;
    }

    set paused(value: boolean) {
        this.suspended = value;
        if (value) for (const character of this.characters()) character.anim.playing = false;
    }

    private *characters() {
        for (const kiosk of this.kiosks) {
            yield kiosk.vendor;
            for (const customer of kiosk.customers) yield customer.character;
        }
    }

    syncAnimation(player: Vec3, range: number) {
        for (const character of this.characters()) {
            const p = character.root.getPosition();
            character.anim.playing = !this.suspended && Math.abs(p.x - player.x) + Math.abs(p.z - player.z) < range;
        }
    }

    step(dt: number, player: Vec3) {
        if (this.suspended) return;
        for (const kiosk of this.kiosks) {
            const [fx, fz] = kiosk.definition.facing;
            kiosk.queue.forEach((customer, index) => customer.target.copy(kiosk.slots[index]));
            const front = kiosk.queue[0];
            const atCounter = front && front.character.root.getPosition().distance(kiosk.slots[0]) < 0.08;
            kiosk.vendor.play(atCounter ? 'talk' : 'idle');
            if (front && atCounter) {
                front.timer -= dt;
                front.character.play('talk');
                if (front.timer <= 0) {
                    // Served: the item appears in hand and the customer steps aside to enjoy it.
                    front.item.enabled = true;
                    front.state = 'leaving';
                    front.side = (kiosk.serving++ % 2) * 2 - 1;
                    const side = front.side * (2.6 + (kiosk.serving % 3) * 0.6);
                    front.target.set(
                        kiosk.slots[0].x + fz * side + fx * 2.4,
                        CUSTOMER_Y,
                        kiosk.slots[0].z - fx * side + fz * 2.4
                    );
                    kiosk.queue.shift();
                }
            }
            for (const customer of kiosk.customers) {
                if (customer.state === 'resting') {
                    customer.timer -= dt;
                    customer.character.move(0);
                    if (customer.timer > 0) continue;
                    customer.item.enabled = false;
                    customer.state = 'returning';
                    kiosk.queue.push(customer);
                    customer.target.copy(kiosk.slots[kiosk.queue.length - 1]);
                }
                this.walk(customer, dt, player, kiosk);
            }
        }
    }

    private walk(customer: Customer, dt: number, player: Vec3, kiosk: Kiosk) {
        const position = customer.character.root.getPosition();
        this.direction.sub2(customer.target, position);
        this.direction.y = 0;
        const distance = this.direction.length();
        const [fx, fz] = kiosk.definition.facing;
        if (distance < 0.05) {
            customer.character.move(0);
            if (customer.state === 'leaving') {
                customer.state = 'resting';
                customer.timer = 5 + Math.random() * 4;
            } else if (customer.state === 'returning' && kiosk.queue[0] === customer) {
                customer.state = 'queue';
                customer.timer = 3.5 + Math.random() * 2.5;
            } else if (customer.state === 'returning') customer.state = 'queue';
            // Queuers face the window; resting customers turn half back toward the street.
            const yaw =
                customer.state === 'resting'
                    ? (Math.atan2(fx + customer.side * fz, fz - customer.side * fx) * 180) / Math.PI
                    : (Math.atan2(-fx, -fz) * 180) / Math.PI;
            customer.heading = math.lerpAngle(customer.heading, yaw, Math.min(1, dt * 6));
            customer.character.root.setEulerAngles(0, customer.heading, 0);
            if (customer.state === 'queue' && kiosk.queue[0] === customer && customer.timer <= 0)
                customer.timer = 3.5 + Math.random() * 2.5;
            return;
        }
        this.direction.normalize();
        const dx = player.x - position.x;
        const dz = player.z - position.z;
        if (player.y < 3 && Math.hypot(dx, dz) < 1 && dx * this.direction.x + dz * this.direction.z > 0) {
            customer.character.move(0);
            return;
        }
        const travel = Math.min(distance, dt * 1.05);
        customer.character.move(travel / dt);
        customer.heading = math.lerpAngle(
            customer.heading,
            (Math.atan2(this.direction.x, this.direction.z) * 180) / Math.PI,
            Math.min(1, dt * 8)
        );
        customer.character.root.setEulerAngles(0, customer.heading, 0);
        customer.character.root.setPosition(
            position.x + this.direction.x * travel,
            CUSTOMER_Y,
            position.z + this.direction.z * travel
        );
    }

    postUpdate() {
        for (const kiosk of this.kiosks)
            for (const customer of kiosk.customers) {
                if (!customer.item.enabled) continue;
                customer.item.setPosition(customer.hand.getPosition());
                customer.item.setEulerAngles(0, customer.heading, 0);
            }
    }
}

export const createStreetKiosks = (parent: Entity, app: AppBase, assets: GameAssets, player: Entity) => {
    const root = new Entity('street-kiosks');
    parent.addChild(root);
    const palette: Record<KioskDefinition['goods'], [number, number, number]> = {
        water: [0.16, 0.45, 0.63],
        soda: [0.78, 0.2, 0.18],
        juice: [0.93, 0.56, 0.16],
        fruit: [0.3, 0.55, 0.26]
    };
    const materials = {
        cream: createMaterial('kiosk-cream', 0.94, 0.9, 0.78),
        wood: createMaterial('kiosk-counter-wood', 0.5, 0.34, 0.2),
        dark: createMaterial('kiosk-trim', 0.12, 0.13, 0.13),
        ice: createMaterial('kiosk-ice', 0.82, 0.93, 0.97),
        water: createMaterial('kiosk-water', ...palette.water),
        soda: createMaterial('kiosk-soda', ...palette.soda),
        juice: createMaterial('kiosk-juice', ...palette.juice),
        fruit: createMaterial('kiosk-fruit', ...palette.fruit)
    };
    const fruitMaterials = GOODS.fruit.fruit!.map((color, i) => {
        const material = createMaterial(`kiosk-fruit-${i}`, ...color);
        material.gloss = 0.55;
        material.update();
        return material;
    });
    root.once('destroy', () => [...Object.values(materials), ...fruitMaterials].forEach((m) => m.destroy()));
    const goodsItem = (definition: KioskDefinition, name: string, index: number) => {
        const goods = GOODS[definition.goods];
        if (goods.model) return createModelInstance(assets.cafe[goods.model], CAFE_MODELS[goods.model], name).root;
        const fruit = new Entity(name);
        fruit.setLocalScale(0.11, 0.11, 0.11);
        fruit.addComponent('render', { type: 'sphere', material: fruitMaterials[index % fruitMaterials.length] });
        return fruit;
    };
    const kiosks: Kiosk[] = [];
    let modelIndex = 0;
    for (const definition of STREET_KIOSKS) {
        const body = createStaticBody(root, definition);
        const [fx, fz] = definition.facing;
        // Build in kiosk-local space: +Z is the serving side, X runs along the counter.
        const frame = new Entity(`${definition.name}-frame`);
        body.addChild(frame);
        frame.setLocalEulerAngles(0, (Math.atan2(fx, fz) * 180) / Math.PI, 0);
        const width = 2.8;
        const depth = 1.5;
        const accent = materials[definition.goods];
        box(frame, 'kiosk-base', [0, -0.75, 0], [width, 0.9, depth], accent);
        box(frame, 'kiosk-counter', [0, -0.27, 0.12], [width + 0.1, 0.06, depth + 0.1], materials.wood);
        box(frame, 'kiosk-back', [0, 0.25, -depth / 2 + 0.05], [width, 1.0, 0.1], materials.cream);
        for (const x of [-width / 2 + 0.05, width / 2 - 0.05])
            box(frame, `kiosk-post-${x}`, [x, 0.25, 0], [0.08, 1.0, depth], materials.dark);
        box(frame, 'kiosk-roof', [0, 0.82, 0.15], [width + 0.4, 0.12, depth + 0.6], materials.cream);
        for (let i = 0; i < 6; i++)
            box(
                frame,
                `kiosk-awning-${i}`,
                [-width / 2 - 0.2 + (i + 0.5) * ((width + 0.4) / 6), 0.7, depth / 2 + 0.42],
                [(width + 0.4) / 6, 0.22, 0.05],
                i % 2 ? materials.cream : accent
            );
        const sign = createTextSign(
            frame,
            app.graphicsDevice,
            `${definition.name}-sign`,
            [...definition.sign],
            '#22413d',
            2.6,
            0.5
        );
        frame.addChild(sign);
        sign.setLocalPosition(0, 1.15, depth / 2 + 0.2);
        sign.setLocalEulerAngles(90, 0, 0);
        // Display: an ice tray and a row of the kiosk's goods on the counter.
        box(frame, 'kiosk-ice-tray', [0, -0.22, 0.35], [width * 0.8, 0.05, 0.42], materials.ice);
        for (let i = 0; i < 7; i++) {
            const item = goodsItem(definition, `${definition.name}-display-${i}`, i);
            frame.addChild(item);
            item.setLocalPosition(-1.05 + i * 0.35, definition.goods === 'fruit' ? -0.14 : -0.2, 0.35);
        }
        const vendorModel = definition.goods === 'fruit' ? 'patronBeard' : 'barista';
        const vendor = createAnimatedCharacter(
            assets.characters[vendorModel],
            vendorModel,
            `${definition.name}-vendor`
        );
        frame.addChild(vendor.root);
        vendor.root.setLocalPosition(0, -1.2 + CUSTOMER_Y, -0.25);
        vendor.play('idle', 0);
        const slots = kioskQueue(definition, QUEUE_LENGTH).map((point) => new Vec3(...point));
        const customers: Customer[] = slots.map((slot, index) => {
            const model = CUSTOMER_MODELS[modelIndex++ % CUSTOMER_MODELS.length];
            const character = createAnimatedCharacter(
                assets.characters[model],
                model,
                `${definition.name}-customer-${index}`
            );
            root.addChild(character.root);
            const start = slot.clone();
            const p = player.getPosition();
            if (Math.hypot(p.x - start.x, p.z - start.z) < 1.2) start.x += fz * 1.5;
            character.root.setPosition(start);
            const heading = (Math.atan2(-fx, -fz) * 180) / Math.PI;
            character.root.setEulerAngles(0, heading, 0);
            character.root.addComponent('collision', {
                type: 'box',
                halfExtents: new Vec3(0.26, 0.9, 0.26),
                linearOffset: new Vec3(0, 0.9, 0)
            });
            character.root.addComponent('rigidbody', { type: 'kinematic' });
            character.play('idle', 0);
            character.anim.baseLayer!.activeStateCurrentTime = index * 0.4;
            const hand = character.root.findByName('hand_r');
            if (!hand) throw new Error(`${model} has no carrying hand.`);
            const item = goodsItem(definition, `${definition.name}-purchase-${index}`, index);
            root.addChild(item);
            item.enabled = false;
            return {
                character,
                hand,
                state: 'queue' as const,
                timer: 2 + index * 1.5,
                target: slot.clone(),
                heading,
                item,
                side: 1
            };
        });
        kiosks.push({ definition, vendor, customers, queue: [...customers], slots, serving: 0 });
    }
    return new StreetKiosks(root, kiosks);
};
