import { Dictionary, fps, IControlSourceType, IGameState, oneSecond } from "../interfaces/interfaces";
import { IPlatform } from "../interfaces/IPlatform";
import { collisionDetection } from "./collision";
import { AssetLoader } from "./assetLoader";
import { AIInput } from "./ai";
import { Character } from "./character";
import { Menus } from "./menus";
import { IStage } from "./stage";
import { CharacterTemplate } from "./charaterTemplate";
import { HUD } from "./hud";


// This controls the game at the largest, macro level
// title screen, attract mode, 
// title menu screen, mode select,
// each mode  select chars, select stage, pregame, battle, postgame, menu for next sequence (refight, reselect, exit)
// menus for exploring acheivements, replays, unlocks, etc.
// menus for dealing with networking, online matchmaking & play
export class Sequencing {
    constructor(public readonly assetLoader: AssetLoader) {
    }

    readonly modes: Dictionary<IControlSourceType[]> = {
        demo: [AIInput, AIInput],
        // arcade: [ControllerInput, AIInput],
        // localVs: [ControllerInput, ControllerInput],
        // onlineVs: [ControllerInput, NetworkInput],
        // spectator: [NetworkInput, NetworkInput],
        // localReplay: [ReplayInput, ReplayInput],
        // dramaticBattle: [ControllerInput, AIInput, AIInput]
        // dramaticBattleCoop: [ControllerInput, AIInput, ControllerInput]
    }

    async userChoosesMode(): Promise<IControlSourceType[]> {
        return this.modes.demo;
    }

    async userChoosesStage(): Promise<IStage> {
        const stageName = await Menus.selectStage();
        const loadingStage = this.assetLoader.getStageAssets(stageName);
        return loadingStage;
    }

    async userChoosesCharacters(numCharacters: number): Promise<CharacterTemplate[]> {
        const characterNames = await Menus.selectCharacters(numCharacters);
        const loadingCharacters = Promise.all(characterNames.map(this.assetLoader.getCharacterAssets));
        return loadingCharacters;
    }

    // splash and load
    async showFightCardWhileLoading() {
    }

    composeBattleScene(stage: IStage, characters: Character[], hud: HUD, platformApi: IPlatform): Scene {
        const scene = new Scene();
        scene.add(f => stage.render(f));
        for (let character of characters)
            scene.add(f => character.render(platformApi));
        scene.add(f => hud.render(f, characters, fps));
        return scene;
    }
}

// const holySequence = {
//     name: "afterboot",
//     scene: [attractVideo, invisiblePressAnyButton],
//     next: {
//         name: "title",
//         scene: [titleGraphic, pressStartOverlay],
//         next: {
//             name: "modeSelect",
//             scene: [background1, userChoosesMode],
//             nextOptions: {
//                 "arcade": {
//                     name: "arcade",
//                     next: [userChoosesStage, userChoosesCharacters, showFightCardWhileLoading]
//                 },
//                 "vs": {},
//                 "online": {},
//                 "demo": {},
//             }
//         }
//     }

// }

export class Battle {
    history: IGameState[/* logical frame # */] = [];
    logicalFrame = 0; // reset on new round; can rollback to earlier numbers

    constructor(public readonly platformApi: IPlatform, public readonly characters: Character[], public readonly scene: Scene) {
        this.newRound();
        this.eachFrame();
    }

    newRound() {
        this.logicalFrame = 0;
        this.characters.forEach((c, i) => c.reset(i % 2 === 0));
    }

    getInputs(logicalFrame: number) {
        this.history[logicalFrame] = {
            inputs: this.characters.map(character => character.controlSource.getButtons())
        }
    }

    advanceFrame(logicalFrame: number) {
        // collision detection
        const matrix = collisionDetection(this.characters);

        // count hits
        matrix.forEach(collisions => collisions.forEach((collision, j) => { if (collision) this.characters[j].comboCounter++; }));

        // advance characters 1 frame
        const current = this.history[logicalFrame].inputs;
        this.history[logicalFrame].states = this.characters.map((character, i) => character.nextTick(current[i], matrix[i]));
    }

    render(logicalFrame: number) {
        this.scene.render(logicalFrame);
    }

    eachFrame() {
        this.getInputs(this.logicalFrame);
        this.advanceFrame(this.logicalFrame);
        this.render(this.logicalFrame);

        // end the frame, schedule the next
        this.platformApi.newFrame();
        this.logicalFrame++;
        setTimeout(this.eachFrame, oneSecond / fps);
    }
}

// a scene is just a collection of stuff to render, in order
// think of every single "screen": 
// has a background(either 2D pic behind menus, a video, or a 3D scene) and
// has 0 or more entities/characters 
// has 0 or more overlays
export class Scene {
    items: ((logicalFrame: number) => void)[] = [];

    add(render: (logicalFrame: number) => void) {
        this.items.push(render);
    }

    render(logicalFrame: number) {
        this.items.forEach(fn => fn(logicalFrame));
    }
}
