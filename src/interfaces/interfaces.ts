import { ICharacterRecord } from "../game/character";
import { I3DModel, IAudio } from "./IPlatform";

export type Dictionary<T> = { [key: string]: T };

export const oneSecond = 1000;
export const fps = 10;
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
    WalkForward = 2,
    WalkBack = 3,
    // first attack move
    AttackMovesBegin = 4,
}

export interface Hitbox {
    readonly x: PPM;
    readonly y: PPM;
    readonly wide: PPM;
    readonly tall: PPM;
    readonly props: HitboxProperties; // bitfield
    readonly effects?: ActivationEffects; // on hit/grab/reflected/countered/armored
}

export interface ActivationEffects {
    readonly damage?: damagePoints;
    readonly damageMultiplier?: number; // counter/reflector
    readonly projectileSpeedMultiplier?: number; // reflected
    readonly armorMaxThreshold?: damagePoints;
    // etc.
}

export type HitboxSet = Hitbox[]; // one frame has several hitboxes

export interface PerFrameMoveEffects {
    readonly xOffset?: PPM;
    readonly yOffset?: PPM;
    readonly xVelocity?: PPM;
    readonly yVelocity?: PPM;
}

export interface CharacterMove {
    readonly models?: I3DModel[];
    readonly animationAt?: number;
    readonly sound?: IAudio;
    readonly hitboxes: HitboxSet[]; // index is the Nth Frame of the move
    readonly effects?: PerFrameMoveEffects[];// index is the Nth Frame of the move
    readonly branchOnConnection?: any; // hit-grab, rekkas, chain-cancel, whiff animations....
}

export interface FrameData {
    readonly moves: CharacterMove[]; // index is SystemMove or more
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

// rollback //////

export interface IGameState {
    inputs: IButtonArray[];
    states?: ICharacterRecord[];
}

// reporting /////

export interface FullReport {
    report: Array<Array<MoveVsMove>>;
    smallestDistance: number;
    moves: CharacterMove[][];
}

export interface MoveVsMove {
    p2BeginsAttackOnThisFrame: number;
    matchup: [boolean, boolean, frameCount][][];
}