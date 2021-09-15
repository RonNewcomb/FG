import { CharacterMove, Connection, frameCount, Hitbox, HitboxProperties, HitboxSet } from "./Interfaces";

// frameCount MUST be within the move's duration
export function hits(attack: CharacterMove, attackFrame: frameCount, target: CharacterMove, targetFrame: frameCount): Connection | null {
    const attackBoxes: HitboxSet = attack.hitboxes[attackFrame - 1];
    const targetBoxes: HitboxSet = target.hitboxes[targetFrame - 1];
    return checkBoxes(attackBoxes, targetBoxes);
}

const hasAll = (box: Hitbox, property: HitboxProperties) => (box.props & property) === property;
const hasAny = (box: Hitbox, property: HitboxProperties) => (box.props & property) !== 0;
const hasNone = (box: Hitbox, property: HitboxProperties) => (box.props & property) === 0;

// nested loops instead of .filter(lambda) are ugly but more efficient - no space allocation except return value
export function checkBoxes(attackBoxes: Hitbox[], targetBoxes: Hitbox[]): Connection | null {

    // check strike -> target
    for (let attack of attackBoxes)
        if (attack.props & HitboxProperties.Strike)
            for (let target of targetBoxes)
                if (target.props & HitboxProperties.Hurtbox && !(target.props & HitboxProperties.ImmuneStrike))
                    if (rectanglesIntersect(attack, target))
                        return [attack, target, HitboxProperties.Strike];

    // check grab -> target
    for (let attack of attackBoxes)
        if (attack.props & HitboxProperties.Grab)
            for (let target of targetBoxes)
                if (target.props & HitboxProperties.Hurtbox && !(target.props & HitboxProperties.ImmuneGrab))
                    if (rectanglesIntersect(attack, target))
                        return [attack, target, HitboxProperties.Grab];

    // check projectile-strike -> target
    for (let attack of attackBoxes)
        if (attack.props & HitboxProperties.Projectile)
            for (let target of targetBoxes)
                if (target.props & HitboxProperties.Hurtbox && !(target.props & HitboxProperties.ImmuneProjectile))
                    if (rectanglesIntersect(attack, target))
                        return [attack, target, HitboxProperties.Projectile];

    // check counter -> strike/projectile 
    for (let attack of attackBoxes)
        if (attack.props & HitboxProperties.Counter)
            for (let target of targetBoxes)
                if (target.props & HitboxProperties.Strike || target.props & HitboxProperties.Projectile)
                    if (rectanglesIntersect(attack, target))
                        return [attack, target, HitboxProperties.Counter];

    // check reflect -> projectile
    for (let attack of attackBoxes)
        if (attack.props & HitboxProperties.Reflect)
            for (let target of targetBoxes)
                if (target.props & HitboxProperties.Projectile)
                    if (rectanglesIntersect(attack, target))
                        return [attack, target, HitboxProperties.Reflect];

    return null;
}

export function rectanglesIntersect(attack: Hitbox, target: Hitbox): boolean {
    return attack.x <= target.x + target.wide && attack.x + attack.wide >= target.x
        && attack.y <= target.y + target.tall && attack.y + attack.wide >= target.y;
}
