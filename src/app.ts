import { IPlatform } from "./IPlatform";
import { PlatformBrowser } from "./PlatformBrowser";
import { IButtonArray, IControlSource } from "./interfaces";
import { AssetLoader } from "./assetLoader";
import { collisionDetection } from "./collision";
import { AIInput } from "./ai";

// app init
const platformApi: IPlatform = new PlatformBrowser().init();
const assetLoader = new AssetLoader(platformApi);
const hud = await assetLoader.getHudAsset();

// stage select
const stage = await assetLoader.getStageAsset("training");

// char select
const selected = ["Kyu", "Ren"]; // and also, # chars in play
const characters = await Promise.all(selected.map(name => assetLoader.getCharacterAsset(name)));
characters.forEach((c, index) => c.reset(index % 2 === 0));
const controlSources: IControlSource[] = characters.map(c => new AIInput(c));

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
    characters.forEach((character, i) => character.nextTick(inputs[logicalFrame][i]));

    logicalFrame++;
}

function render() {
    // Outputs ///////////////

    // render stage @ characters' new position
    stage.render(logicalFrame);

    // render characters
    characters.forEach(character => character.render(platformApi));

    // render UI
    hud.render(logicalFrame, characters[0], characters[1]);

    // end the frame, schedule the next
    platformApi.newFrame();
    setTimeout(eachFrame, 1000 / 10); // 1000/60 is 60fps
}

eachFrame();
