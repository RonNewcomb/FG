import { damagePoints, meterPoints, FrameData, pixelCount } from "./interfaces";
import { I3DModel, IAudio } from "./IPlatform";

export class Character {
    x: pixelCount = 0;
    y: pixelCount = 0;
    facingLeft: boolean = true;
    isAirborne: boolean = false;
    health: damagePoints = 1000;
    meter: meterPoints = 0;

    constructor(public models: I3DModel[], public soundBites: IAudio[], public fdata: FrameData) {
    }

    reset(player1side: boolean) {
        this.x = 500 + (player1side ? -1 : +1) * 100;
        this.y = 0;
        this.facingLeft = player1side;
        this.isAirborne = false;
        this.health = 1000;
        this.meter = 0;
    }
}
