// this is the app for matchup.html;  might should be a small Preact app or something
import { render } from "preact";
import { useState } from "preact/hooks";
import { asHexValue, asPropertyList, PlatformNodeJs, PPMtoPixels } from "../game/PlatformNodeJs";
import { CharacterMove, frameCount, FullReport, SystemMove, Hitbox, MoveVsMove, Connected, HitboxID } from "../interfaces/interfaces";

const ppm2px = 1000;
let fullreport: FullReport;
const gettingReport = fetch("./MatchupResults.json")
  .then(res => res.json())
  .then(r => (fullreport = r));
const platform2 = new PlatformNodeJs();

function HitboxView({ box, glow }: { box: Hitbox; glow?: boolean }) {
  const { borderColor, backgroundColor } = platform2.getHitboxProps(box);
  return (
    <div
      title={asPropertyList(box.props)}
      style={`position:absolute; ${glow ? "animation: pulse 2s infinite;" : ""}
                top:${box.y * PPMtoPixels}px;       left:${box.x * PPMtoPixels}px;
                width:${box.wide * PPMtoPixels}px;  height:${box.tall * PPMtoPixels}px;
                background-color:${asHexValue(backgroundColor)}; border: 1px solid ${asHexValue(borderColor)};
            `}
    ></div>
  );
}

/** creates a picture (hitboxes & hurtboxes) of a particular frame of a particular move, facing in one of two directions, with optional horizontal offset */
function Snapshot({
  character,
  moveId,
  frame,
  translateX,
  boxesInvolved,
}: {
  character: 0 | 1;
  moveId: SystemMove;
  frame: frameCount;
  translateX?: number;
  boxesInvolved?: (HitboxID | undefined)[];
}) {
  const hitboxes = fullreport.moves[character][moveId].hitboxes[frame];
  if (!hitboxes) return <Snapshot character={character} moveId={SystemMove.StandIdle} frame={0} translateX={translateX} />;
  const shift = character === 0 ? "" : translateX ? `left: ${translateX / ppm2px}px; transform:scaleX(-1)` : `transform:scaleX(-1)`;
  return (
    <div className="snap-shot photo" style={shift}>
      {hitboxes.map((hitbox, i) => (
        <HitboxView box={hitbox} glow={boxesInvolved && boxesInvolved.includes(i)} />
      ))}
    </div>
  );
}

