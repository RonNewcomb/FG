import { frameCount, Hitbox } from "./interfaces";
import { IColor, IPlatform } from "./IPlatform";

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

let FrameCount: frameCount = 1;
const framebuffer1 = document.getElementById('framebuffer1')!;
const framebuffer2 = document.getElementById('framebuffer2')!;
let incompleteFrame = framebuffer2;
let visibleFrame = framebuffer1;
visibleFrame.style.display = 'block'; // override class

export function asHexValue(color: IColor): string {
    const rgb = color.R * 256 + ',' + color.G * 256 + ',' + color.B * 256;
    return color.A ? "rgba(" + rgb + "," + color.A * 256 + ")" : "rgb(" + rgb + ")";
}

export class PlatformBrowser implements IPlatform {
    newFrame(): frameCount {
        let swap = incompleteFrame;
        incompleteFrame = visibleFrame;
        visibleFrame = swap;

        visibleFrame.style.display = 'block';
        incompleteFrame.style.display = 'none';
        incompleteFrame.innerHTML = '';

        return ++FrameCount;
    }

    drawHitbox(box: Hitbox, color: IColor): void {
        const sprite = document.createElement('div');
        sprite.style.top = (box.y + box.tall) + 'px';
        sprite.style.left = box.x + 'px';
        sprite.style.width = box.wide + 'px';
        sprite.style.height = box.tall + 'px';
        color.A = 0.25;
        sprite.style.backgroundColor = asHexValue(color);
        color.A = undefined;
        sprite.style.borderColor = asHexValue(color);
        sprite.style.borderWidth = '1px';
        incompleteFrame.appendChild(sprite);
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

}