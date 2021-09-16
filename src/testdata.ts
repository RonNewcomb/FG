import { FrameData, HitboxProperties, HitboxSet, PerFrameMoveEffects } from "./interfaces";

export const standIdle: HitboxSet = [
    { x: 50000, y: 0, tall: 50000, wide: 115000, props: HitboxProperties.Hurtbox },
    { x: 50000, y: 50000, tall: 100000, wide: 100000, props: HitboxProperties.Hurtbox }
];

export const aWindup: HitboxSet = [
    { x: 50000, y: -15000, tall: 90000, wide: 100000, props: HitboxProperties.Hurtbox },
    { x: 50000, y: 85000, tall: 65000, wide: 100000, props: HitboxProperties.Hurtbox }
];

export const aGrab: HitboxSet = standIdle.concat([
    { x: 50000, y: 0, tall: 50000, wide: 150000, props: HitboxProperties.Grab, effects: { damage: 100 } }
]);

export const aRecovery: HitboxSet = [
    { x: 50000, y: 0, tall: 50000, wide: 150000, props: HitboxProperties.Hurtbox },
    { x: 50000, y: 50000, tall: 100000, wide: 200000, props: HitboxProperties.Hurtbox }
];

export const aStrike: HitboxSet = aRecovery.concat([
    { x: 50000, y: 0, tall: 45000, wide: 300000, props: HitboxProperties.Strike, effects: { damage: 40 } },
]);

const toward: PerFrameMoveEffects = { xOffset: +5000 };
const backward: PerFrameMoveEffects = { xOffset: -5000 };

export const fdata1: FrameData = {
    moves: [
        // stand idle
        {
            hitboxes: [standIdle, standIdle, standIdle, standIdle,],
        },
        // walk to
        {
            models: [],
            animationAt: 0,
            hitboxes: [standIdle, standIdle, standIdle,],
            effects: [toward, toward, toward],
        },
        // walk back
        {
            hitboxes: [standIdle, standIdle, standIdle,],
            effects: [backward, backward, backward],
        },
        // grab attack
        {
            hitboxes: [aWindup, aGrab, aGrab, aGrab, aRecovery, aRecovery],
        },
        // strike attack
        {
            hitboxes: [aWindup, aWindup, aStrike, aStrike, aRecovery, aRecovery],
        }
    ]
}

