// this is the app for matchup.html;  might should be a small Preact app or something
import { PlatformNodeJs } from "../game/PlatformNodeJs";
import { CharacterMove, frameCount, FullReport, SystemMove } from "../interfaces/interfaces";

type HtmlComponent = string;
const ppm2px = 1000;
const ppm2percent = 10000;
let fullreport: FullReport;
const gettingReport = fetch("./MatchupResults.json").then(res => res.json()).then(r => fullreport = r);
const platform2 = new PlatformNodeJs();

function getPhoto(character: 0 | 1, moveId: SystemMove, frame: frameCount, translateX?: number): HtmlComponent {
  const move = fullreport.moves[character][moveId].hitboxes[frame];
  if (!move) return getPhoto(character, SystemMove.StandIdle, 0, translateX);
  const shift = !translateX ? '' : character === 1 ? `style='left: ${translateX / ppm2px}px'` : ``;
  return `<div name='${character}.${moveId}' class=photo data-p=${character} data-moveid=${moveId} ${shift}>
            ${move.map(platform2.drawHitbox).join('')}
          </div>`
}

function findPhoto(character: 0 | 1, moveId: SystemMove, translateX?: number): HtmlComponent {
  const move: CharacterMove = fullreport.moves[character][moveId];
  let frameToUse = 0;
  for (let frame = 0; frame < move.hitboxes.length; frame++)
    if (move.hitboxes[frame].some(h => !!h.effects)) {
      frameToUse = frame;
      break;
    }
  return getPhoto(character, moveId, frameToUse, translateX);
}

type Phase = 'startup' | 'active' | 'recovery';

function getFramedataDescription(character: 0 | 1, moveId: SystemMove): Phase[] {
  const move: CharacterMove = fullreport.moves[character][moveId];
  let retval: Phase[] = [];
  let beenActive = false;
  for (let frame = 0; frame < move.hitboxes.length - 1; frame++) {
    const canHit = move.hitboxes[frame].some(h => !!h.effects);
    if (canHit) beenActive = true;
    retval.push(canHit ? "active" : beenActive ? 'recovery' : "startup");
  }
  return retval;
}

function getFramedataVisualization(character: 0 | 1, moveId: SystemMove, highlightedFrame?: number): HtmlComponent {
  const phases = getFramedataDescription(character, moveId);
  const timeline = phases.map((phase, i) => `<div data-for='${character}.${moveId}.${i}' class="${phase} ${i === highlightedFrame ? 'highlight' : ''}"></div>`).reverse();
  return `<div class=timeline>${timeline.join('')}<div style='background-color:white'></div></div>`;
}

type Situation = '' | 'trade' | 'CH' | 'spaced' | 'wif pun';

function getSituation(winLoseTradeMiss: 0 | 1 | 2 | 3, nthFrame: frameCount, p1StartOn: number, p2StartOn: number, moveId1: SystemMove, moveId2: SystemMove): Situation {
  if (winLoseTradeMiss === 0) return '';
  if (winLoseTradeMiss === 3) return 'trade';
  const p1doing = getFramedataDescription(0, moveId1)[nthFrame - p1StartOn];
  const p2doing = getFramedataDescription(1, moveId2)[nthFrame - p2StartOn];
  const attacker = p1doing === 'active' ? p1doing : p2doing;
  const other = attacker === p1doing ? p2doing : p1doing;
  switch (other) {
    case 'startup': return 'CH';
    case 'active': return 'spaced';
    case 'recovery': return 'wif pun';
    default: return '';
  }
}

