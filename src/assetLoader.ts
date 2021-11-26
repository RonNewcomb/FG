import { Character } from "./character";
import { HUD } from "./hud";
import { IPlatform, AssetType } from "./IPlatform";
import { changeStage, IStage } from "./stage";
import { fdata1 } from "./testdata";

export class AssetLoader {
    constructor(private platformApi: IPlatform) {
    }

    getHudAsset = async (): Promise<HUD> => {
        const hudAssets = await this.platformApi.loadAsset(AssetType.UI, "hud");
        return new HUD(this.platformApi, hudAssets);
    }

    getCharacterAsset = async (name: string): Promise<Character> => {
        const c = await this.platformApi.loadAsset(AssetType.Character, name);
        return new Character([], [], fdata1, name);
    }

    getStageAsset = async (name: string): Promise<IStage> => {
        const stageAssets = await this.platformApi.loadAsset(AssetType.Stage, name);
        return changeStage(stageAssets);
    }
}
