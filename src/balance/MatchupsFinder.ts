import { FullReport, MoveVsMove, SystemMove } from "../interfaces/interfaces";
import { AssetLoader } from "../game/assetLoader";
import { Character } from "../game/character";
import { collisionDetection } from "../game/collision";
import { Menus } from "../game/menus";
import { PlatformBrowser } from "../game/PlatformBrowser";
import { NullInput } from "../game/util";
import * as fs from "fs";

function getWalkSpeed(character: Character): number {
    const walkEffects = character.assets.fdata.moves[SystemMove.WalkForward].effects || [];
    let walkSpeed = 0;
    for (let i = 0; i < 3; i++)
        walkSpeed += walkEffects[i % walkEffects.length].xOffset || 0;
    return walkSpeed;
}

export default async function MatchupsFinder() {
    console.log("running MatchupsFinder...");

    const platformApi = new PlatformBrowser();//.init();
    const assetLoader = new AssetLoader(platformApi);
    const characterNames = await Menus.selectCharacters(2);
    const characterAssets = await Promise.all(characterNames.map(assetLoader.getCharacterAssets));
    const characters = characterAssets.map((assets, i) => new Character(assets, NullInput, i % 2 === 0));

    const report: Array<Array<MoveVsMove>> = [];

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
    for (let i = 0; i < p1Attacks.length - SystemMove.AttackMovesBegin; i++) {
        report[i] = [];
        for (let j = 0; j < p2Attacks.length - SystemMove.AttackMovesBegin; j++) {
            //console.log("p1 move ", i, " vs. p2 move", j);
            const p1Duration = p1Attacks[i + SystemMove.AttackMovesBegin].hitboxes.length;
            const p2Duration = p2Attacks[j + SystemMove.AttackMovesBegin].hitboxes.length;
            const latestP2Start = p1Duration - 1; // -1 or else the moves aren't overlapping at all
            const latestP1Start = latestP2Start + p2Duration - 1; // latest p1 start when p2 is starting its latest already
            report[i][j] = {
                frameAdvantage: latestP2Start,
                matchup: [],
            };
            for (let p1BeginOnFrame = 0; p1BeginOnFrame <= latestP1Start; p1BeginOnFrame++) {
                let hasHit = true;
                report[i][j].matchup[p1BeginOnFrame] = [];
                for (let distance = 0; hasHit || distance < 40/* blind guess */; distance++) {
                    p1.reset(true);
                    p2.reset(false);
                    p2.x = p1.x + (distance * smallestDistance);

                    // run simulation /////
                    for (let frame = Math.min(p1BeginOnFrame, latestP2Start); !hasHit && frame < latestP1Start + p1Duration; frame++) {
                        if (frame === latestP1Start) p1.setCurrentMove(i + SystemMove.AttackMovesBegin);
                        if (frame === latestP2Start) p2.setCurrentMove(j + SystemMove.AttackMovesBegin);
                        const matrix = collisionDetection(characters);
                        const p1WasHit = matrix[0][1] != null;
                        const p2WasHit = matrix[1][0] != null;
                        hasHit = p1WasHit || p2WasHit;
                        if (hasHit) {
                            //console.log(matrix);
                            report[i][j].matchup[p1BeginOnFrame][distance] = [matrix[0][1], matrix[1][0]];// (p1WasHit && p2WasHit) ? 3 : p2WasHit ? 2 : 1;
                            break;
                        }
                        p1.quickTick();
                        p2.quickTick();
                    }
                    if (!hasHit && p1.x > p2.x) hasHit = true; // in case they passed by each other TODO HACK guaranteed to be broken
                    hasHit = false;
                }
            }
        }
    }

    const filename = "built\\balance\\MatchupResults.json";
    console.log("writing results to", filename);
    const fullreport: FullReport = {
        report: report,
        moves: characters.map(c => c.assets.fdata.moves),
    };
    fs.writeFileSync(filename, JSON.stringify(fullreport));
}