/** unless passed in, this finds a good "representative" snapshot to use.  Usually the first active frame */
function findSnapshot(character: 0 | 1, moveId: SystemMove, frame?: number) {
  const move: CharacterMove = fullreport.moves[character][moveId];
  let frameToUse = frame ?? 0;
  if (frame === undefined)
    for (let f = 0; f < move.hitboxes.length; f++)
      if (move.hitboxes[f].some(h => !!h.effects)) {
        frameToUse = f;
        break;
      }
  return frameToUse;
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
  highlightedFrame: number;
  onChangeShownFrame: (frame: number) => void;
}) {
  const phases = getFramedataDescription(character, moveId);
  return (
    <div className="framedata-timeline timeline">
      {phases
        .map((phase, i) => <div onClick={_ => onChangeShownFrame(i)} className={`one-frame ${phase} ${i === highlightedFrame ? "highlight" : ""}`}></div>)
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

let ProbabilityTableContext = { p1wins: 0, p2wins: 0 };

function RowOfDistances({
  vs,
  p1BeginsAttack,
  p2BeginsAttack,
  p1MoveId,
  p2MoveId,
  highlighting,
  onClickDistance,
}: {
  vs: MoveVsMove;
  p1BeginsAttack: number;
  p2BeginsAttack: number;
  p1MoveId: SystemMove;
  p2MoveId: SystemMove;
  highlighting: [number, number, number];
  onClickDistance: (h: HighlightedCell) => void;
}) {
  const numberOfDistances = vs.matchup[p1BeginsAttack]?.length || 0;
  const retval = [];
  for (let distance = 0; distance < numberOfDistances; distance++) {
    const [p1WasHit, p2WasHit, connectedOnNthFrame, oddReason, p1Hitting, p2Hitting] = vs.matchup[p1BeginsAttack][distance] || [false, false, 999];
    const winLoseTradeMiss = !p1WasHit && !p2WasHit ? 0 : p1WasHit && p2WasHit ? 3 : p1WasHit ? 2 : 1;
    if (winLoseTradeMiss & 1) ProbabilityTableContext.p1wins++;
    if (winLoseTradeMiss & 2) ProbabilityTableContext.p2wins++;
    const highlight =
      highlighting[2] === distance && highlighting[0] === connectedOnNthFrame - p1BeginsAttack && highlighting[1] === connectedOnNthFrame - p2BeginsAttack;
    retval.push(
      <td
        className={colors[winLoseTradeMiss] + (highlight ? " highlight" : "")}
        onClick={() =>
          onClickDistance({
            distance,
            p1Frame: connectedOnNthFrame - p1BeginsAttack,
            p2Frame: connectedOnNthFrame - p2BeginsAttack,
            p1Hitting,
            p2Hitting,
          })
        }
      >
        <span className="resultLabel">
          {oddReason ? (
            oddReason
          ) : (
            <GetSituation
              winLoseTradeMiss={winLoseTradeMiss}
              nthFrame={connectedOnNthFrame}
              p1StartOn={p1BeginsAttack}
              p2StartOn={p2BeginsAttack}
              moveId1={p1MoveId}
              moveId2={p2MoveId}
            />
          )}
        </span>
      </td>
    );
  }
  return <>{retval}</>;
}

function FrameTable({
  vs,
  p1MoveId,
  p2MoveId,
  setProbability,
  highlighting,
  onClickDistance,
}: {
  vs: MoveVsMove;
  p1MoveId: SystemMove;
  p2MoveId: SystemMove;
  setProbability: () => void;
  highlighting: [number, number, number];
  onClickDistance: (h: HighlightedCell) => void;
}) {
  const p2BeginsAttack = vs.p2BeginsAttackOnThisFrame;
  const retval = (
    <table class="frameTable">
      {vs.matchup.map((_, p1BeginsAttack) => {
        const frameAdvantage = p2BeginsAttack - p1BeginsAttack;
        return (
          <tr>
            <th>{(p2BeginsAttack > p1BeginsAttack ? "+" : "") + frameAdvantage.toString()}</th>
            <RowOfDistances
              p1BeginsAttack={p1BeginsAttack}
              p2BeginsAttack={p2BeginsAttack}
              p1MoveId={p1MoveId}
              p2MoveId={p2MoveId}
              vs={vs}
              highlighting={highlighting}
              onClickDistance={onClickDistance}
            />
          </tr>
        );
      })}
    </table>
  );
  setProbability();
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

interface HighlightedCell {
  p1Frame: number;
  p2Frame: number;
  distance: number;
  p1Hitting?: Connected;
  p2Hitting?: Connected;
}

interface IBoxesInvolved {
  p1Landing?: HitboxID;
  p2Landing?: HitboxID;
  p1Hurting?: HitboxID;
  p2Hurting?: HitboxID;
}

function OneComparison({ report, probTable, p1move, p2move }: { report: MoveVsMove[][]; probTable: number[][]; p1move: number; p2move: number }) {
  ProbabilityTableContext = { p1wins: 0, p2wins: 0 };
  const p1MoveId = p1move + SystemMove.AttackMovesBegin;
  const p2MoveId = p2move + SystemMove.AttackMovesBegin;
  const [displayedFrameP1, setDisplayedFrameP1] = useState(() => findSnapshot(0, p1MoveId));
  const [displayedFrameP2, setDisplayedFrameP2] = useState(() => findSnapshot(1, p2MoveId));
  const [distance, setDistance] = useState(5);
  const [boxesInvolved, setBoxesInvolved] = useState<IBoxesInvolved>();

  const display = (h: HighlightedCell) => {
    setDisplayedFrameP1(h.p1Frame);
    setDisplayedFrameP2(h.p2Frame);
    setDistance(h.distance);
    setBoxesInvolved({
      p1Landing: h.p1Hitting?.[0],
      p2Landing: h.p2Hitting?.[0],
      p1Hurting: h.p2Hitting?.[1],
      p2Hurting: h.p1Hitting?.[1],
    });
  };

  const setProbability = () => {
    if (!probTable[p1move]) probTable[p1move] = [];
    probTable[p1move][p2move] = (ProbabilityTableContext.p1wins / (ProbabilityTableContext.p1wins + ProbabilityTableContext.p2wins)) * 100;
  };

  const smallestDistancePx = fullreport.smallestDistance;
  const vs: MoveVsMove = report[p1move][p2move];
  const boxesInvolvedP1 = boxesInvolved ? [boxesInvolved.p1Landing, boxesInvolved.p1Hurting] : undefined;
  const boxesInvolvedP2 = boxesInvolved ? [boxesInvolved.p2Landing, boxesInvolved.p2Hurting] : undefined;
  return (
    <table class="row">
      <tr>
        <td>
          <div class="header">
            <span>Move {p1move}</span>
            <span>vs</span>
            <span>Move {p2move}</span>
          </div>
          <FrameTable
            vs={vs}
            p1MoveId={p1MoveId}
            p2MoveId={p2MoveId}
            setProbability={setProbability}
            highlighting={[displayedFrameP1, displayedFrameP2, distance]}
            onClickDistance={display}
          />
          <div class="distanceline">
            <span>close</span>
            <span>
              <i>distance</i>
            </span>
            <span>far</span>
          </div>
        </td>
        <td class="photoFrame" colSpan={2}>
          <div class="camera">
            <Snapshot character={0} moveId={p1MoveId} frame={displayedFrameP1} boxesInvolved={boxesInvolvedP1} />
            <Snapshot character={1} moveId={p2MoveId} frame={displayedFrameP2} boxesInvolved={boxesInvolvedP2} translateX={distance * smallestDistancePx} />
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
          <MoveTimelineVisualization character={0} moveId={p1MoveId} highlightedFrame={displayedFrameP1} onChangeShownFrame={setDisplayedFrameP1} />
        </td>
        <td>
          <MoveTimelineVisualization character={1} moveId={p2MoveId} highlightedFrame={displayedFrameP2} onChangeShownFrame={setDisplayedFrameP2} />
        </td>
      </tr>
    </table>
  );
}

/** loops through every combination of moves, ranges, and frame adv/disadv and create report of what happens when & where */
function Main2({ fullreport }: { fullreport: FullReport }) {
  const probTable: number[][] = [];
  const report = fullreport.report;
  return (
    <>
      {report.map((_, p1move) => report[p1move].map((_, p2move) => <OneComparison report={report} probTable={probTable} p1move={p1move} p2move={p2move} />))}
      <ProbabilityTable probTable={probTable} />
    </>
  );
}

// run program, create webpage report
render(<Main2 fullreport={await gettingReport} />, document.getElementById("report")!);
