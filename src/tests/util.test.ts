import { Hitbox, HitboxProperties } from "../interfaces/interfaces";
import { translateToWorldCoordinates } from "../game/util";

test('translate to world coordinates - no player2-side flip', () => {
    const noFlip = true;
    const target: Hitbox = { x: 50, y: 10, tall: 30, wide: 20, props: HitboxProperties.Hurtbox };
    const characterX = 700;
    const characterY = 500;
    const translatedTargetBox = translateToWorldCoordinates(target, characterX, characterY, noFlip);
    expect(translatedTargetBox).not.toBeNull();
    expect(translatedTargetBox.tall).toBe(target.tall);
    expect(translatedTargetBox.wide).toBe(target.wide);
    expect(translatedTargetBox.props).toBe(target.props);
    expect(translatedTargetBox.y).toBe(500 + 10);//characterY + target.y
    expect(translatedTargetBox.x).toBe(700 + 50);//characterX + target.x
});

test('translate to world coordinates - with player2-side flip', () => {
    const noFlip = false;
    const target: Hitbox = { x: 50, y: 10, tall: 30, wide: 20, props: HitboxProperties.Hurtbox };
    const characterX = 700;
    const characterY = 500;
    const translatedTargetBox = translateToWorldCoordinates(target, characterX, characterY, noFlip);
    expect(translatedTargetBox).not.toBeNull();
    expect(translatedTargetBox.tall).toBe(target.tall);
    expect(translatedTargetBox.wide).toBe(target.wide);
    expect(translatedTargetBox.props).toBe(target.props);
    expect(translatedTargetBox.y).toBe(500 + 10);//characterY + target.y
    expect(translatedTargetBox.x).toBe(700 - 50 - 20);//characterX - target.x - target.wide
});
