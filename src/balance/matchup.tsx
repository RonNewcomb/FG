// this is the app for matchup.html;  might should be a small Preact app or something
import * as preact from "preact";
import { createContext, render } from "preact";
import { asHexValue, asPropertyList, PlatformNodeJs, PPMtoPixels } from "../game/PlatformNodeJs";
import { CharacterMove, frameCount, FullReport, SystemMove, Hitbox, MoveVsMove } from "../interfaces/interfaces";

type HtmlComponent = string;
const ppm2px = 1000;
const ppm2percent = 10000;
let fullreport: FullReport;
const gettingReport = fetch("./MatchupResults.json")
  .then(res => res.json())
  .then(r => (fullreport = r));
const platform2 = new PlatformNodeJs();

/** creates a picture (hitboxes & hurtboxes) of a particular frame of a particular move, facing in one of two directions, with optional horizontal offset */
function Snapshot(character: 0 | 1, moveId: SystemMove, frame: frameCount, translateX?: number): HtmlComponent {
  const move = fullreport.moves[character][moveId].hitboxes[frame];
  if (!move) return Snapshot(character, SystemMove.StandIdle, 0, translateX);
  const shift = !translateX ? "" : character === 1 ? `style='left: ${translateX / ppm2px}px'` : ``;
  return /*HTML*/ `<snap-shot name='${character}.${moveId}' class=photo data-p=${character} data-moveid=${moveId} ${shift}>
                    ${move.map(platform2.drawHitbox).join("")}
                  </snap-shot>`;
}

function Hitbox2({ box }: { box: Hitbox }) {
  const { borderColor, backgroundColor } = platform2.getHitboxProps(box);
  return (
    <div
      title={asPropertyList(box.props)}
      style={`position:absolute;
                top:${box.y * PPMtoPixels}px;       left:${box.x * PPMtoPixels}px;
                width:${box.wide * PPMtoPixels}px;  height:${box.tall * PPMtoPixels}px;
                background-color:${asHexValue(backgroundColor)}; border: 1px solid ${asHexValue(borderColor)};
            `}
    ></div>
  );
}

function Snapshot2({ character, moveId, frame, translateX }: { character: 0 | 1; moveId: SystemMove; frame: frameCount; translateX?: number }) {
  const move = fullreport.moves[character][moveId].hitboxes[frame];
  if (!move) return <Snapshot2 character={character} moveId={SystemMove.StandIdle} frame={0} translateX={translateX} />;
  const shift = !translateX ? "" : character === 1 ? `style='left: ${translateX / ppm2px}px'` : ``;
  return (
    <div className="snap-shot photo" name={`${character}.${moveId}`} data-p={character} data-moveid={moveId} {...shift}>
      {move.map(h => (
        <Hitbox2 box={h} />
      ))}
    </div>
  );
}

/** finds a good "representative" snapshot to use, usually the first active frame */
function findSnapshot(character: 0 | 1, moveId: SystemMove, translateX?: number): HtmlComponent {
  const move: CharacterMove = fullreport.moves[character][moveId];
  let frameToUse = 0;
  for (let frame = 0; frame < move.hitboxes.length; frame++)
    if (move.hitboxes[frame].some(h => !!h.effects)) {
      frameToUse = frame;
      break;
    }
  return Snapshot(character, moveId, frameToUse, translateX);
}

function FindSnapshot2({ character, moveId, translateX }: { character: 0 | 1; moveId: SystemMove; translateX?: number }) {
  const move: CharacterMove = fullreport.moves[character][moveId];
  let frameToUse = 0;
  for (let frame = 0; frame < move.hitboxes.length; frame++)
    if (move.hitboxes[frame].some(h => !!h.effects)) {
      frameToUse = frame;
      break;
    }
  return <Snapshot2 character={character} moveId={moveId} frame={frameToUse} translateX={translateX} />;
}

type Phase = "startup" | "active" | "recovery";

/** finds the FG term used to describe a random frame of a random move */
function getFramedataDescription(character: 0 | 1, moveId: SystemMove): Phase[] {
  const move: CharacterMove = fullreport.moves[character][moveId];
  let retval: Phase[] = [];
  let beenActive = false;
  for (let frame = 0; frame < move.hitboxes.length - 1; frame++) {
    const canHit = move.hitboxes[frame].some(h => !!h.effects);
    if (canHit) beenActive = true;
    retval.push(canHit ? "active" : beenActive ? "recovery" : "startup");
  }
  return retval;
}

