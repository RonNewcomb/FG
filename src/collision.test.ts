import { rectanglesIntersect, checkBoxes, } from './collision';
import { Hitbox, HitboxProperties } from './Interfaces';

test('exactly equal boxes intersect', () => {
    const attack: Hitbox = { x: 50, y: 0, tall: 30, wide: 20, props: HitboxProperties.Strike };
    const target: Hitbox = { x: 50, y: 0, tall: 30, wide: 20, props: HitboxProperties.Hurtbox };
    expect(rectanglesIntersect(attack, target)).toBe(true);
});

test("these boxes don't intersect", () => {
    const attack: Hitbox = { x: 50, y: 0, tall: 30, wide: 20, props: HitboxProperties.Strike };
    const target: Hitbox = { x: 150, y: 0, tall: 30, wide: 20, props: HitboxProperties.Hurtbox };
    expect(rectanglesIntersect(attack, target)).toBe(false);
});
