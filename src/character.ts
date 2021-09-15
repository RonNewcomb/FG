import { damagePoints, meterPoints, FrameData, PPM, Hitbox, HitboxSet, CharacterMove, halfmillion, quartermillion, million } from "./interfaces";
import { I3DModel, IAudio, IPlatform } from "./IPlatform";

export class Character {
    x: PPM = 0;
    y: PPM = 0;
    facingRight: boolean = true;
    isAirborne: boolean = false;
    health: damagePoints = 1000;
    meter: meterPoints = 0;
    currentMove = 0; // index into fdata.moves
    currentTick = 0; // index into fdata.moves[currentMove]

    constructor(public models: I3DModel[], public soundBites: IAudio[], public fdata: FrameData) {
    }

    reset(player1side: boolean) {
        this.facingRight = player1side;
        this.x = halfmillion + (player1side ? -1 : +1) * quartermillion;
        this.y = million - quartermillion;
        this.isAirborne = false;
        this.health = <damagePoints>1000;
        this.meter = <meterPoints>0;
        this.currentMove = 0;
        this.currentTick = 0;
    }

    nextTick(bufferedNextMove: number) {
        this.currentTick++;
        if (this.currentTick >= this.fdata.moves[this.currentMove].hitboxes.length) {
            this.currentTick = 0;
            this.currentMove = bufferedNextMove || 0;
        }
    }

    getCurrentMove(): CharacterMove {
        return this.fdata.moves[this.currentMove];
    }

    getCurrentBoxes(): HitboxSet {
        return this.getCurrentMove().hitboxes[this.currentTick];
    }

    render(platformApi: IPlatform): void {
        const move = this.getCurrentMove();
        for (let model of move.models)
            platformApi.renderModel(model, { x: this.x, y: this.y }, {});

        const boxes = this.getCurrentBoxes();
        for (let box of boxes) {
            const shiftedBox = translateToWorldCoordinates(box, this.x, this.y, this.facingRight);
            platformApi.drawHitbox(shiftedBox);
        }
    }
}

export function translateToWorldCoordinates(box: Hitbox, x: number, y: number, facingRight: boolean): Hitbox {
    const translatedBox: Hitbox = {
        x: facingRight ? (x + box.x) : (x - box.x - box.wide),
        y: box.y + y,
        tall: box.tall,
        wide: box.wide,
        props: box.props,
        effects: box.effects,
    };
    return translatedBox;
}

