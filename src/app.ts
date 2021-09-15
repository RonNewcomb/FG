import { Hitbox, HitboxProperties } from "./interfaces";
import { IPlatform } from "./IPlatform";
import { PlatformBrowser } from "./PlatformBrowser";

const platformApi: IPlatform = new PlatformBrowser().init();
let currentFrame = 1;

function drawFrame() {
    const attack: Hitbox = { x: 50000, y: 5000, tall: 60000, wide: 20000, props: HitboxProperties.Strike };
    const target: Hitbox = { x: 50000, y: 5000, tall: 30000, wide: 40000, props: HitboxProperties.Hurtbox };

    platformApi.drawHitbox(attack, HitboxProperties.Strike);
    platformApi.drawHitbox(target, HitboxProperties.Hurtbox);

    platformApi.renderText(900000, 900000, currentFrame.toString());


    platformApi.newFrame();
    currentFrame++;
    // setTimeout(drawFrame, 1000 / 60);
}

drawFrame();
