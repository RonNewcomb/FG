import { damagePoints, meterPoints, FrameData, PPM } from "./interfaces";
import { I3DModel, IAudio } from "./IPlatform";

export class Character {
    x: PPM = 0;
    y: PPM = 0;
    facingLeft: boolean = true;
    isAirborne: boolean = false;
    health: damagePoints = 1000;
    meter: meterPoints = 0;

    constructor(public models: I3DModel[], public soundBites: IAudio[], public fdata: FrameData) {
    }

    reset(player1side: boolean) {
        this.x = <PPM>500000 + (player1side ? -1 : +1) * <PPM>100000;
        this.y = <PPM>50;
        this.facingLeft = player1side;
        this.isAirborne = false;
        this.health = <damagePoints>1000;
        this.meter = <meterPoints>0;
    }
}
