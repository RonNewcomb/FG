import { AIInput } from "../game/ai";
import { Character } from "../game/character";
import { CharacterTemplate } from "../game/charaterTemplate";
import { HUD } from "../game/hud";
import { IPlatform } from "../interfaces/IPlatform";
import { fdata1 } from "../game/testdata";
import { MockPlatform } from "./testdata.test";

test('hud.render renders some text and boxes', () => {
    const platformMock: IPlatform = new MockPlatform();
    const hud = new HUD(platformMock, {});
    const template = new CharacterTemplate([], [], fdata1, "Name");
    const char = new Character(template, AIInput, true);

    hud.render(1, [char, char], 60);

    expect(platformMock.renderText).toHaveBeenCalled();
    expect(platformMock.drawHitbox).toHaveBeenCalled();
});

