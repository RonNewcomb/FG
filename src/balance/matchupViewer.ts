import { PlatformNodeJs } from "../game/PlatformNodeJs";
import { CharacterMove, FullReport, SystemMove } from "../interfaces/interfaces";

const fullreport: FullReport = await fetch("./MatchupResults.json").then(res => res.json());
console.log(fullreport);
const report = fullreport.report;

const platform2 = new PlatformNodeJs();

function getPhoto(character: 0 | 1, moveId: number): string {
  const move: CharacterMove = fullreport.moves[character][moveId + SystemMove.AttackMovesBegin];
  for (let frame = 0; frame < move.hitboxes.length; frame++) {
    if (move.hitboxes[frame].some(h => !!h.effects))
      return "<div class=collage>" + move.hitboxes[frame].map(hb => platform2.drawHitbox(hb)).join('') + "</div>";
  }
  return "<div>Photo missing</div>";
}

function getFramedataVisualization(character: 0 | 1, moveId: number): string {
  const move: CharacterMove = fullreport.moves[character][moveId + SystemMove.AttackMovesBegin];
  let retval = "";
  let hasHit = false;
  for (let frame = 0; frame < move.hitboxes.length; frame++) {
    const hits = move.hitboxes[frame].some(h => !!h.effects);
    if (hits) hasHit = true;
    retval += `<div class=${hits ? "active" : hasHit ? "recovery" : "startup"}></div>`
  }
  return retval;
}

const colors = ["lightgray", "red", "blue", "gold"];

let output = "";
const len1 = report.length;
for (let p1move = 0; p1move < len1; p1move++) {
  const len2 = report[p1move]?.length || 0;
  for (let p2move = 0; p2move < len2; p2move++) {
    output += `
    <h2>P1 move ${p1move} vs P2 move ${p2move}</h2>
    <div class=flexrow>
      <div class=photo>
        <div>${getPhoto(0, p1move)}</div>
        <div class=timeline>${getFramedataVisualization(0, p1move)}</div>
      </div>
      <table>`;
    const baseFrameAdvantage = report[p1move][p2move].frameAdvantage || 0;
    const len3 = report[p1move][p2move]?.matchup?.length || 0;
    for (let frameAdv = 0; frameAdv < len3; frameAdv++) {
      const relativeFrameAdvantage = baseFrameAdvantage - frameAdv;
      const label = relativeFrameAdvantage > 0 ? "+" + relativeFrameAdvantage : relativeFrameAdvantage;
      output += `<tr><th>${label}</th>`;
      const len4 = report[p1move][p2move].matchup[frameAdv]?.length || 0;
      for (let distance = 0; distance < len4; distance++) {
        const result = report[p1move][p2move].matchup[frameAdv][distance] || 0;
        output += `<td class=${colors[result]}> </td>`;
      }
      output += "</tr>";
    }
    output += `
      </table>
      <div class=photo>
          <div style="transform: scaleX(-1);">${getPhoto(1, p2move)}</div>
          <div class=timeline>${getFramedataVisualization(1, p2move)}</div>
      </div>
    </div>`;
  }
}
document.getElementById("report")!.innerHTML = output;
