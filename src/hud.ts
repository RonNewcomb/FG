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
    props: HitboxProperties.Grab, // for color
};


export class HUD {
    constructor(private readonly platformApi: IPlatform, private readonly assets: object) {
    }

    render(currentFrame: number, characters: Character[], fps: number): void {
        const secondsLeft = (99 - Math.floor(currentFrame / fps));
        this.platformApi.drawHitbox(timerSpace);
        this.platformApi.renderText(timerSpace.x, timerSpace.y - 3000, secondsLeft.toString());
        const p1Lifebar = translateToWorldCoordinates(lifebar, halfmillion - timerspaceWide - 5000, 0, false);
        this.platformApi.drawHitbox(p1Lifebar);
        const p2Lifebar = translateToWorldCoordinates(lifebar, halfmillion + timerspaceWide + 5000, 0, true);
        this.platformApi.drawHitbox(p2Lifebar);
        for (let character of characters)
            if (character.comboCounter)
                this.platformApi.renderText(450000 + (-character.facingDirection * 350000), 100000, character.comboCounter + " hits!");
    }
}
