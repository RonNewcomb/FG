import { damagePoints, meterPoints, I3DModel, IAudio, FrameData, pixelCount } from "./interfaces.js";

export class Character {
    x: pixelCount = 0;
    y: pixelCount = 0;
    facingLeft: boolean = true;
    isAirborne: boolean = false;
    health: damagePoints = 1000;
    meter: meterPoints = 0;

    constructor(public models: I3DModel[], public soundBites: IAudio[], public fdata: FrameData) {
        this.reset(true);
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
