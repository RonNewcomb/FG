import { FrameData } from "./interfaces";
import { I3DModel, IAudio } from "./IPlatform";

export class CharacterTemplate {
    constructor(public models: I3DModel[], public soundBites: IAudio[], public fdata: FrameData, public name: string) {
    }
}