function main(fullreport: FullReport): HtmlComponent {
  const colors = ["miss", "p1wins", "p2wins", "trade"];

  let output = "";
  const report = fullreport.report;
  for (let p1move = 0; p1move < report.length; p1move++) {
    for (let p2move = 0; p2move < report[p1move].length; p2move++) {
      let p1wins = 0;
      let p2wins = 0;
      output += `
    <table class=row>
      <tr class=header>
        <th>move ${p1move}</th>
        <th>vs.</th>
        <th>move ${p2move}</th>
      </tr>
      <tr>
        <td class=photoFrame>
          <div class=photoFrameset>
            ${findPhoto(0, p1move + SystemMove.AttackMovesBegin)}
          </div>
        </td>
        <td>
          <table class=frameTable>`;
      const p2BeginsAttack: frameCount = report[p1move][p2move].p2BeginsAttackOnThisFrame;
      for (let p1BeginsAttack: frameCount = 0; p1BeginsAttack < report[p1move][p2move].matchup.length; p1BeginsAttack++) {
        output += `<tr><th>${(p2BeginsAttack > p1BeginsAttack ? "+" : "") + (p2BeginsAttack - p1BeginsAttack).toString()}</th>`;
        const len4 = report[p1move][p2move].matchup[p1BeginsAttack]?.length || 0;
        for (let distance = 0; distance < len4; distance++) {
          const [p1WasHit, p2WasHit, connectedOnNthFrame] = report[p1move][p2move].matchup[p1BeginsAttack][distance] || [false, false, 999];
          const winLoseTradeMiss = !p1WasHit && !p2WasHit ? 0 : p1WasHit && p2WasHit ? 3 : p1WasHit ? 2 : 1;
          if (winLoseTradeMiss & 1) p1wins++;
          if (winLoseTradeMiss & 2) p2wins++;
          const situation = getSituation(winLoseTradeMiss, connectedOnNthFrame, p1BeginsAttack, p2BeginsAttack, p1move + SystemMove.AttackMovesBegin, p2move + SystemMove.AttackMovesBegin);
          output += `
          <td class=${colors[winLoseTradeMiss]} data-clickToShow>
            <span class=resultLabel>${situation}</span>
            <div class=flyover>
              ${getPhoto(0, p1move + SystemMove.AttackMovesBegin, connectedOnNthFrame - p1BeginsAttack)}
              ${getPhoto(1, p2move + SystemMove.AttackMovesBegin, connectedOnNthFrame - p2BeginsAttack, distance * fullreport.smallestDistance)}
              <div class=flyoverFrameCompare>
                ${getFramedataVisualization(0, p1move + SystemMove.AttackMovesBegin, connectedOnNthFrame - p1BeginsAttack)}
                &mdash;
                ${getFramedataVisualization(1, p2move + SystemMove.AttackMovesBegin, connectedOnNthFrame - p2BeginsAttack)}
              </div>
            </div>
          </td>`;
        }
        output += "</tr>";
      }
      output += `
          </table>
          <div class=distanceline>
            <span>close</span>
            <span><i>distance</i></span>
            <span>far</span>
          </div>
        </td>
        <td class=photoFrame>
          <div class=photoFrameset>
            ${findPhoto(1, p2move + SystemMove.AttackMovesBegin)}
          </div>
        </td>
      </tr>
      <tr>
        <td>
          ${getFramedataVisualization(0, p1move + SystemMove.AttackMovesBegin)} 
        </td>
        <td class=distanceline>
          <span>move ${p1move} win rate ${(p1wins / (p1wins + p2wins) * 100).toFixed(0)}%</span>
        </td>
        <td>
          ${getFramedataVisualization(1, p2move + SystemMove.AttackMovesBegin)} 
        </td>
      </tr>
    </table>`;
    }
  }
  return output;
}

document.getElementById("report")!.innerHTML = main(await gettingReport);

document.body.addEventListener('click', e => {
  const target = e.target as HTMLElement;
  const currentTarget = e.currentTarget as HTMLElement;
  if (target.getAttribute('data-clickToShow') != undefined) {
    Array.from<any>(target.children).forEach((child: HTMLElement) => child.style.display = 'block');
    target.classList.add('highlight');
  }
  if (target.getAttribute('class')?.includes('flyover')) {
    target.style.display = 'none';
  }
  if (target.getAttribute('data-for')) {
    const [character, moveId, frame] = target.getAttribute('data-for')!.split('.').map(x => parseInt(x));
    Array.from(document.getElementsByName(`${character}.${moveId}`)).forEach(photo => photo.replaceWith(new DOMParser().parseFromString(getPhoto(character as 0 | 1, moveId, frame), 'text/html').body.firstChild!));
  }

  return false;
});
