import { Dictionary, fps, IControlSourceType, IGameState, oneSecond } from "../interfaces/interfaces";
import { IPlatform } from "../interfaces/IPlatform";
import { PlatformBrowser } from "./PlatformBrowser";
import { collisionDetection } from "./collision";
import { AssetLoader } from "./assetLoader";
import { HUD } from "./hud";
import { AIInput } from "./ai";
import { Character } from "./character";
import { Menus } from "./menus";

// app init
const platformApi: IPlatform = new PlatformBrowser().init();
const assetLoader = new AssetLoader(platformApi);
const hud = new HUD(platformApi, await assetLoader.getHudAssets());

// mode select
const modes: Dictionary<IControlSourceType[]> = {
    demo: [AIInput, AIInput],
    // arcade: [ControllerInput, AIInput],
    // localVs: [ControllerInput, ControllerInput],
    // onlineVs: [ControllerInput, NetworkInput],
    // spectator: [NetworkInput, NetworkInput],
    // localReplay: [ReplayInput, ReplayInput],
    // dramaticBattle: [ControllerInput, AIInput, AIInput]
    // dramaticBattleCoop: [ControllerInput, AIInput, ControllerInput]
}
const controlSourceTypes = modes.demo;

// stage select
const stageName = await Menus.selectStage();
const loadingStage = assetLoader.getStageAssets(stageName);

// char select
const characterNames = await Menus.selectCharacters(controlSourceTypes.length);
const loadingCharacters = Promise.all(characterNames.map(assetLoader.getCharacterAssets));

// splash and load
const stage = await loadingStage;
const characterAssets = await loadingCharacters;
const characters = characterAssets.map((assets, i) => new Character(assets, controlSourceTypes[i], i % 2 === 0));

// battle begin
export const history: IGameState[/* logical frame # */] = [];

// battle functions //////

/** Inputs */
function getInputs(logicalFrame: number) {
    history[logicalFrame] = {
        inputs: characters.map(character => character.controlSource.getButtons())
    }
}

/** Computation */
export function advanceFrame(logicalFrame: number) {
    // collision detection
    const matrix = collisionDetection(characters);
    matrix.forEach(collisions => collisions.forEach((collision, j) => { if (collision) characters[j].comboCounter++; }));

    // advance characters 1 frame
    const current = history[logicalFrame].inputs;
    history[logicalFrame].states = characters.map((character, i) => character.nextTick(current[i], matrix[i]));
}

/** Outputs */
function render(logicalFrame: number) {
    // render stage @ characters' new position
    stage.render(logicalFrame);

    // render characters
    characters.forEach(character => character.render(platformApi));

    // render UI
    hud.render(logicalFrame, characters, fps);
}

// battle loop
let logicalFrame = 0; // reset on new round; can rollback to earlier numbers
function eachFrame() {
    getInputs(logicalFrame);
    advanceFrame(logicalFrame);
    render(logicalFrame);

    // end the frame, schedule the next
    platformApi.newFrame();
    logicalFrame++;
    setTimeout(eachFrame, oneSecond / fps);
}
eachFrame();
