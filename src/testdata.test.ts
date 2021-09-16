import { IPlatform } from "./IPlatform";
import { Hitbox } from "./interfaces";

// a cheeky place for useful testiong mocks etc.

export class MockPlatform implements IPlatform {
    init = jest.fn((): IPlatform => this);
    end = jest.fn((): IPlatform => this);
    newFrame = jest.fn((): number => 1);
    drawHitbox = jest.fn((box: Hitbox): void => void 0);
    renderText = jest.fn((x: number, y: number, str: string): void => void 0);
    playAudio = jest.fn((clip: object): object => ({}));
    stopAudio = jest.fn((handle: object): boolean => true);
    renderModel = jest.fn((model: object, location: object, orientation: object): void => void 0);
    readInput = jest.fn((device: object): object => ({}));
}

test('required by jest', () => void 0);