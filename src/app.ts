import { Hitbox, HitboxProperties } from "./interfaces";
import { IPlatform } from "./IPlatform";
import { PlatformBrowser } from "./PlatformBrowser";

const platformApi: IPlatform = new PlatformBrowser();
let currentFrame = 1;

function drawFrame() {
    const attack: Hitbox = { x: 50, y: 0, tall: 30, wide: 20, props: HitboxProperties.Strike };
    const target: Hitbox = { x: 50, y: 0, tall: 30, wide: 20, props: HitboxProperties.Hurtbox };

    platformApi.drawHitbox(attack, { R: 1, G: 0, B: 0 });
    platformApi.drawHitbox(target, { R: 0, G: 0, B: 1 });
    platformApi.renderText(500, 30, currentFrame.toString());
    currentFrame = platformApi.newFrame();
    // setTimeout(drawFrame, 1000 / 60);
}

drawFrame();
