import { Hitbox, HitboxProperties, HitboxSet, IControlSource } from "../interfaces/interfaces";

export const NoHitboxes: HitboxSet = []; // default value instead of null or [] -- prevent memory fragmentation issues

export const hasAll = (boxProp: HitboxProperties, properties: HitboxProperties) => (boxProp & properties) === properties;
export const hasAny = (boxProp: HitboxProperties, properties: HitboxProperties) => (boxProp & properties) !== 0;
export const hasNone = (boxProp: HitboxProperties, properties: HitboxProperties) => (boxProp & properties) === 0;

export class NullInput implements IControlSource {
    constructor(framedata: any) { }
    getButtons = () => 0;
    roundReset = () => 0;
    matchReset = () => 0;
}

export function translateToWorldCoordinates(box: Hitbox, x: number, y: number, facingRight: boolean): Hitbox {
    const translatedBox: Hitbox = {
        x: facingRight ? (x + box.x) : (x - box.x - box.wide),
        y: box.y + y,
        tall: box.tall,
        wide: box.wide,
        props: box.props,
        effects: box.effects,
    };
    return translatedBox;
}

