import { IPlatform } from "./IPlatform";
import { PlatformBrowser } from "./PlatformBrowser";
import { character1, character2 } from "./testdata";
import { HUD } from "./hud";

const platformApi: IPlatform = new PlatformBrowser().init();
const hud = new HUD(platformApi);
character1.reset(true);
character2.reset(false);
let currentFrame = 1; // reset on new round 

function drawFrame() {
    // stage 
    // ...

    // characters
    const choosesMove1 = Math.random() > 0.75; // 75% he will idle
    const choosesMove2 = Math.random() > 0.60; // 60% he will idle 
    character1.nextTick(choosesMove1 ? Math.floor(Math.random() * 1.9 + 1) : 0);
    character2.nextTick(choosesMove2 ? Math.floor(Math.random() * 1.9 + 1) : 0);
    character1.render(platformApi);
    character2.render(platformApi);

    // HUD i guess
    hud.render(currentFrame, character1, character2);

    // end frame
    platformApi.newFrame();
    currentFrame++;
    setTimeout(drawFrame, 1000 / 10); // 1000/60 is 60fps
}

drawFrame();
