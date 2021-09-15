import { Character } from "./character";
import { FrameData, HitboxProperties, HitboxSet } from "./interfaces";

export const standIdle: HitboxSet = [
    { x: 50000, y: 0, tall: 10000, wide: 23000, props: HitboxProperties.Hurtbox },
    { x: 50000, y: 10000, tall: 20000, wide: 20000, props: HitboxProperties.Hurtbox }
];

export const aWindup: HitboxSet = [
    { x: 50000, y: -5000, tall: 15000, wide: 20000, props: HitboxProperties.Hurtbox },
    { x: 50000, y: 10000, tall: 20000, wide: 20000, props: HitboxProperties.Hurtbox }
];

export const aGrab: HitboxSet = standIdle.concat([
    { x: 50000, y: 0, tall: 10000, wide: 30000, props: HitboxProperties.Grab }
]);

export const aStrike: HitboxSet = standIdle.concat([
    { x: 50000, y: 0, tall: 9000, wide: 60000, props: HitboxProperties.Strike },
]);

export const aRecovery: HitboxSet = [
    { x: 50000, y: 0, tall: 10000, wide: 30000, props: HitboxProperties.Hurtbox },
    { x: 50000, y: 10000, tall: 20000, wide: 40000, props: HitboxProperties.Hurtbox }
];

export const fdata1: FrameData = {
    moves: [
        // stand idle
        {
            models: [],
            animationAt: 0,
            hitboxes: [standIdle, standIdle, standIdle, standIdle,],
        },
        // grab attack
        {
            models: [],
            animationAt: 0,
            hitboxes: [aWindup, aGrab, aGrab, aGrab, aRecovery, aRecovery],
        },
        // strike attack
        {
            models: [],
            animationAt: 0,
            hitboxes: [aWindup, aWindup, aStrike, aStrike, aRecovery, aRecovery],
        }
    ]
}

export const character1 = new Character([], [], fdata1);
export const character2 = new Character([], [], fdata1);

