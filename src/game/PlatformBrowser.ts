import { hasAll } from "./collision";
import { frameCount, halfmillion, Hitbox, HitboxProperties, million } from "../interfaces/interfaces";
import { AssetType, IAsset, IColor, IPlatform } from "../interfaces/IPlatform";

document.body.innerHTML = `
<div id=framebuffer1 class=framebuffer>
</div>
<div id=framebuffer2 class=framebuffer>
</div>
<style>
  .framebuffer {
      position: absolute;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      display: none;
  }
  .sprite {
      position: absolute;
  }
</style>`;
document.body.setAttribute('style', "background-color: lightgray; color: white");

const ratioPPMto255 = 256 / million;
const ratioPPMto0_1 = 1 / million;
let tall = 0;
let wide = 0;
let PPMtoPixels = 0;
let FrameCount: frameCount = 1;
const framebuffer1 = document.getElementById('framebuffer1')!;
const framebuffer2 = document.getElementById('framebuffer2')!;
let incompleteFrame = framebuffer2;
let visibleFrame = framebuffer1;
visibleFrame.style.display = 'block'; // override class

export class PlatformBrowser implements IPlatform {
    init(): IPlatform {
        tall = document.body.clientHeight;
        wide = document.body.clientWidth;
        const smaller = Math.min(tall, wide);
        PPMtoPixels = smaller / million;
        console.log('tall', tall, 'wide', wide, 'ppm2pixels', PPMtoPixels);
        return this;
    }

    end(): IPlatform {
        this.newFrame = () => 0;
        document.body.innerHTML = "Thank you for playing";
        return this;
    }

    newFrame(): frameCount {
        let swap = incompleteFrame;
        incompleteFrame = visibleFrame;
        visibleFrame = swap;

        visibleFrame.style.display = 'block';
        incompleteFrame.style.display = 'none';
        incompleteFrame.innerHTML = '';

        return ++FrameCount;
    }

    private unknownHitboxColor: IColor = { R: million, G: million, B: million };
    private hitboxColors = new Map<HitboxProperties, IColor>([
        [HitboxProperties.Strike, { R: million, G: 0, B: 0 }],
        [HitboxProperties.Grab, { R: million, G: million, B: 0 }],
        [HitboxProperties.Hurtbox, { R: 0, G: 0, B: million }],
    ]);

    drawHitbox(box: Hitbox): void {
        const sprite = document.createElement('div');
        sprite.style.position = 'absolute';
        sprite.style.top = box.y * PPMtoPixels + 'px';
        sprite.style.left = box.x * PPMtoPixels + 'px';
        sprite.style.width = box.wide * PPMtoPixels + 'px';
        sprite.style.height = box.tall * PPMtoPixels + 'px';
        const as = hasAll(box.props, HitboxProperties.Strike) ? HitboxProperties.Strike
            : hasAll(box.props, HitboxProperties.Grab) ? HitboxProperties.Grab
                : hasAll(box.props, HitboxProperties.Hurtbox) ? HitboxProperties.Hurtbox
                    : HitboxProperties.Pushbox;
        let color = this.hitboxColors.get(as) || this.unknownHitboxColor;
        color.A = halfmillion;
        sprite.style.backgroundColor = asHexValue(color);
        color.A = undefined;
        sprite.style.border = '1px solid ' + asHexValue(color);
        incompleteFrame.appendChild(sprite);
    }

    renderText(x: number, y: number, str: string): void {
        const label = document.createElement("span");
        label.innerText = str;
        label.style.position = 'absolute';
        label.style.left = x * PPMtoPixels + 'px';
        label.style.top = y * PPMtoPixels + 'px';
        label.style.fontSize = 'xx-large';
        label.style.fontWeight = '600';
        label.style.webkitTextStroke = '1px black';
        incompleteFrame.appendChild(label);
    }

    playAudio(clip: object): object {
        throw new Error("Method not implemented.");
    }

    stopAudio(handle: object): boolean {
        throw new Error("Method not implemented.");
    }

    renderModel(model: object, location: object, orientation: object): void {
        throw new Error("Method not implemented.");
    }

    readInput(device: object): object {
        throw new Error("Method not implemented.");
    }

    async loadAsset(type: AssetType, name: string): Promise<IAsset> {
        return {} as IAsset;
    }
}

export function asHexValue(color: IColor): string {
    const rgb = color.R * ratioPPMto255 + ',' + color.G * ratioPPMto255 + ',' + color.B * ratioPPMto255;
    return color.A ? "rgba(" + rgb + "," + color.A * ratioPPMto0_1 + ")" : "rgb(" + rgb + ")";
}
