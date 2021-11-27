import { CharacterTemplate } from "./charaterTemplate";
import { damagePoints, meterPoints, PPM, HitboxSet, CharacterMove, halfmillion, quartermillion, million, SystemMove, IControlSource, IControlSourceType, Connected } from "../interfaces/interfaces";
import { IPlatform } from "../interfaces/IPlatform";
import { translateToWorldCoordinates } from "./util";

const isFacingRight = +1; // p1 side
const isFacingLeft = -1;  // p2 side -- x coordinates are flipped

export interface ICharacterRecord {
    x: PPM;
    y: PPM;
    xv: PPM;
    yv: PPM;
    facingDirection: -1 | 1;
    isAirborne: boolean;
    health: damagePoints;
    meter: meterPoints;
    currentMove: number;
    currentTick: number;
    comboCounter: number;
}

export class Character implements ICharacterRecord {
    readonly controlSource: IControlSource;
    x: PPM = 0;
    y: PPM = 0;
    xv: PPM = 0;
    yv: PPM = 0;
    facingDirection: -1 | 1 = isFacingRight;
    isAirborne: boolean = false;
    health: damagePoints = million;
    meter: meterPoints = 0;
    currentMove = 0; // index into fdata.moves
    currentTick = 0; // index into fdata.moves[currentMove]
    comboCounter = 0;

    constructor(public readonly assets: CharacterTemplate, controlSourceType: IControlSourceType, player1side: boolean) {
        this.reset(player1side);
        this.controlSource = new controlSourceType(assets.fdata);
        this.controlSource.matchReset();
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

    nextTick(bufferedNextMove: number, thingsHittingMe: (Connected | null)[]): ICharacterRecord {
        for (let thing of thingsHittingMe)
            if (thing)
                this.setCurrentMove(SystemMove.Hit);

        this.currentTick++;
        const lengthOfMoveInFrames = this.assets.fdata.moves[this.currentMove].hitboxes.length;
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
        const record: ICharacterRecord = {
            x: this.x,
            y: this.y,
            xv: this.xv,
            yv: this.yv,
            facingDirection: this.facingDirection,
            isAirborne: this.isAirborne,
            health: this.health,
            meter: this.meter,
            currentMove: this.currentMove,
            currentTick: this.currentTick,
            comboCounter: this.comboCounter,
        }
        return record;
    }

    getCurrentMove(): CharacterMove {
        return this.assets.fdata.moves[this.currentMove];
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
