import { IAiInput, IButtonArray, ICharacter, IControlSource, SystemMove } from "./interfaces";


export class AIInput implements IAiInput {
    numMoves: number;

    constructor(public char: ICharacter) {
        this.numMoves = char.fdata.moves.length - 1;
        return this;
    }

    getButtons(): IButtonArray {
        return Math.random() > 0.10 ? Math.floor(Math.random() * (this.numMoves - 0.1) + SystemMove.StandIdle) : SystemMove.StandIdle;
    }

}
