import { rectanglesIntersect } from "./collision.js";
import { Hitbox, HitboxProperties } from "./Interfaces.js";

console.log("hello world");



const attack: Hitbox = { x: 50, y: 0, tall: 30, wide: 20, props: HitboxProperties.Strike };
const target: Hitbox = { x: 50, y: 0, tall: 30, wide: 20, props: HitboxProperties.Hurtbox };
console.log(rectanglesIntersect(attack, target));

export { };