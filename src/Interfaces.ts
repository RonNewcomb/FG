import { I3DModel, IAudio } from "./IPlatform";

export type PPM = number; // Parts Per Million: an integer from 0 to 1,000,000 used instead of a floating percentage
export const million = 1000000;
export const quartermillion = 250000;
export const halfmillion = 500000;
export const threequartermillion = 750000;

export type frameCount = number; // 1/60th of a second
export type damagePoints = number;
export type meterPoints = number;


export enum HitboxProperties { // bit flags
    Pushbox,
    Hurtbox,
    //Hitbox, // grab or strike
    Grab,
    Strike,
    Projectile,

    ImmuneGrab,
    ImmuneStrike,
    ImmuneProjectile,

    Armor,
    Counter,
    Reflect,

    KnockdownLight,
    KnockdownMedium,
    KnockdownHard,

    ReelingFromThrust,
    ReelingFromClockwiseX,
    ReelingFromCouterclockwiseX,
    ReelingFromOverhead,
    ReelingFromUnderhand,
}

export interface Hitbox {
    x: PPM;
    y: PPM;
    wide: PPM;
    tall: PPM;
    props: HitboxProperties; // bitfield
    effects?: ActivationEffects; // on hit/grab/reflected/countered/armored
}

export interface ActivationEffects {
    damage?: damagePoints;
    damageMultiplier?: number; // counter/reflector
    projectileSpeedMultiplier?: number; // reflected
    armorMaxThreshold?: damagePoints;
    // etc.
}

export type HitboxSet = Hitbox[]; // one frame has several hitboxes

export interface CharacterMove {
    models: I3DModel[];
    animationAt: number;
    sound?: IAudio;
    hitboxes: HitboxSet[]; // most entries in this array will be dups but we have O(1) lookup on nthFrame
    branchOnConnection: any; // hit-grab, rekkas, chain-cancel, whiff animations.... 
}

export interface FrameData {
    moves: CharacterMove[];
}

/** a hitbox touched a hurtbox, via property strike/grab/projectile/counter/reflect */
export interface Connected {
    0: Hitbox;
    1: Hitbox;
    2: HitboxProperties;
}
