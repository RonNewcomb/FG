import { IPlatform } from "./IPlatform";
import { PlatformBrowser } from "./PlatformBrowser";
import { HitboxProperties, SystemMove } from "./interfaces";
import { checkBoxes } from "./collision";
import { Loader } from "./loader";


const platformApi: IPlatform = new PlatformBrowser().init();
const loader = new Loader(platformApi);
const [hud, character1, character2] = await Promise.all([loader.getHudAsset(), loader.getCharacterAsset("Kyu"), loader.getCharacterAsset("Ren")]);

character1.reset(true);
character2.reset(false);
const numMoves1 = character1.fdata.moves.length - 1;
const numMoves2 = character2.fdata.moves.length - 1;
let currentFrame = 1; // reset on new round
let hitCount = 0;

function drawFrame() {
    // collision detection
    const p1Boxes = character1.getCurrentBoxesInWorldCoordinates();
    const p2Boxes = character2.getCurrentBoxesInWorldCoordinates();
    let p1AttacksP2 = checkBoxes(p1Boxes, p2Boxes);
    let p2AttacksP1 = checkBoxes(p2Boxes, p1Boxes);
    if (p1AttacksP2 && p2AttacksP1) {
        // clash / trade / throwtech
        const p1Grabbed = (p1AttacksP2[2] & HitboxProperties.Grab) > 0;
        const p2Grabbed = (p2AttacksP1[2] & HitboxProperties.Grab) > 0;
        if (p1Grabbed && p2Grabbed) {
            // throw tech, or just ignore
            p1AttacksP2 = null;
            p2AttacksP1 = null;
        } else if (p1Grabbed) {
            p2AttacksP1 = null;
        } else if (p2Grabbed) {
            p1AttacksP2 = null;
        }
    }
    if (p1AttacksP2) character2.setCurrentMove(SystemMove.Hit);
    if (p2AttacksP1) character1.setCurrentMove(SystemMove.Hit);

    // read input
    const choosesMove1 = Math.random() > 0.75; // 75% he will idle
    const choosesMove2 = Math.random() > 0.60; // 60% he will idle

    // advance characters 1 frame
    character1.nextTick(choosesMove1 ? Math.floor(Math.random() * (numMoves1 - 0.1) + 1) : SystemMove.StandIdle);
    character2.nextTick(choosesMove2 ? Math.floor(Math.random() * (numMoves2 - 0.1) + 1) : SystemMove.StandIdle);

    // render stage @ characters' new position
    // ...

    // render characters
    character1.render(platformApi);
    character2.render(platformApi);

    // render UI
    if (p1AttacksP2) hitCount++;
    if (p2AttacksP1) hitCount++;
    hud.render(currentFrame, character1, character2, hitCount);

    // end frame
    platformApi.newFrame();
    currentFrame++;
    setTimeout(drawFrame, 1000 / 10); // 1000/60 is 60fps // schedule next frame
}

drawFrame();
