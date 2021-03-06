import { FrameData, IAiInput, IButtonArray, SystemMove } from "../interfaces/interfaces";

export class AIInput implements IAiInput {
    readonly numMoves: number;

    constructor(fdata: FrameData) {
        this.numMoves = fdata.moves.length - 1;
    }

    roundReset(): void {
        // no "memory" to reset
    }

    matchReset(): void {
        // no "memory" to reset
    }

    getButtons(): IButtonArray {
        return Math.random() > 0.10 ? Math.floor(Math.random() * (this.numMoves - 0.1) + SystemMove.StandIdle) : SystemMove.StandIdle;
    }

}
