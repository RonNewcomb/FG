// platform specific
export type I3DModel = object;
export type IAudio = object;


export type pixelCount = number;
export type frameCount = number;
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
    x: pixelCount;
    y: pixelCount;
    wide: pixelCount;
    tall: pixelCount;
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
export interface Connection {
    0: Hitbox;
    1: Hitbox;
    2: HitboxProperties;
}
