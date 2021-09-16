import { Character } from "./character";
import { FrameData, HitboxProperties, HitboxSet } from "./interfaces";

export const standIdle: HitboxSet = [
    { x: 50000, y: 0, tall: 50000, wide: 115000, props: HitboxProperties.Hurtbox },
    { x: 50000, y: 50000, tall: 100000, wide: 100000, props: HitboxProperties.Hurtbox }
];

export const aWindup: HitboxSet = [
    { x: 50000, y: -15000, tall: 90000, wide: 100000, props: HitboxProperties.Hurtbox },
    { x: 50000, y: 85000, tall: 65000, wide: 100000, props: HitboxProperties.Hurtbox }
];

export const aGrab: HitboxSet = standIdle.concat([
    { x: 50000, y: 0, tall: 50000, wide: 150000, props: HitboxProperties.Grab }
]);

export const aStrike: HitboxSet = standIdle.concat([
    { x: 50000, y: 0, tall: 45000, wide: 300000, props: HitboxProperties.Strike },
]);

export const aRecovery: HitboxSet = [
    { x: 50000, y: 0, tall: 50000, wide: 150000, props: HitboxProperties.Hurtbox },
    { x: 50000, y: 50000, tall: 100000, wide: 200000, props: HitboxProperties.Hurtbox }
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

