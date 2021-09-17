import { IPlatform } from "./IPlatform";
import { PlatformBrowser } from "./PlatformBrowser";
import { HitboxProperties, SystemMove } from "./interfaces";
import { checkBoxes, hasAll } from "./collision";
import { AssetLoader } from "./assetLoader";
import { AIInput } from "./ai";

const platformApi: IPlatform = new PlatformBrowser().init();
const assetLoader = new AssetLoader(platformApi);

const hud = await assetLoader.getHudAsset();

const selected = ["Kyu", "Ren"]; // and also, # chars in play
const characters = await Promise.all(selected.map(name => assetLoader.getCharacterAsset(name)));
characters.forEach((c, index) => c.reset(index % 2 === 0));
const AIs = characters.map(c => new AIInput(c));

let currentFrame = 1; // reset on new round
let hitCount = 0;

function drawFrame() {
    // collision detection
    const hitboxes = characters.map(c => c.getCurrentBoxesInWorldCoordinates());
    let p1AttacksP2 = checkBoxes(hitboxes[0], hitboxes[1]);
    let p2AttacksP1 = checkBoxes(hitboxes[1], hitboxes[0]);
    if (p1AttacksP2 && p2AttacksP1) {
        // clash / trade / throwtech
        const p1Grabbed = hasAll(p1AttacksP2[2], HitboxProperties.Grab);
        const p2Grabbed = hasAll(p2AttacksP1[2], HitboxProperties.Grab);
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
    if (p1AttacksP2) characters[1].setCurrentMove(SystemMove.Hit);
    if (p2AttacksP1) characters[0].setCurrentMove(SystemMove.Hit);

    // read input
    const choosesMove = AIs.map(x => x.getButtons());

    // advance characters 1 frame
    characters.forEach((c, i) => c.nextTick(choosesMove[i]));

    // render stage @ characters' new position
    // ...

    // render characters
    characters.forEach(c => c.render(platformApi));

    // render UI
    if (p1AttacksP2) hitCount++;
    if (p2AttacksP1) hitCount++;
    hud.render(currentFrame, characters[0], characters[1], hitCount);

    // end frame
    platformApi.newFrame();
    currentFrame++;
    setTimeout(drawFrame, 1000 / 10); // 1000/60 is 60fps // schedule next frame
}

drawFrame();
