import { damagePoints, meterPoints, I3DModel, IAudio, FrameData } from "./interfaces.js";

export class Character {
    isAirborne = false;
    health: damagePoints = 1000;
    meter: meterPoints = 0;

    constructor(public models: I3DModel[], public soundBites: IAudio[], public fdata: FrameData) {
        this.reset();
    }

    reset() {
        this.isAirborne = false;
        this.health = 1000;
        this.meter = 0;
    }
}
