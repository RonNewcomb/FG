import { AIInput } from '../game/ai';
import { Character } from '../game/character';
import { CharacterTemplate } from '../game/charaterTemplate';
import { rectanglesIntersect, checkBoxes, hasAny } from '../game/collision';
import { Hitbox, HitboxProperties } from '../interfaces/interfaces';
import { fdata1 } from '../game/testdata';

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

test("these boxsets do intersect - strike has priority over grab", () => {
    const attacks: Hitbox[] = [
        { x: 50, y: 0, tall: 30, wide: 20, props: HitboxProperties.Grab },
        { x: 50, y: 0, tall: 30, wide: 20, props: HitboxProperties.Strike }
    ];
    const targets: Hitbox[] = [
        { x: 150, y: 0, tall: 30, wide: 20, props: HitboxProperties.Hurtbox },
        { x: 50, y: 0, tall: 30, wide: 20, props: HitboxProperties.Hurtbox }
    ];
    const answer = checkBoxes(attacks, targets)!;
    expect(answer).not.toBeNull();
    expect(answer).toHaveLength(3);
    const a = answer[0];
    const t = answer[1];
    const p = answer[2];
    expect(a).toBe(attacks[1]);
    expect(t).toBe(targets[1]);
    expect(p).toBe(HitboxProperties.Strike);
    expect(a.props).toBe(HitboxProperties.Strike);
});

test("these boxsets don't intersect", () => {
    const attacks: Hitbox[] = [
        { x: 50, y: 0, tall: 30, wide: 20, props: HitboxProperties.Grab },
        { x: 50, y: 0, tall: 30, wide: 20, props: HitboxProperties.Strike }
    ];
    const targets: Hitbox[] = [
        { x: 150, y: 0, tall: 30, wide: 20, props: HitboxProperties.Hurtbox },
        { x: 250, y: 0, tall: 30, wide: 20, props: HitboxProperties.Hurtbox }
    ];
    expect(checkBoxes(attacks, targets)).toBeNull();
});

test("these boxsets do intersect - strike misses but grab hits", () => {
    const attacks: Hitbox[] = [
        { x: 550, y: 0, tall: 30, wide: 20, props: HitboxProperties.Strike },
        { x: 50, y: 0, tall: 30, wide: 20, props: HitboxProperties.Grab }
    ];
    const targets: Hitbox[] = [
        { x: 150, y: 0, tall: 30, wide: 20, props: HitboxProperties.Hurtbox },
        { x: 50, y: 0, tall: 30, wide: 20, props: HitboxProperties.Hurtbox }
    ];
    const answer = checkBoxes(attacks, targets)!;
    expect(answer).not.toBeNull();
    expect(answer).toHaveLength(3);
    const a = answer[0];
    const t = answer[1];
    const p = answer[2];
    expect(a).toBe(attacks[1]);
    expect(t).toBe(targets[1]);
    expect(p).toBe(HitboxProperties.Grab);
    expect(a.props).toBe(HitboxProperties.Grab);
});

test("any frame with a strike/grab/projectile hitbox must have an Effect", () => {
    const template = new CharacterTemplate([], [], fdata1, "Name");
    const framedata = template.fdata;
    for (let move of framedata.moves) {
        for (let hitboxes of move.hitboxes) {
            const hasAttackNoEffect = hitboxes.some(hb => !hb.effects && hasAny(hb.props, HitboxProperties.Grab | HitboxProperties.Strike | HitboxProperties.Projectile));
            expect(hasAttackNoEffect).toBeFalsy();
        }
    }
});