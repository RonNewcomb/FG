import { Character } from "./character";
import { HUD } from "./hud";
import { IPlatform, AssetType } from "./IPlatform";
import { fdata1 } from "./testdata";

export class AssetLoader {
    constructor(private platformApi: IPlatform) {

    }
    async getHudAsset(): Promise<HUD> {
        const h = await this.platformApi.loadAsset(AssetType.UI, "hud");
        return new HUD(this.platformApi);
    }
    async getCharacterAsset(name: string): Promise<Character> {
        const c = await this.platformApi.loadAsset(AssetType.Character, name);
        return new Character([], [], fdata1, name);
    }
    async getStageAsset(name: string): Promise<object> {
        return this.platformApi.loadAsset(AssetType.Stage, name);
    }
}