/** creates a visual and clickable "timeline" of a move's startup, active, recovery */
function getFramedataVisualization(character: 0 | 1, moveId: SystemMove, highlightedFrame?: number): HtmlComponent {
  const phases = getFramedataDescription(character, moveId);
  const changePhoto = (frame: number) => {
    //reRender(photo, Snapshot(character as 0 | 1, moveId, frame));
    //reRender(frameline, getFramedataVisualization(character as 0 | 1, moveId, frame));
  };
  const timeline = phases
    .map(
      (phase, i) =>
        /*HTML*/ `<one-frame data-for='${character}.${moveId}.${i}' ${onClick(_ => changePhoto(i))} class="${phase} ${
          i === highlightedFrame ? "highlight" : ""
        }"></one-frame>`
    )
    .reverse();
  return /*HTML*/ `<framedata-timeline data-name=timeline data-for='${character}.${moveId}' class=timeline>${timeline.join(
    ""
  )}<div class=prestartup></div></framedata-timeline>`;
}

function GetFramedataVisualization2({ character, moveId, highlightedFrame }: { character: 0 | 1; moveId: SystemMove; highlightedFrame?: number }) {
  const phases = getFramedataDescription(character, moveId);
  const changePhoto = (frame: number) => {
    //reRender(photo, Snapshot(character as 0 | 1, moveId, frame));
    //reRender(frameline, getFramedataVisualization(character as 0 | 1, moveId, frame));
  };
  return (
    <div className="framedata-timeline timeline" data-name="timeline" data-for={`${character}.${moveId}`}>
      {phases
        .map((phase, i) => (
          <div
            data-for={`${character}.${moveId}.${i}`}
            onClick={_ => changePhoto(i)}
            className={`one-frame ${phase} ${i === highlightedFrame ? "highlight" : ""}`}
          ></div>
        ))
        .reverse()}
      <div className="prestartup"></div>
    </div>
  );
}

/** finds an FG term used to describe a hit (or miss) */
function getSituation(
  winLoseTradeMiss: 0 | 1 | 2 | 3,
  nthFrame: frameCount,
  p1StartOn: number,
  p2StartOn: number,
  moveId1: SystemMove,
  moveId2: SystemMove
): HtmlComponent {
  if (winLoseTradeMiss === 0) return "";
  if (winLoseTradeMiss === 3) return "trade";
  const p1doing = getFramedataDescription(0, moveId1)[nthFrame - p1StartOn];
  const p2doing = getFramedataDescription(1, moveId2)[nthFrame - p2StartOn];
  const attacker = p1doing === "active" ? p1doing : p2doing;
  const other = attacker === p1doing ? p2doing : p1doing;
  switch (other) {
    case "startup":
      return "CH";
    case "active":
      return "spaced";
    case "recovery":
      return /*HTML*/ `<div>whiff</div><div>punish</div>`;
    default:
      return "";
  }
}

function GetSituation2({
  winLoseTradeMiss,
  nthFrame,
  p1StartOn,
  p2StartOn,
  moveId1,
  moveId2,
}: {
  winLoseTradeMiss: 0 | 1 | 2 | 3;
  nthFrame: frameCount;
  p1StartOn: number;
  p2StartOn: number;
  moveId1: SystemMove;
  moveId2: SystemMove;
}) {
  if (winLoseTradeMiss === 0) return <></>;
  if (winLoseTradeMiss === 3) return <>trade</>;
  const p1doing = getFramedataDescription(0, moveId1)[nthFrame - p1StartOn];
  const p2doing = getFramedataDescription(1, moveId2)[nthFrame - p2StartOn];
  const attacker = p1doing === "active" ? p1doing : p2doing;
  const other = attacker === p1doing ? p2doing : p1doing;
  switch (other) {
    case "startup":
      return <>CH</>;
    case "active":
      return <>spaced</>;
    case "recovery":
      return (
        <>
          <div>whiff</div>
          <div>punish</div>
        </>
      );
    default:
      return <></>;
  }
}

