import { Character } from "./character";
import { Hitbox, halfmillion, HitboxProperties } from "./interfaces";
import { IPlatform } from "./IPlatform";
import { translateToWorldCoordinates } from "./util";

export const timerspaceWide = 20000;
export const timerspaceTall = 7000;
export const timerSpace: Hitbox = {
    x: halfmillion - timerspaceWide,
    y: 20000 - timerspaceTall,
    tall: 20000 + timerspaceTall * 2,
    wide: timerspaceWide * 2,
    props: 0
};
export const lifebar: Hitbox = {
    x: 0,
    y: 20000,
    tall: 20000,
    wide: 450000,
    props: HitboxProperties.Grab
};

let platformApi: IPlatform;

export class HUD {
    constructor(platform: IPlatform) {
        platformApi = platform;
    }

    render(currentFrame: number, p1: Character, p2: Character, hits: number): void {
        const secondsLeft = (99 - Math.floor(currentFrame / 20));
        platformApi.drawHitbox(timerSpace);
        platformApi.renderText(timerSpace.x, timerSpace.y, secondsLeft.toString());
        const p1Lifebar = translateToWorldCoordinates(lifebar, halfmillion - timerspaceWide - 5000, 0, false);
        platformApi.drawHitbox(p1Lifebar);
        const p2Lifebar = translateToWorldCoordinates(lifebar, halfmillion + timerspaceWide + 5000, 0, true);
        platformApi.drawHitbox(p2Lifebar);
        platformApi.renderText(800000, 100000, hits + " hits!");
    }
}
