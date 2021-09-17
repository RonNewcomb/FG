import { frameCount, Hitbox, PPM } from "./interfaces";

export type I3DModel = object;
export type IAudio = object;
export class IColor { constructor(public R: PPM, public G: PPM, public B: PPM, public A?: PPM) { } };
export type IAudioClipHandle = object;
export type I3dPoint = object;
export type I3dRotation = object;
export type IInputResult = object;
export type IInputDevice = object;
export type IAsset = object;
export const enum AssetType { Character, Stage, Settings, UI }

export interface IPlatform {
    init(): IPlatform;
    end(): IPlatform;
    newFrame(): frameCount;
    drawHitbox(box: Hitbox): void;
    renderText(x: PPM, y: PPM, str: string): void;
    playAudio(clip: IAudio): IAudioClipHandle;
    stopAudio(handle: IAudioClipHandle): boolean;
    renderModel(model: I3DModel, location: I3dPoint, orientation: I3dRotation): void;
    readInput(device: IInputDevice): IInputResult;
    loadAsset(type: AssetType, name: string): Promise<IAsset>;
}

