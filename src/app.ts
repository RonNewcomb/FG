import { IPlatform } from "./IPlatform";
import { PlatformBrowser } from "./PlatformBrowser";
import { IButtonArray, IControlSource, IControlSourceType } from "./interfaces";
import { collisionDetection } from "./collision";
import { AssetLoader } from "./assetLoader";
import { HUD } from "./hud";
import { AIInput } from "./ai";

// app constants
const oneSecond = 1000;
const fps = 10;

// app init
const platformApi: IPlatform = new PlatformBrowser().init();
const assetLoader = new AssetLoader(platformApi);
const hud = new HUD(platformApi, await assetLoader.getHudAsset());

// mode select
const controlSourceTypes: IControlSourceType[] = [AIInput, AIInput];

// stage select
const stage = await assetLoader.getStageAsset("training");

// char select
const selected = ["Kyu", "Ren"]; // and also, # chars in play
const characters = await Promise.all(selected.map(assetLoader.getCharacterAsset));
characters.forEach((character, index) => character.reset(index % 2 === 0));
const controlSources: IControlSource[] = characters.map((character, i) => new controlSourceTypes[i](character));

// battle begin
let logicalFrame = 0; // reset on new round; can rollback to earlier numbers
const inputs: IButtonArray[][] = []; // index on frameCount; every item is a tuple, 2-tuple for 2-players, 3-tuple for 3 players, etc

// battle loop
function eachFrame() {
    getInputs();
    advanceFrame();
    render();
}

function getInputs() {
    // Inputs ///////////////
    inputs[logicalFrame] = controlSources.map(source => source.getButtons());
}

function advanceFrame() {
    // Computation //////////

    // collision detection; sets "Hit" on a character if applicable but otherwise does nothing
    collisionDetection(characters);

    // advance characters 1 frame
    const current = inputs[logicalFrame];
    characters.forEach((character, i) => character.nextTick(current[i]));

    logicalFrame++;
}

function render() {
    // Outputs ///////////////

    // render stage @ characters' new position
    stage.render(logicalFrame);

    // render characters
    characters.forEach(character => character.render(platformApi));

    // render UI
    hud.render(logicalFrame, characters, fps);

    // end the frame, schedule the next
    platformApi.newFrame();
    setTimeout(eachFrame, oneSecond / fps);
}

eachFrame();
