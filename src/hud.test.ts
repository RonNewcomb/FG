import { Character } from "./character";
import { HUD } from "./hud";
import { IPlatform } from "./IPlatform";
import { MockPlatform } from "./testdata.test";

test('hud.render renders some text and boxes', () => {
    const platformMock: IPlatform = new MockPlatform();
    const hud = new HUD(platformMock, {});
    const char = new Character([], [], { moves: [] }, "");

    hud.render(1, [char, char], 60);

    expect(platformMock.renderText).toHaveBeenCalled();
    expect(platformMock.drawHitbox).toHaveBeenCalled();
});

