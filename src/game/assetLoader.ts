import { CharacterTemplate } from "./charaterTemplate";
import { HUD } from "./hud";
import { IPlatform, AssetType } from "../interfaces/IPlatform";
import { changeStage, IStage } from "./stage";
import { fdata1 } from "./testdata";

export class AssetLoader {
    constructor(private readonly platformApi: IPlatform) {
    }

    getHudAssets = async (): Promise<HUD> => {
        const hudAssets = await this.platformApi.loadAsset(AssetType.UI, "hud");
        return new HUD(this.platformApi, hudAssets);
    }

    getCharacterAssets = async (name: string): Promise<CharacterTemplate> => {
        const c = await this.platformApi.loadAsset(AssetType.Character, name);
        return new CharacterTemplate([], [], fdata1, name);
    }

    getStageAssets = async (name: string): Promise<IStage> => {
        const stageAssets = await this.platformApi.loadAsset(AssetType.Stage, name);
        return changeStage(stageAssets);
    }
}
