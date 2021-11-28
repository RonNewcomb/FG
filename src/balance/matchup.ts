import { PlatformNodeJs } from "../game/PlatformNodeJs";
import { CharacterMove, FullReport, SystemMove } from "../interfaces/interfaces";

const fullreport: FullReport = await fetch("./MatchupResults.json").then(res => res.json());
console.log(fullreport);

const platform2 = new PlatformNodeJs();

function getPhoto(character: 0 | 1, moveId: number): string {
  const move: CharacterMove = fullreport.moves[character][moveId + SystemMove.AttackMovesBegin];
  for (let frame = 0; frame < move.hitboxes.length; frame++) {
    if (move.hitboxes[frame].some(h => !!h.effects))
      return "<div class=collage>" + move.hitboxes[frame].map(platform2.drawHitbox).join('') + "</div>";
  }
  return "<div>Photo missing</div>";
}

function getFramedataVisualization(character: 0 | 1, moveId: number): string {
  const move: CharacterMove = fullreport.moves[character][moveId + SystemMove.AttackMovesBegin];
  let retval = "";
  let passedActiveFrames = false; // we're going backward, rendering recovery before startup
  for (let frame = move.hitboxes.length - 1; frame >= 0; frame--) {
    const hits = move.hitboxes[frame].some(h => !!h.effects);
    if (hits) passedActiveFrames = true;
    retval += `<div class=${hits ? "active" : passedActiveFrames ? "startup" : "recovery"}></div>`
  }
  retval += `<div style='background-color:white'></div>`; // invisible starter
  return retval;
}

const colors = ["lightgray", "red", "blue", "gold"];

let output = "";
const report = fullreport.report;
for (let p1move = 0; p1move < report.length; p1move++) {
  for (let p2move = 0; p2move < report[p1move].length; p2move++) {
    output += `
    <table class=row>
      <tr class=header>
        <th>move ${p1move}</th>
        <th>vs.</th>
        <th>move ${p2move}</th>
      </tr>
      <tr>
        <td class=photo>
          ${getPhoto(0, p1move)}
        </td>
        <td>
          <table class=frameTable>`;
    const baseFrameAdvantage = report[p1move][p2move].frameAdvantage || 0;
    for (let frameAdv = 0; frameAdv < report[p1move][p2move].matchup.length; frameAdv++) {
      output += `<tr><th>${(baseFrameAdvantage > frameAdv ? "+" : "") + (baseFrameAdvantage - frameAdv).toString()}</th>`;
      const len4 = report[p1move][p2move].matchup[frameAdv]?.length || 0;
      for (let distance = 0; distance < len4; distance++) {
        const hits = report[p1move][p2move].matchup[frameAdv][distance];
        const winLoseTradeMiss = !hits ? 0 : hits[0] && hits[1] ? 3 : hits[0] ? 2 : 1;
        output += `
          <td class=${colors[winLoseTradeMiss]}>
            <div class=flyover>
              ${hits && hits[0] && hits[0][0] ? platform2.drawHitbox(hits[0][0]) : ""}
              ${hits && hits[0] && hits[0][1] ? platform2.drawHitbox(hits[0][1]) : ""}
            </div>
            <div class=flyover>
              ${hits && hits[1] && hits[1][0] ? platform2.drawHitbox(hits[1][0]) : ""}
              ${hits && hits[1] && hits[1][1] ? platform2.drawHitbox(hits[1][1]) : ""}
            </div>
          </td>`;
      }
      output += "</tr>";
    }
    output += `
          </table>
        </td>
        <td class=photo style="transform: scaleX(-1);">
          ${getPhoto(1, p2move)}              
        </td>
      </tr>
      <tr>
        <td>
          <div class=timeline>${getFramedataVisualization(0, p1move)}</div>
        </td>
        <td class="distanceline">
          <span>close</span>
          <span><i>distance</i></span>
          <span>far</span>
        </td>
        <td>
          <div class=timeline>${getFramedataVisualization(1, p2move)}</div>
        </td>
      </tr>
    </table>`;
  }
}
document.getElementById("report")!.innerHTML = output;
