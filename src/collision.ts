import { Connected, Hitbox, HitboxProperties, SystemMove } from "./interfaces";
import { Character } from "./character";

export function collisionDetection(characters: Character[]): void {
    // collision detection
    const hitboxes = characters.map(c => c.getCurrentBoxesInWorldCoordinates());

    //let collisions = hitboxes.map((attack, i) => hitboxes.map((target, j) => (i === j) ? null : checkBoxes(attack, target)));
    // reflect all projectiles
    // process all clean grabs
    //  cleanly-grabbed chars nulled out attack (even if they were countering a strike, they can't get anything from it this frame)
    // resolve simultaneous grabs, since they require either throw-tech or a cinematic

    let p1AttacksP2 = checkBoxes(hitboxes[0], hitboxes[1]);
    let p2AttacksP1 = checkBoxes(hitboxes[1], hitboxes[0]);
    if (p1AttacksP2 && p2AttacksP1) {
        // clash / trade / throwtech

        // if character successfully grabs someone who is also successfully grabbing someone, ignore the interaction
        // unless a third person was involved.
        const p1Grabbed = hasAll(p1AttacksP2[2], HitboxProperties.Grab);
        const p2Grabbed = hasAll(p2AttacksP1[2], HitboxProperties.Grab);
        if (p1Grabbed && p2Grabbed) {
            // throw tech, or just ignore
            p1AttacksP2 = null;
            p2AttacksP1 = null;
        } else if (p1Grabbed) {
            p2AttacksP1 = null;
        } else if (p2Grabbed) {
            p1AttacksP2 = null;
        }
    }
    if (p1AttacksP2) { characters[1].setCurrentMove(SystemMove.Hit); characters[0].comboCounter++; }
    if (p2AttacksP1) { characters[0].setCurrentMove(SystemMove.Hit); characters[1].comboCounter++; }
}

export const hasAll = (boxProp: HitboxProperties, properties: HitboxProperties) => (boxProp & properties) === properties;
export const hasAny = (boxProp: HitboxProperties, properties: HitboxProperties) => (boxProp & properties) !== 0;
export const hasNone = (boxProp: HitboxProperties, properties: HitboxProperties) => (boxProp & properties) === 0;

// nested loops instead of .filter(lambda) are ugly but more efficient - no space allocation except return value
export function checkBoxes(attackBoxes: Hitbox[], targetBoxes: Hitbox[]): Connected | null {

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

    return null;
}

export function rectanglesIntersect(attack: Hitbox, target: Hitbox): boolean {
    return attack.x <= target.x + target.wide && attack.x + attack.wide >= target.x
        && attack.y <= target.y + target.tall && attack.y + attack.wide >= target.y;
}
