import { FrameData } from "./interfaces";
import { I3DModel, IAudio } from "./IPlatform";

export class CharacterTemplate {
    constructor(public readonly models: I3DModel[], public readonly soundBites: IAudio[], public readonly fdata: FrameData, public readonly name: string) {
    }
}
