import { IPlatform } from "./IPlatform";
import { PlatformBrowser } from "./PlatformBrowser";
import { HitboxProperties, IButtonArray, IControlSource, SystemMove } from "./interfaces";
import { checkBoxes, hasAll } from "./collision";
import { AssetLoader } from "./assetLoader";
import { AIInput } from "./ai";

const platformApi: IPlatform = new PlatformBrowser().init();
const assetLoader = new AssetLoader(platformApi);

const [hud, stage] = await Promise.all([assetLoader.getHudAsset(), assetLoader.getStageAsset("training")]);

const selected = ["Kyu", "Ren"]; // and also, # chars in play
const characters = await Promise.all(selected.map(name => assetLoader.getCharacterAsset(name)));
characters.forEach((c, index) => c.reset(index % 2 === 0));
const controlSources: IControlSource[] = characters.map(c => new AIInput(c));

let logicalFrame = 0; // reset on new round; can rollback to earlier numbers
const inputs: IButtonArray[][] = []; // index on frameCount; every item is a tuple, 2-tuple for 2-players, 3-tuple for 3 players, etc

const enum CollisionResult {
    Nothing, Grabbed, Hit, ThrowTeched,
}


function eachFrame() {
    // collision detection
    const hitboxes = characters.map(c => c.getCurrentBoxesInWorldCoordinates());

    //let collisions = hitboxes.map((attack, i) => hitboxes.map((target, j) => (i === j) ? null : checkBoxes(attack, target)));
    // reflect all projectiles
    // process all clean grabs
    //  cleanly-grabbed chars nulled out attack (even if they were countering a strike, they can't get anything from it this frame)
    // resolve simultaneous grabs, since they require either throw-tech or a cinematic

    let p1AttacksP2 = checkBoxes(hitboxes[0], hitboxes[1]);
    let p2AttacksP1 = checkBoxes(hitboxes[1], hitboxes[0]);
    if (p1AttacksP2 && p2AttacksP1) {
        // clash / trade / throwtech

        // if character successfully grabs someone who is also successfully grabbing someone, ignore the interaction
        // unless a third person was involved.
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
    if (p1AttacksP2) { characters[1].setCurrentMove(SystemMove.Hit); characters[0].comboCounter++; }
    if (p2AttacksP1) { characters[0].setCurrentMove(SystemMove.Hit); characters[1].comboCounter++; }

    // read input
    inputs[logicalFrame] = controlSources.map(x => x.getButtons());

    // advance characters 1 frame
    characters.forEach((c, i) => c.nextTick(inputs[logicalFrame][i]));


    // Rendering, frame advance ///////////////

    // render stage @ characters' new position
    stage.render(logicalFrame);

    // render characters
    characters.forEach(c => c.render(platformApi));

    // render UI
    hud.render(logicalFrame, characters[0], characters[1]);

    // end the frame, schedule the next
    platformApi.newFrame();
    logicalFrame++;
    setTimeout(eachFrame, 1000 / 10); // 1000/60 is 60fps
}

eachFrame();
