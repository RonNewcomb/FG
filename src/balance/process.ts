import { IGameState, SystemMove } from "../interfaces/interfaces";
import { AIInput } from "../game/ai";
import { AssetLoader } from "../game/assetLoader";
import { Character } from "../game/character";
import { collisionDetection } from "../game/collision";
import { Menus } from "../game/menus";
import { PlatformBrowser } from "../game/PlatformBrowser";

function getWalkSpeed(character: Character): number {
    const walkEffects = character.assets.fdata.moves[SystemMove.WalkForward].effects || [];
    let walkSpeed = 0;
    for (let i = 0; i < 7; i++)
        walkSpeed += walkEffects[i % walkEffects.length].xOffset || 0;
    return walkSpeed;
}

export default async function process() {
    console.log("typescrips");

    const platformApi = new PlatformBrowser().init();
    const assetLoader = new AssetLoader(platformApi);
    const characterNames = await Menus.selectCharacters(2);
    const characterAssets = await Promise.all(characterNames.map(assetLoader.getCharacterAssets));
    const characters = characterAssets.map((assets, i) => new Character(assets, AIInput, i % 2 === 0));

    const report: {}[][][][] = [];

    // alias for speed/readability
    const p1 = characters[0];
    const p2 = characters[1];
    const p1Attacks = p1.assets.fdata.moves;
    const p2Attacks = p2.assets.fdata.moves;

    // the smallest range isn't a pixel, its the distance walked by a character in, say, 7 frames 
    // before teh joystick changes walk direction again; i.e. the shimmy-at-footsies-range
    const rangeEpsilonP1 = getWalkSpeed(p1);
    const rangeEpsilonP2 = getWalkSpeed(p2);
    const smallestDistance = rangeEpsilonP1 + rangeEpsilonP2;

    // loop through every attack move from player 1
    // loop through every attack move from player 2
    // loop through every possible frame adv/disadv that those 2 moves can be at 
    // loop through every possible range that those 2 moves can connect at
    for (let i = SystemMove.AttackMovesBegin; i < p1Attacks.length; i++) {
        report[i] = [];
        for (let j = SystemMove.AttackMovesBegin; j < p2Attacks.length; j++) {
            const p1Duration = p1Attacks[i].hitboxes.length;
            const p2Duration = p2Attacks[j].hitboxes.length;
            const latestP2Start = p1Duration - 1; // -1 or else the moves aren't overlapping at all
            const latestP1Start = latestP2Start + p2Duration - 1; // latest p1 start when p2 is starting its latest already
            report[i][j] = [];
            for (let p1BeginOnFrame = 0; p1BeginOnFrame <= latestP1Start; p1BeginOnFrame++) {
                let hasHit = true;
                report[i][j][p1BeginOnFrame] = [];
                for (let distance = 0; hasHit; distance++) {
                    p1.reset(true);
                    p2.reset(false);
                    p2.x = p1.x + (distance * smallestDistance);
                    // animate
                    for (let frame = Math.min(p1BeginOnFrame, latestP2Start); !hasHit && frame < latestP1Start + p1Duration; frame++) {
                        if (frame === latestP1Start) p1.setCurrentMove(i);
                        if (frame === latestP2Start) p2.setCurrentMove(j);
                        const matrix = collisionDetection(characters);
                        const p1WasHit = matrix[0][1] != null;
                        const p2WasHit = matrix[1][0] != null;
                        hasHit = p1WasHit || p2WasHit;
                        if (hasHit) {
                            report[i][j][p1BeginOnFrame][distance] = (p1WasHit || p2WasHit) ? 3 : p2WasHit ? 2 : 1;
                            break;
                        }
                        p1.quickTick(SystemMove.StandIdle);
                        p2.quickTick(SystemMove.StandIdle);
                    }
                    if (!hasHit && p1.x > p2.x) hasHit = true; // in case they passed by each other TODO HACK guaranteed to be broken
                }
            }
        }
    }
    console.log("FINISHED");
}

