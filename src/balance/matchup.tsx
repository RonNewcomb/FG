// this is the app for matchup.html;  might should be a small Preact app or something
import { render } from "preact";
import { useState } from "preact/hooks";
import { asHexValue, asPropertyList, PlatformNodeJs, PPMtoPixels } from "../game/PlatformNodeJs";
import { CharacterMove, frameCount, FullReport, SystemMove, Hitbox, MoveVsMove } from "../interfaces/interfaces";

const ppm2px = 1000;
let fullreport: FullReport;
const gettingReport = fetch("./MatchupResults.json")
  .then(res => res.json())
  .then(r => (fullreport = r));
const platform2 = new PlatformNodeJs();

function HitboxView({ box }: { box: Hitbox }) {
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

/** creates a picture (hitboxes & hurtboxes) of a particular frame of a particular move, facing in one of two directions, with optional horizontal offset */
function Snapshot({ character, moveId, frame, translateX }: { character: 0 | 1; moveId: SystemMove; frame: frameCount; translateX?: number }) {
  const move = fullreport.moves[character][moveId].hitboxes[frame];
  if (!move) return <Snapshot character={character} moveId={SystemMove.StandIdle} frame={0} translateX={translateX} />;
  const shift = !translateX ? "" : character === 1 ? `style='left: ${translateX / ppm2px}px'` : ``;
  return (
    <div className="snap-shot photo" name={`${character}.${moveId}`} data-p={character} data-moveid={moveId} {...shift}>
      {move.map(h => (
        <HitboxView box={h} />
      ))}
    </div>
  );
}

/** unless passed in, this finds a good "representative" snapshot to use.  Usually the first active frame */
function FindSnapshot({ character, moveId, frame, translateX }: { character: 0 | 1; moveId: SystemMove; frame?: number; translateX?: number }) {
  const move: CharacterMove = fullreport.moves[character][moveId];
  let frameToUse = frame ?? 0;
  if (frame === undefined)
    for (let f = 0; f < move.hitboxes.length; f++)
      if (move.hitboxes[f].some(h => !!h.effects)) {
        frameToUse = f;
        break;
      }
  return <Snapshot character={character} moveId={moveId} frame={frameToUse} translateX={translateX} />;
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
function MoveTimelineVisualization({
  character,
  moveId,
  highlightedFrame,
  onChangeShownFrame,
}: {
  character: 0 | 1;
  moveId: SystemMove;
  highlightedFrame?: number;
  onChangeShownFrame: (frame: number) => void;
}) {
  const [frame, setFrame] = useState(highlightedFrame);

  const changePhoto = (frame: number) => {
    setFrame(frame);
    onChangeShownFrame(frame);
  };

  const phases = getFramedataDescription(character, moveId);
  return (
    <div className="framedata-timeline timeline" data-name="timeline" data-for={`${character}.${moveId}`}>
      {phases
        .map((phase, i) => (
          <div data-for={`${character}.${moveId}.${i}`} onClick={_ => changePhoto(i)} className={`one-frame ${phase} ${i === frame ? "highlight" : ""}`}></div>
        ))
        .reverse()}
      <div className="prestartup"></div>
    </div>
  );
}

/** finds an FG term used to describe a hit (or miss) */
function GetSituation({
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

const colors = ["miss", "p1wins", "p2wins", "trade"];

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
  const [highlight, setHighlight] = useState(false);

  const clickToShow = () => {
    //Array.from<any>(target.children).forEach((child: HTMLElement) => (child.style.display = "block"));
  };

  return (
    <td className={colors[winLoseTradeMiss] + (highlight ? " highlight" : "")} onClick={() => setHighlight(!highlight)}>
      <span className="resultLabel">
        <GetSituation
          winLoseTradeMiss={winLoseTradeMiss}
          nthFrame={connectedOnNthFrame}
          p1StartOn={p1BeginsAttack}
          p2StartOn={p2BeginsAttack}
          moveId1={p1move + SystemMove.AttackMovesBegin}
          moveId2={p2move + SystemMove.AttackMovesBegin}
        />
      </span>
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

function ProbabilityTable({ probTable }: { probTable: number[][] }) {
  return (
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
  );
}

function OneComparison({ report, probTable, p1move, p2move }: { report: MoveVsMove[][]; probTable: number[][]; p1move: number; p2move: number }) {
  ProbabilityTableContext = { p1wins: 0, p2wins: 0 };
  const [displayedFrameP1, setDisplayedFrameP1] = useState<number | undefined>(undefined);
  const [displayedFrameP2, setDisplayedFrameP2] = useState<number | undefined>(undefined);
  const p2BeginsAttack: frameCount = report[p1move][p2move].p2BeginsAttackOnThisFrame;
  return (
    <table class="row">
      <tr>
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
        <td class="photoFrame" data-p={0}>
          <div class="photoFrameset">
            <FindSnapshot character={0} moveId={p1move + SystemMove.AttackMovesBegin} frame={displayedFrameP1} />
          </div>
        </td>
        <td class="photoFrame" data-p={1}>
          <div class="photoFrameset">
            <FindSnapshot character={1} moveId={p2move + SystemMove.AttackMovesBegin} frame={displayedFrameP2} />
          </div>
        </td>
      </tr>
      <tr>
        <td class="distanceline">
          <span>
            move {p1move} win rate {probTable?.[p1move]?.[p2move]?.toFixed(0)}%
          </span>
        </td>
        <td>
          <MoveTimelineVisualization character={0} moveId={p1move + SystemMove.AttackMovesBegin} onChangeShownFrame={setDisplayedFrameP1} />
        </td>
        <td>
          <MoveTimelineVisualization character={1} moveId={p2move + SystemMove.AttackMovesBegin} onChangeShownFrame={setDisplayedFrameP2} />
        </td>
      </tr>
    </table>
  );
}

/** loops through every combination of moves, ranges, and frame adv/disadv and create report of what happens when & where */
function Main2({ fullreport }: { fullreport: FullReport }) {
  const probTable: number[][] = [];
  const report = fullreport.report;
  console.log("main", report.length, report[0].length);
  return (
    <>
      {report.map((_, p1move) => report[p1move].map((_, p2move) => <OneComparison report={report} probTable={probTable} p1move={p1move} p2move={p2move} />))}
      <ProbabilityTable probTable={probTable} />
    </>
  );
}

// run program, create webpage report
render(<Main2 fullreport={await gettingReport} />, document.getElementById("report")!);
