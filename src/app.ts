import { Hitbox, HitboxProperties } from "./interfaces";
import { IPlatform } from "./IPlatform";
import { PlatformBrowser } from "./PlatformBrowser";
import { character1, character2 } from "./testdata";

const platformApi: IPlatform = new PlatformBrowser().init();
character1.reset(true);
character2.reset(false);
let currentFrame = 1;

function drawFrame() {
    // stage 
    // ...

    // characters
    const choosesMove1 = Math.random() > 0.75; // 1 in 4 he won't be idle
    const choosesMove2 = Math.random() > 0.60; // 60% he will idle 
    character1.nextTick(choosesMove1 ? Math.floor(Math.random() * 2.9) : 0);
    character2.nextTick(choosesMove2 ? Math.floor(Math.random() * 2.9) : 0);
    character1.render(platformApi);
    character2.render(platformApi);

    // HUD i guess
    const attack: Hitbox = { x: 50000, y: 5000, tall: 60000, wide: 20000, props: HitboxProperties.Strike };
    const target: Hitbox = { x: 50000, y: 5000, tall: 30000, wide: 40000, props: HitboxProperties.Hurtbox };
    platformApi.drawHitbox(attack);
    platformApi.drawHitbox(target);

    platformApi.renderText(900000, 100000, currentFrame + " hits!");

    // end frame
    platformApi.newFrame();
    currentFrame++;
    setTimeout(drawFrame, 1000 / 10); // 1000/60 is 60fps
}

drawFrame();
