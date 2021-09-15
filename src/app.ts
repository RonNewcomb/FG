import { rectanglesIntersect } from "./collision";
import { Hitbox, HitboxProperties } from "./interfaces";
import { IPlatform } from "./IPlatform";
import { PlatformBrowser } from "./PlatformBrowser";

console.log("hello world");

const platformApi: IPlatform = new PlatformBrowser();

const attack: Hitbox = { x: 50, y: 0, tall: 30, wide: 20, props: HitboxProperties.Strike };
const target: Hitbox = { x: 50, y: 0, tall: 30, wide: 20, props: HitboxProperties.Hurtbox };
console.log(rectanglesIntersect(attack, target));

platformApi.drawHitbox(attack, { R: 1.0, G: 0, B: 0 });
platformApi.drawHitbox(target, { R: 0, G: 0, B: 1 });


export { };