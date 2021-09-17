import { Connected, Hitbox, HitboxProperties } from "./interfaces";

export const hasAll = (box: Hitbox, property: HitboxProperties) => (box.props & property) === property;
export const hasAny = (box: Hitbox, property: HitboxProperties) => (box.props & property) !== 0;
export const hasNone = (box: Hitbox, property: HitboxProperties) => (box.props & property) === 0;

// nested loops instead of .filter(lambda) are ugly but more efficient - no space allocation except return value
export function checkBoxes(attackBoxes: Hitbox[], targetBoxes: Hitbox[]): Connected | null {

    // check strike -> target
    for (let attack of attackBoxes)
        if ((attack.props & HitboxProperties.Strike) > 0)
            for (let target of targetBoxes)
                if ((target.props & HitboxProperties.Hurtbox) > 0 && (target.props & HitboxProperties.ImmuneStrike) === 0)
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
