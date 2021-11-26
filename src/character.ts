import { damagePoints, meterPoints, FrameData, PPM, HitboxSet, CharacterMove, halfmillion, quartermillion, million, SystemMove, ICharacter } from "./interfaces";
import { I3DModel, IAudio, IPlatform } from "./IPlatform";
import { translateToWorldCoordinates } from "./util";

const isFacingRight = +1; // p1 side
const isFacingLeft = -1;  // p2 side -- x coordinates are flipped

export class Character implements ICharacter {
    x: PPM = 0;
    y: PPM = 0;
    xv: PPM = 0;
    yv: PPM = 0;
    facingDirection = isFacingRight;
    isAirborne: boolean = false;
    health: damagePoints = million;
    meter: meterPoints = 0;
    currentMove = 0; // index into fdata.moves
    currentTick = 0; // index into fdata.moves[currentMove]
    comboCounter = 0;

    constructor(public models: I3DModel[], public soundBites: IAudio[], public fdata: FrameData, public name: string) {
    }

    reset(player1side: boolean): void {
        this.facingDirection = (player1side ? isFacingRight : isFacingLeft);
        this.x = halfmillion + -this.facingDirection * quartermillion / 2;
        this.y = million - quartermillion;
        this.xv = 0;
        this.yv = 0;
        this.isAirborne = false;
        this.health = <damagePoints>million;
        this.meter = <meterPoints>0;
        this.currentMove = 0;
        this.currentTick = 0;
        this.comboCounter = 0;
    }

    nextTick(bufferedNextMove: number): void {
        this.currentTick++;
        const lengthOfMoveInFrames = this.fdata.moves[this.currentMove].hitboxes.length;
        if (this.currentTick >= lengthOfMoveInFrames) {
            // then move has ended; pick next one if applicable
            this.currentMove = bufferedNextMove || SystemMove.StandIdle;
            this.currentTick = 0;
        }
        const moveInProgress = this.getCurrentMove();
        const effects = moveInProgress.effects?.[this.currentTick];
        if (effects) {
            if (effects.xOffset) this.x += effects.xOffset * this.facingDirection;
            if (effects.yOffset) this.y += effects.yOffset;
            if (effects.xVelocity !== undefined) this.xv = effects.xVelocity * this.facingDirection;
            if (effects.yVelocity !== undefined) this.yv = effects.yVelocity;
        }
    }

    getCurrentMove(): CharacterMove {
        return this.fdata.moves[this.currentMove];
    }

    getCurrentBoxesInWorldCoordinates(): HitboxSet {
        return this.getCurrentMove().hitboxes[this.currentTick].map(b => translateToWorldCoordinates(b, this.x, this.y, this.facingDirection === isFacingRight));
    }

    setCurrentMove(moveId: SystemMove): void {
        this.currentMove = moveId;
        this.currentTick = 0;
    }

    render(platformApi: IPlatform): void {
        const move = this.getCurrentMove();
        if (move.models)
            for (let model of move.models)
                platformApi.renderModel(model, { x: this.x, y: this.y }, {});

        //platformApi.drawHitbox({ x: this.x, y: this.y, tall: million, wide: 5000, props: 0 }); // axis

        const boxes = this.getCurrentBoxesInWorldCoordinates();
        for (let box of boxes)
            platformApi.drawHitbox(box);
    }

}
