import { CharacterTemplate } from '../game/charaterTemplate';
import { rectanglesIntersect, checkBoxes, collisionDetection } from '../game/collision';
import { Connected, Hitbox, HitboxProperties, } from '../interfaces/interfaces';
import { fdata1, GrabMoveId, SwordMoveId } from '../game/testdata';
import { hasAny, NullInput } from '../game/util';
import { Character } from '../game/character';
import { getSmallestDistance } from '../balance/MatchupsFinder';

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
    const a = attacks[answer[0]];
    const t = targets[answer[1]];
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
    expect(checkBoxes(attacks, targets)).toBeFalsy();
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
    const a = attacks[answer[0]];
    const t = targets[answer[1]];
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

test("sword hits grab and grab misses from range at frame adv +0", () => {
    const template = new CharacterTemplate([], [], fdata1, "Name");
    const characters = [new Character(template, NullInput, true), new Character(template, NullInput, false)];
    const walkDelta = getSmallestDistance(characters[0], characters[1]);
    const distanceBetweenCharacters = walkDelta * 10; // 1-8 = p2(grab) wins, 9-11 = p1(strike) wins
    characters[1].x = characters[0].x + (distanceBetweenCharacters); // 300,000 apart is in sword range but out of grab range
    characters[0].setCurrentMove(SwordMoveId);
    characters[1].setCurrentMove(GrabMoveId);
    let matrix: (Connected | undefined)[][];
    for (let frame = 0; frame < 6; frame++) {
        characters.forEach(c => c.quickTick());
        matrix = collisionDetection(characters);
        if (matrix[0][1] != null || matrix[1][0] != null)
            break;
    }
    expect(matrix!).toBeDefined();
    const p1WasHit = matrix![0][1]; // grab should missed
    const p2WasHit = matrix![1][0]; // sword should hit
    expect(p1WasHit).toBeUndefined();
    expect(p2WasHit).toBeDefined();
});

test("THIS SHOULD FAIL - BOTH WHIFF", () => {
    const template = new CharacterTemplate([], [], fdata1, "Name");
    const characters = [new Character(template, NullInput, true), new Character(template, NullInput, false)];
    const walkDelta = getSmallestDistance(characters[0], characters[1]);
    const distanceBetweenCharacters = walkDelta * 13; // 1-8 = p2(grab) wins, 9-11 = p1(strike) wins; 12-13 should whiff but dont
    characters[1].x = characters[0].x + (distanceBetweenCharacters); // 300,000 apart is in sword range but out of grab range
    characters[0].setCurrentMove(SwordMoveId);
    characters[1].setCurrentMove(GrabMoveId);
    let matrix: (Connected | undefined)[][];
    for (let frame = 0; frame < 6; frame++) {
        characters.forEach(c => c.quickTick());
        matrix = collisionDetection(characters);
        if (matrix[0][1] != null || matrix[1][0] != null)
            break;
    }
    expect(matrix!).toBeDefined();
    const p1WasHit = matrix![0][1]; // grab should missed
    const p2WasHit = matrix![1][0]; // sword should hit
    expect(p1WasHit).toBeUndefined();
    expect(p2WasHit).toBeUndefined();
});

test("swords trade at frame adv +0", () => {
    const template = new CharacterTemplate([], [], fdata1, "Name");
    const characters = [new Character(template, NullInput, true), new Character(template, NullInput, false)];
    characters[1].x = characters[0].x + 300000; // 300,000 apart is in sword range but out of grab range
    characters[0].setCurrentMove(SwordMoveId);
    characters[1].setCurrentMove(SwordMoveId);
    let matrix: (Connected | undefined)[][];
    for (let frame = 0; frame < 6; frame++) {
        characters.forEach(c => c.quickTick());
        matrix = collisionDetection(characters);
        if (matrix[0][1] != null || matrix[1][0] != null)
            break;
    }
    expect(matrix!).toBeDefined();
    const p1WasHit = matrix![0][1]; // sword should hit
    const p2WasHit = matrix![1][0]; // sword should hit
    expect(p1WasHit).toBeDefined();
    expect(p2WasHit).toBeDefined();
});

test("simlutaneous grabs at frame adv +0 both miss", () => {
    const template = new CharacterTemplate([], [], fdata1, "Name");
    const characters = [new Character(template, NullInput, true), new Character(template, NullInput, false)];
    characters[1].x = characters[0].x + 300000; // 300,000 apart is in sword range but out of grab range
    characters[0].setCurrentMove(GrabMoveId);
    characters[1].setCurrentMove(GrabMoveId);
    let matrix: (Connected | undefined)[][];
    for (let frame = 0; frame < 6; frame++) {
        characters.forEach(c => c.quickTick());
        matrix = collisionDetection(characters);
        if (matrix[0][1] != null || matrix[1][0] != null)
            break;
    }
    expect(matrix!).toBeDefined();
    const p1WasHit = matrix![0][1]; // grab should missed
    const p2WasHit = matrix![1][0]; // grab should missed
    expect(p1WasHit).toBeUndefined();
    expect(p2WasHit).toBeUndefined();
});

test("grab at frame adv +1 beats other grab", () => {
    const template = new CharacterTemplate([], [], fdata1, "Name");
    const characters = [new Character(template, NullInput, true), new Character(template, NullInput, false)];
    characters[1].x = characters[0].x + 100000; // 300,000 apart is in sword range but out of grab range
    characters[0].setCurrentMove(GrabMoveId);
    characters[1].setCurrentMove(GrabMoveId);
    characters[1].quickTick();
    let matrix: (Connected | undefined)[][];
    for (let frame = 0; frame <= 6; frame++) {
        matrix = collisionDetection(characters);
        if (matrix[0][1] != null || matrix[1][0] != null)
            break;
        characters.forEach(c => c.quickTick());
    }
    expect(matrix!).toBeDefined();
    const p1WasHit = matrix![0][1]; // grab should hit
    const p2WasHit = matrix![1][0]; // grab should miss
    expect(p1WasHit).toBeDefined();
    expect(p2WasHit).toBeUndefined();
});
