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
    Pushbox = 1,
    Hurtbox = 2,

    Grab = 4,
    Strike = 8,
    Projectile = 16,

    ImmuneGrab = 32,
    ImmuneStrike = 64,
    ImmuneProjectile = 128,

    Armor = 256,
    Counter = 512,
    Reflect = 1024,

    KnockdownLight = 2048,
    KnockdownMedium = 4096,
    KnockdownHard = 8192,

    ReelingFromThrust = 16384,
    ReelingFromClockwiseX = 32768,
    ReelingFromCouterclockwiseX = 65536,
    ReelingFromOverhead = 131072,
    ReelingFromUnderhand = 262144,

    Blocking = 524288,
}

/** index into FrameData.moves */
export const enum SystemMove {
    // cannot be chosen by player
    Hit = 0,
    // can be chosen by player
    StandIdle = 1,
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

export interface PerFrameMoveEffects {
    xOffset?: PPM;
    yOffset?: PPM;
    xVelocity?: PPM;
    yVelocity?: PPM;
}

export interface CharacterMove {
    models?: I3DModel[];
    animationAt?: number;
    sound?: IAudio;
    hitboxes: HitboxSet[]; // index is the Nth Frame of the move 
    effects?: PerFrameMoveEffects[];// index is the Nth Frame of the move 
    branchOnConnection?: any; // hit-grab, rekkas, chain-cancel, whiff animations.... 
}

export interface FrameData {
    moves: CharacterMove[]; // index is SystemMove or more
}

/** a hitbox touched a hurtbox, via property strike/grab/projectile/counter/reflect */
export interface Connected {
    0: Hitbox; // successful attack
    1: Hitbox; // tagged hurtbox
    2: HitboxProperties; // type of attack (since [0] may have multiple properties i.e. both counter and reflector)
}

// input ///////

export type IButtonArray = number; // as bitfield

export interface IControlSourceType {
    new(fdata: FrameData): IControlSource;
}

export interface IControlSource {
    getButtons(): IButtonArray;
    roundReset(): void;
    matchReset(): void;
}

export interface IControllerInput extends IControlSource {
}

export interface IAiInput extends IControlSource {
}

export interface IReplaySystem extends IControlSource {
}

