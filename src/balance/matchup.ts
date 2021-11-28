// this is the app for matchup.html;  might should be a small Preact app or something

import { PlatformNodeJs } from "../game/PlatformNodeJs";
import { CharacterMove, FullReport, SystemMove } from "../interfaces/interfaces";

const fullreport: FullReport = await fetch("./MatchupResults.json").then(res => res.json());
const platform2 = new PlatformNodeJs();

// TODO translate into world coordinates with each char's location
function getPhoto(character: 0 | 1, moveId: SystemMove): string {
  const move: CharacterMove = fullreport.moves[character][moveId];
  for (let frame = 0; frame < move.hitboxes.length; frame++) {
    if (move.hitboxes[frame].some(h => !!h.effects))
      return `<div class=photo data-p=${character} data-moveid=${moveId}>` + move.hitboxes[frame].map(platform2.drawHitbox).join('') + "</div>";
  }
  return `<div class=photo data-p=${character} data-moveid=${moveId}>` + move.hitboxes[0].map(platform2.drawHitbox).join('') + "</div>";
}

function getFramedataVisualization(character: 0 | 1, moveId: SystemMove): string {
  const move: CharacterMove = fullreport.moves[character][moveId];
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

const colors = ["lightgray", "red", "blue", "purple"];

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
        <td class=photoFrame>
          ${getPhoto(0, p1move + SystemMove.AttackMovesBegin)}
        </td>
        <td>
          <table class=frameTable>`;
    const baseFrameAdvantage = report[p1move][p2move].frameAdvantage || 0;
    for (let frameAdv = 0; frameAdv < report[p1move][p2move].matchup.length; frameAdv++) {
      output += `<tr><th>${(baseFrameAdvantage > frameAdv ? "+" : "") + (baseFrameAdvantage - frameAdv).toString()}</th>`;
      const len4 = report[p1move][p2move].matchup[frameAdv]?.length || 0;
      for (let distance = 0; distance < len4; distance++) {
        const [p1WasHit, p2WasHit, p1WasDoing, p2WasDoing] = report[p1move][p2move].matchup[frameAdv][distance] || [false, false, undefined, undefined];
        const winLoseTradeMiss = !p1WasHit && !p2WasHit ? 0 : p1WasHit && p2WasHit ? 3 : p1WasHit ? 2 : 1;
        output += `
          <td class=${colors[winLoseTradeMiss]} data-clickToShow>
            <div class=flyover>
              ${(p1WasDoing != undefined) && getPhoto(0, p1WasDoing)}
              ${(p2WasDoing != undefined) && getPhoto(1, p2WasDoing)}
            </div>
          </td>`;
      }
      output += "</tr>";
    }
    output += `
          </table>
        </td>
        <td class=photoFrame>
          ${getPhoto(1, p2move + SystemMove.AttackMovesBegin)}
        </td>
      </tr>
      <tr>
        <td>
          <div class=timeline>${getFramedataVisualization(0, p1move + SystemMove.AttackMovesBegin)}</div>
        </td>
        <td class="distanceline">
          <span>close</span>
          <span><i>distance</i></span>
          <span>far</span>
        </td>
        <td>
          <div class=timeline>${getFramedataVisualization(1, p2move + SystemMove.AttackMovesBegin)}</div>
        </td>
      </tr>
    </table>`;
  }
}
document.getElementById("report")!.innerHTML = output;
document.body.addEventListener('click', e => {
  const el = e.target as HTMLElement;
  if (el.getAttribute('data-clickToShow') != undefined)
    Array.from<any>(el.children).forEach((child: HTMLElement) => child.style.display = 'block');
  if (el.getAttribute('class')?.includes('flyover'))
    el.style.display = 'none';
  return false;
});
