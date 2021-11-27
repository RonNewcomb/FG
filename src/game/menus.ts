
// a menu is *always* an overlay like the HUD, even if it seems to be "the screen"

export class Menus {
    static selectStage(): Promise<string> {
        return Promise.resolve("training")
    }

    static selectCharacters(numCharacters: number = 2): Promise<string[]> {
        return Promise.resolve(["Kyu", "Ren"]);
    }
}
