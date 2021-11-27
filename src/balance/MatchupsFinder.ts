import { CharacterMove, SystemMove } from "../interfaces/interfaces";
import { AssetLoader } from "../game/assetLoader";
import { Character } from "../game/character";
import { collisionDetection } from "../game/collision";
import { Menus } from "../game/menus";
import { PlatformBrowser } from "../game/PlatformBrowser";
import { NullInput } from "../game/util";
import * as fs from "fs";
import { PlatformNodeJs } from "../game/PlatformNodeJs";

const platform2 = new PlatformNodeJs();

function getWalkSpeed(character: Character): number {
    const walkEffects = character.assets.fdata.moves[SystemMove.WalkForward].effects || [];
    let walkSpeed = 0;
    for (let i = 0; i < 7; i++)
        walkSpeed += walkEffects[i % walkEffects.length].xOffset || 0;
    return walkSpeed;
}

function getPhoto(move: CharacterMove): string {
    for (let frame = 0; frame < move.hitboxes.length; frame++) {
        if (move.hitboxes[frame].some(h => !!h.effects))
            return "<div class=collage>" + move.hitboxes[frame].map(hb => platform2.drawHitbox(hb)).join('') + "</div>";
    }
    return "<div>Photo missing</div>";
}

function getFramedataVisualization(move: CharacterMove): string {
    let retval = "";
    let hasHit = false;
    for (let frame = 0; frame < move.hitboxes.length; frame++) {
        const hits = move.hitboxes[frame].some(h => !!h.effects);
        if (hits) hasHit = true;
        retval += `<div class=${hits ? "active" : hasHit ? "recovery" : "startup"}></div>`
    }
    return retval;
}

interface MoveVsMove {
    frameAdvantage: number;
    p1Photo: string;
    p2Photo: string;
    p1FrameVisual: string;
    p2FrameVisual: string;
    matchup: number[][];
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
                p1Photo: getPhoto(p1Attacks[i + SystemMove.AttackMovesBegin]),
                p2Photo: getPhoto(p2Attacks[j + SystemMove.AttackMovesBegin]),
                p1FrameVisual: getFramedataVisualization(p1Attacks[i + SystemMove.AttackMovesBegin]),
                p2FrameVisual: getFramedataVisualization(p2Attacks[i + SystemMove.AttackMovesBegin]),
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
                            report[i][j].matchup[p1BeginOnFrame][distance] = (p1WasHit && p2WasHit) ? 3 : p2WasHit ? 2 : 1;
                            break;
                        }
                        p1.quickTick(SystemMove.StandIdle);
                        p2.quickTick(SystemMove.StandIdle);
                    }
                    if (!hasHit && p1.x > p2.x) hasHit = true; // in case they passed by each other TODO HACK guaranteed to be broken
                    hasHit = false;
                }
            }
        }
    }

    console.log("writing results....");
    fs.writeFileSync("built\\balance\\MatchupResults.json", JSON.stringify(report));

    const colors = ['lightgray', 'red', 'blue', 'gold'];

    const fn = "matchupResults.html";
    fs.writeFileSync(fn, `
    <style>
        td { width:2.5em }
        .flexrow { display:flex }
        .photo { position:relative; width:33% }
        .collage { }
        .timeline { display: flex; position: absolute; bottom: 5px; transform: translateX(50%); }
        .timeline > div { height: 0.5em; width: 1.5em; border: 1px solid white; border-radius: 6px }
        .startup { background-color: green; }
        .active {  background-color: red; }
        .recovery { background-color: blue; }
    </style>
    <h1>Results</h1><br>\n`);
    const len1 = report.length;
    for (let p1move = 0; p1move < len1; p1move++) {
        const len2 = report[p1move]?.length || 0;
        for (let p2move = 0; p2move < len2; p2move++) {
            fs.appendFileSync(fn, `<h2>P1 move ${p1move} vs P2 move ${p2move}</h2>\n
            <div class=flexrow>
                <div class=photo>
                    <div>${report[p1move][p2move].p1Photo}</div>
                    <div class=timeline>${report[p1move][p2move].p1FrameVisual}</div>
                </div>
                <table>\n`);
            const baseFrameAdvantage = report[p1move][p2move].frameAdvantage || 0;
            let maxDistance = 0;
            const len3 = report[p1move][p2move]?.matchup?.length || 0;
            for (let frameAdv = 0; frameAdv < len3; frameAdv++) {
                const relativeFrameAdvantage = (baseFrameAdvantage - frameAdv);
                const label = relativeFrameAdvantage > 0 ? "+" + relativeFrameAdvantage : relativeFrameAdvantage;
                fs.appendFileSync(fn, "<tr><th>" + label + "</th>");
                const len4 = report[p1move][p2move].matchup[frameAdv]?.length || 0;
                for (var distance = 0; distance < len4; distance++) {
                    const result = report[p1move][p2move].matchup[frameAdv][distance] || 0;
                    fs.appendFileSync(fn, "<td style='background-color:" + colors[result] + "'> </td>");
                }
                if (distance > maxDistance) maxDistance = distance;
                fs.appendFileSync(fn, "</tr>\n");
            }
            fs.appendFileSync(fn, `<tr><th>Dist:</th></tr>\n
                </table>\n
                <div class=photo>
                    <div style="transform: scaleX(-1);">${report[p1move][p2move].p2Photo}</div>
                    <div class=timeline>${report[p1move][p2move].p2FrameVisual}</div>
                </div>
            </div>`);
        }
    }
    console.log("MatchupsFinder output to ", fn);

}

