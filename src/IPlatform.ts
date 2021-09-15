import { Between0And1, frameCount, Hitbox } from "./interfaces";

export type I3DModel = object;
export type IAudio = object;
export class IColor { constructor(public R: Between0And1, public G: Between0And1, public B: Between0And1, public A?: Between0And1) { } };
export type IAudioClipHandle = object;
export type I3dPoint = object;
export type I3dRotation = object;
export type IInputResult = object;
export type IInputDevice = object;

export interface IPlatform {
    newFrame(): frameCount;
    drawHitbox(box: Hitbox, color: IColor): void;
    renderText(x: number, y: number, str: string): void;
    playAudio(clip: IAudio): IAudioClipHandle;
    stopAudio(handle: IAudioClipHandle): boolean;
    renderModel(model: I3DModel, location: I3dPoint, orientation: I3dRotation): void;
    readInput(device: IInputDevice): IInputResult;
}

