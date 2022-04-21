import { hasAll } from "./util";
import { halfmillion, Hitbox, HitboxProperties, million } from "../interfaces/interfaces";
import { IColor } from "../interfaces/IPlatform";

const ratioPPMto255 = 256 / million;
const ratioPPMto0_1 = 1 / million;
export let PPMtoPixels = 1000 / million;

export class PlatformNodeJs {
    private unknownHitboxColor: IColor = { R: million, G: million, B: million };
    private hitboxColors = new Map<HitboxProperties, IColor>([
        [HitboxProperties.Strike, { R: million, G: 0, B: 0 }],
        [HitboxProperties.Grab, { R: million, G: million, B: 0 }],
        [HitboxProperties.Hurtbox, { R: 0, G: 0, B: million }],
    ]);

    getHitboxProps = (box: Hitbox) => {
        const as = hasAll(box.props, HitboxProperties.Strike) ? HitboxProperties.Strike
            : hasAll(box.props, HitboxProperties.Grab) ? HitboxProperties.Grab
                : hasAll(box.props, HitboxProperties.Hurtbox) ? HitboxProperties.Hurtbox
                    : HitboxProperties.Pushbox;
        const borderColor = this.hitboxColors.get(as) || this.unknownHitboxColor;
        const backgroundColor = { ...(this.hitboxColors.get(as) || this.unknownHitboxColor) };
        backgroundColor.A = halfmillion;
        return { as, borderColor, backgroundColor };
    }

    drawHitbox = (box: Hitbox): string => {
        const as = hasAll(box.props, HitboxProperties.Strike) ? HitboxProperties.Strike
            : hasAll(box.props, HitboxProperties.Grab) ? HitboxProperties.Grab
                : hasAll(box.props, HitboxProperties.Hurtbox) ? HitboxProperties.Hurtbox
                    : HitboxProperties.Pushbox;
        const borderColor = this.hitboxColors.get(as) || this.unknownHitboxColor;
        const backgroundColor = { ...(this.hitboxColors.get(as) || this.unknownHitboxColor) };
        backgroundColor.A = halfmillion;

        const sprite = `
            <div title=${asPropertyList(box.props)} style="position:absolute;
                top:${box.y * PPMtoPixels}px;       left:${box.x * PPMtoPixels}px;
                width:${box.wide * PPMtoPixels}px;  height:${box.tall * PPMtoPixels}px;
                background-color:${asHexValue(backgroundColor)}; border: 1px solid ${asHexValue(borderColor)};
            "></div>`;

        return sprite;
    }

}

export function asHexValue(color: IColor): string {
    const rgb = color.R * ratioPPMto255 + ',' + color.G * ratioPPMto255 + ',' + color.B * ratioPPMto255;
    return color.A ? "rgba(" + rgb + "," + color.A * ratioPPMto0_1 + ")" : "rgb(" + rgb + ")";
}

export function asPropertyList(props: HitboxProperties): string {
    let retval = "";
    for (let teaser = 1 as HitboxProperties; teaser <= props; teaser <<= 1)
        if ((props & teaser) !== 0)
            retval += HitboxProperties[teaser] + ' ';
    return retval;
}