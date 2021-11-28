import { Connected, Hitbox, HitboxProperties } from "../interfaces/interfaces";
import { Character } from "./character";
import { hasAll, hasAny, hasNone } from "./util";

export function collisionDetection(characters: Character[]): (Connected | undefined)[][] {
    const numCharacters = characters.length;
    const hitboxes = characters.map(character => character.getCurrentBoxesInWorldCoordinates());

    // reflect all projectiles
    // process all clean grabs
    //  cleanly-grabbed chars nulled out attack (even if they were countering a strike, they can't get anything from it this frame)
    // resolve simultaneous grabs, since they require either throw-tech or a cinematic

    const matrix: (Connected | undefined)[][] = [];
    hitboxes.forEach((attacker, j) => {
        hitboxes.forEach((victim, i) => {
            if (i !== j) {
                if (!matrix[i]) matrix[i] = [];
                matrix[i][j] = checkBoxes(attacker, victim);
            }
        })
    });

    // check for trades/clashes/throwtechs
    for (let i = 0; i < numCharacters; i++)
        for (let j = 0; j < numCharacters; j++)
            if (i !== j)
                if (matrix[i][j] && matrix[j][i]) {
                    let p1AttacksP2 = matrix[i][j];
                    let p2AttacksP1 = matrix[j][i];
                    if (p1AttacksP2 && p2AttacksP1) {
                        // clash / trade / throwtech

                        // if character successfully grabs someone who is also successfully grabbing someone, ignore the interaction
                        // unless a third person was involved.
                        const p1Grabbed = hasAll(p1AttacksP2[2], HitboxProperties.Grab);
                        const p2Grabbed = hasAll(p2AttacksP1[2], HitboxProperties.Grab);
                        if (p1Grabbed && p2Grabbed) {
                            // throw tech, or just ignore
                            matrix[i][j] = undefined;
                            matrix[j][i] = undefined;
                        } else if (p1Grabbed) {
                            matrix[j][i] = undefined;
                        } else if (p2Grabbed) {
                            matrix[i][j] = undefined;
                        }
                    }

                }

    return matrix;
}

// nested loops instead of .filter(lambda) are ugly but more efficient - no space allocation except return value
export function checkBoxes(attackBoxes: Hitbox[], targetBoxes: Hitbox[]): Connected | undefined {

    // check strike -> target
    for (let attack of attackBoxes)
        if ((attack.props & HitboxProperties.Strike) > 0)
            for (let target of targetBoxes)
                if (hasAll(target.props, HitboxProperties.Hurtbox) && hasNone(target.props, HitboxProperties.ImmuneStrike))
                    if (rectanglesIntersect(attack, target))
                        return [attack, target, HitboxProperties.Strike];

    // check grab -> target
    for (let attack of attackBoxes)
        if (attack.props & HitboxProperties.Grab)
            for (let target of targetBoxes)
                if (hasAll(target.props, HitboxProperties.Hurtbox) && hasNone(target.props, HitboxProperties.ImmuneGrab))
                    if (rectanglesIntersect(attack, target))
                        return [attack, target, HitboxProperties.Grab];

    // check projectile-strike -> target
    for (let attack of attackBoxes)
        if (attack.props & HitboxProperties.Projectile)
            for (let target of targetBoxes)
                if (hasAll(target.props, HitboxProperties.Hurtbox) && hasNone(target.props, HitboxProperties.ImmuneProjectile))
                    if (rectanglesIntersect(attack, target))
                        return [attack, target, HitboxProperties.Projectile];

    // check counter -> strike/projectile 
    for (let attack of attackBoxes)
        if (attack.props & HitboxProperties.Counter)
            for (let target of targetBoxes)
                if (hasAny(target.props, HitboxProperties.Strike | HitboxProperties.Projectile))
                    if (rectanglesIntersect(attack, target))
                        return [attack, target, HitboxProperties.Counter];

    // check reflect -> projectile
    for (let attack of attackBoxes)
        if (attack.props & HitboxProperties.Reflect)
            for (let target of targetBoxes)
                if (hasAll(target.props, HitboxProperties.Projectile))
                    if (rectanglesIntersect(attack, target))
                        return [attack, target, HitboxProperties.Reflect];

    return undefined;
}

export function rectanglesIntersect(attack: Hitbox, target: Hitbox): boolean {
    return attack.x <= target.x + target.wide && attack.x + attack.wide >= target.x
        && attack.y <= target.y + target.tall && attack.y + attack.wide >= target.y;
}
