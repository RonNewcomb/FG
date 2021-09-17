import { Character } from "./character";
import { HUD } from "./hud";
import { IPlatform, AssetType } from "./IPlatform";
import { fdata1 } from "./testdata";

export interface IStage {
    render(currentFrame: number): void;
}

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
    async getStageAsset(name: string): Promise<IStage> {
        const s = this.platformApi.loadAsset(AssetType.Stage, name);
        return { render(n: number) { } } as IStage;
    }
}