/** loops through every combination of moves, ranges, and frame adv/disadv and create report of what happens when & where */
function main(fullreport: FullReport): HtmlComponent {
  const colors = ["miss", "p1wins", "p2wins", "trade"];

  let probTable: number[][] = [];
  let output = "";
  const report = fullreport.report;
  for (let p1move = 0; p1move < report.length; p1move++) {
    for (let p2move = 0; p2move < report[p1move].length; p2move++) {
      let p1wins = 0;
      let p2wins = 0;
      output += /*HTML*/ `
    <table class=row>
      <tr>
        <td class=photoFrame data-p=0>
          <div class=photoFrameset>
            ${findSnapshot(0, p1move + SystemMove.AttackMovesBegin)}
          </div>
        </td>
        <td>
          <div class=header>
            <span>Move ${p1move}</span>
            <span>vs</span>
            <span>Move ${p2move}</span>
          </div>
          <table class=frameTable>`;
      const p2BeginsAttack: frameCount = report[p1move][p2move].p2BeginsAttackOnThisFrame;
      for (let p1BeginsAttack: frameCount = 0; p1BeginsAttack < report[p1move][p2move].matchup.length; p1BeginsAttack++) {
        output += /*HTML*/ `<tr><th>${(p2BeginsAttack > p1BeginsAttack ? "+" : "") + (p2BeginsAttack - p1BeginsAttack).toString()}</th>`;
        const len4 = report[p1move][p2move].matchup[p1BeginsAttack]?.length || 0;
        for (let distance = 0; distance < len4; distance++) {
          const [p1WasHit, p2WasHit, connectedOnNthFrame] = report[p1move][p2move].matchup[p1BeginsAttack][distance] || [false, false, 999];
          const winLoseTradeMiss = !p1WasHit && !p2WasHit ? 0 : p1WasHit && p2WasHit ? 3 : p1WasHit ? 2 : 1;
          if (winLoseTradeMiss & 1) p1wins++;
          if (winLoseTradeMiss & 2) p2wins++;
          const situation = getSituation(
            winLoseTradeMiss,
            connectedOnNthFrame,
            p1BeginsAttack,
            p2BeginsAttack,
            p1move + SystemMove.AttackMovesBegin,
            p2move + SystemMove.AttackMovesBegin
          );
          output += /*HTML*/ `
          <td class=${colors[winLoseTradeMiss]} data-clickToShow>
            <span class=resultLabel>${situation}</span>
            <div class=flyover>
              ${Snapshot(0, p1move + SystemMove.AttackMovesBegin, connectedOnNthFrame - p1BeginsAttack)}
              ${Snapshot(1, p2move + SystemMove.AttackMovesBegin, connectedOnNthFrame - p2BeginsAttack, distance * fullreport.smallestDistance)}
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
      if (!probTable[p1move]) probTable[p1move] = [];
      probTable[p1move][p2move] = (p1wins / (p1wins + p2wins)) * 100;
      output += /*HTML*/ `
          </table>
          <div class=distanceline>
            <span>close</span>
            <span><i>distance</i></span>
            <span>far</span>
          </div>
        </td>
        <td class=photoFrame data-p=1>
          <div class=photoFrameset>
            ${findSnapshot(1, p2move + SystemMove.AttackMovesBegin)}
          </div>
        </td>
      </tr>
      <tr>
        <td>
          ${getFramedataVisualization(0, p1move + SystemMove.AttackMovesBegin)} 
        </td>
        <td class=distanceline>
          <span>move ${p1move} win rate ${probTable?.[p1move]?.[p2move]?.toFixed(0)}%</span>
        </td>
        <td>
          ${getFramedataVisualization(1, p2move + SystemMove.AttackMovesBegin)} 
        </td>
      </tr>
    </table>`;
    }
  }
  output += /*HTML*/ `
  <table class=probTable>
    <tr>
      <th></th>
      ${probTable.map((_, p1move) => /*HTML*/ `<th>P1 move ${p1move}</th>`).join("")}
    </tr>
    ${probTable
      .map(
        (_, p1move) => /*HTML*/ `
     <tr>
          <th>P2 move ${p1move}</th>
          ${probTable[p1move]
            .map(
              (_, p2move) => /*HTML*/ `
            <td>${(probTable[p1move][p2move] || 0).toFixed(0)}%</td>
          `
            )
            .join("")} </tr>`
      )
      .join("")}
  </table>`;
  return output;
}

function FlyoverCell({
  winLoseTradeMiss,
  connectedOnNthFrame,
  p1BeginsAttack,
  p2BeginsAttack,
  p1move,
  p2move,
  distance,
}: {
  winLoseTradeMiss: 0 | 1 | 2 | 3;
  connectedOnNthFrame: number;
  p1BeginsAttack: frameCount;
  p2BeginsAttack: frameCount;
  p1move: number;
  p2move: number;
  distance: number;
}) {
  const colors = ["miss", "p1wins", "p2wins", "trade"];
  return (
    <td className={colors[winLoseTradeMiss]} data-clickToShow>
      <span className="resultLabel">
        <GetSituation2
          winLoseTradeMiss={winLoseTradeMiss}
          nthFrame={connectedOnNthFrame}
          p1StartOn={p1BeginsAttack}
          p2StartOn={p2BeginsAttack}
          moveId1={p1move + SystemMove.AttackMovesBegin}
          moveId2={p2move + SystemMove.AttackMovesBegin}
        />
      </span>
      <div className="flyover">
        {Snapshot(0, p1move + SystemMove.AttackMovesBegin, connectedOnNthFrame - p1BeginsAttack)}
        {Snapshot(1, p2move + SystemMove.AttackMovesBegin, connectedOnNthFrame - p2BeginsAttack, distance * fullreport.smallestDistance)}
        <div className="flyoverFrameCompare">
          <GetFramedataVisualization2 character={0} moveId={p1move + SystemMove.AttackMovesBegin} highlightedFrame={connectedOnNthFrame - p1BeginsAttack} />
          &mdash;
          <GetFramedataVisualization2 character={1} moveId={p2move + SystemMove.AttackMovesBegin} highlightedFrame={connectedOnNthFrame - p2BeginsAttack} />
        </div>
      </div>
    </td>
  );
}

let ProbabilityTableContext = { p1wins: 0, p2wins: 0 };

function RowOfDistances({
  len4,
  report,
  p1BeginsAttack,
  p2BeginsAttack,
  p1move,
  p2move,
}: {
  len4: number;
  report: MoveVsMove[][];
  p1BeginsAttack: number;
  p2BeginsAttack: number;
  p1move: number;
  p2move: number;
}) {
  const retval = [];
  for (let distance = 0; distance < len4; distance++) {
    const [p1WasHit, p2WasHit, connectedOnNthFrame] = report[p1move][p2move].matchup[p1BeginsAttack][distance] || [false, false, 999];
    const winLoseTradeMiss = !p1WasHit && !p2WasHit ? 0 : p1WasHit && p2WasHit ? 3 : p1WasHit ? 2 : 1;
    if (winLoseTradeMiss & 1) ProbabilityTableContext.p1wins++;
    if (winLoseTradeMiss & 2) ProbabilityTableContext.p2wins++;
    retval.push(
      <FlyoverCell
        winLoseTradeMiss={winLoseTradeMiss}
        connectedOnNthFrame={connectedOnNthFrame}
        p1BeginsAttack={p1BeginsAttack}
        p2BeginsAttack={p2BeginsAttack}
        p1move={p1move}
        p2move={p2move}
        distance={distance}
      />
    );
  }
  return <>{retval}</>;
}

function FrameTable({
  report,
  p1move,
  p2move,
  p2BeginsAttack,
  probTable,
}: {
  report: MoveVsMove[][];
  p1move: number;
  p2move: number;
  p2BeginsAttack: number;
  probTable: number[][];
}) {
  const retval = (
    <table class="frameTable">
      {report[p1move][p2move].matchup.map((_, p1BeginsAttack) => {
        const len4 = report[p1move][p2move].matchup[p1BeginsAttack]?.length || 0;
        return (
          <tr>
            <th>{(p2BeginsAttack > p1BeginsAttack ? "+" : "") + (p2BeginsAttack - p1BeginsAttack).toString()}</th>
            <RowOfDistances len4={len4} p1BeginsAttack={p1BeginsAttack} p2BeginsAttack={p2BeginsAttack} p1move={p1move} p2move={p2move} report={report} />
          </tr>
        );
      })}
    </table>
  );
  if (!probTable[p1move]) probTable[p1move] = [];
  probTable[p1move][p2move] = (ProbabilityTableContext.p1wins / (ProbabilityTableContext.p1wins + ProbabilityTableContext.p2wins)) * 100;
  return retval;
}

function Main2({ fullreport }: { fullreport: FullReport }) {
  let probTable: number[][] = [];
  const report = fullreport.report;
  return (
    <>
      {report.map((_, p1move) => {
        return (
          <>
            {report[p1move].map((_, p2move) => {
              ProbabilityTableContext = { p1wins: 0, p2wins: 0 };
              const p2BeginsAttack: frameCount = report[p1move][p2move].p2BeginsAttackOnThisFrame;
              return (
                <table class="row">
                  <tr>
                    <td class="photoFrame" data-p={0}>
                      <div class="photoFrameset">
                        <FindSnapshot2 character={0} moveId={p1move + SystemMove.AttackMovesBegin} />
                      </div>
                    </td>
                    <td>
                      <div class="header">
                        <span>Move {p1move}</span>
                        <span>vs</span>
                        <span>Move {p2move}</span>
                      </div>
                      <FrameTable report={report} p1move={p1move} p2move={p2move} p2BeginsAttack={p2BeginsAttack} probTable={probTable} />
                      <div class="distanceline">
                        <span>close</span>
                        <span>
                          <i>distance</i>
                        </span>
                        <span>far</span>
                      </div>
                    </td>
                    <td class="photoFrame" data-p={1}>
                      <div class="photoFrameset">
                        <FindSnapshot2 character={1} moveId={p2move + SystemMove.AttackMovesBegin} />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <GetFramedataVisualization2 character={0} moveId={p1move + SystemMove.AttackMovesBegin} />
                    </td>
                    <td class="distanceline">
                      <span>
                        move {p1move} win rate {probTable?.[p1move]?.[p2move]?.toFixed(0)}%
                      </span>
                    </td>
                    <td>
                      <GetFramedataVisualization2 character={1} moveId={p2move + SystemMove.AttackMovesBegin} />
                    </td>
                  </tr>
                </table>
              );
            })}
          </>
        );
      })}
      <table class="probTable">
        <tr>
          <th></th>
          {probTable.map((_, p1move) => (
            <th>P1 move {p1move}</th>
          ))}
        </tr>
        {probTable.map((_, p1move) => (
          <tr>
            <th>P2 move {p1move}</th>
            {probTable[p1move].map((_, p2move) => (
              <td>{(probTable[p1move][p2move] || 0).toFixed(0)}%</td>
            ))}
          </tr>
        ))}
      </table>
    </>
  );
}

// ok just use react or smthg
type EHandler<T extends keyof GlobalEventHandlersEventMap> = (e: GlobalEventHandlersEventMap[T]) => void;
type ETuple<T extends keyof GlobalEventHandlersEventMap> = [T, EHandler<T>];
const placeholder = "data-ehandler";
let handlers: ETuple<any>[] = [];
const onClick = (handler: EHandler<"click">) => on("click", handler);
function on<T extends keyof GlobalEventHandlersEventMap>(eventType: T, handler: (e: GlobalEventHandlersEventMap[T]) => void) {
  return ` ${placeholder}=${handlers.push([eventType, handler])} `;
}
const attach = () => {
  document.querySelectorAll(`[${placeholder}]`).forEach(el => {
    const i = parseInt(el.getAttribute(placeholder) || "1") - 1;
    const [eventType, handler] = handlers[i];
    el.addEventListener(eventType, handler);
    el.removeAttribute(placeholder);
  });
  handlers = [];
};
const reRender = (old: HTMLElement, innerHtml: string) => old.replaceWith(new DOMParser().parseFromString(innerHtml, "text/html").body.firstChild!);

// run program, create webpage report
//document.getElementById("report")!.innerHTML = main(await gettingReport);
render(<Main2 fullreport={await gettingReport} />, document.getElementById("report")!);
//render(<Main fullreport={await gettingReport}>hello preact</Main>, document.getElementById("preact")!);

// attach click handlers like its 1995
document.body.addEventListener("click", e => {
  const target = e.target as HTMLElement;
  const currentTarget = e.currentTarget as HTMLElement;
  if (target.getAttribute("data-clickToShow") != undefined) {
    Array.from<any>(target.children).forEach((child: HTMLElement) => (child.style.display = "block"));
    target.classList.add("highlight");
  }
  if (target.getAttribute("class")?.includes("flyover")) {
    target.style.display = "none";
  }
  if (target.getAttribute("data-for")) {
    const [character, moveId, frame] = target
      .getAttribute("data-for")!
      .split(".")
      .map(x => parseInt(x));
    document.querySelectorAll<HTMLElement>(`snap-shot[name="${character}.${moveId}"]`).forEach(photo => {
      reRender(photo, Snapshot(character as 0 | 1, moveId, frame));
    });
    document.querySelectorAll<HTMLElement>(`framedata-timeline[data-for="${character}.${moveId}"]`).forEach(frameline => {
      reRender(frameline, getFramedataVisualization(character as 0 | 1, moveId, frame));
    });
  }

  return false;
});
