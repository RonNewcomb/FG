import { IPlatform } from "./IPlatform";
import { Hitbox } from "./interfaces";
import { fdata1 } from "./testdata";

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
    loadAsset = jest.fn((...args) => Promise.resolve({}));
}

test('#/hitboxsets should never be 0 because it implies a 0-frame move', () => {
    for (let move of fdata1.moves) {
        expect(move.hitboxes).not.toBeNull();
        expect(move.hitboxes.length).toBeGreaterThan(0);
    }
});

test('#/hitboxsets should be at least as big as #/moveeffects', () => {
    for (let move of fdata1.moves) {
        expect(move.hitboxes).not.toBeNull();
        expect(move.hitboxes.length).toBeGreaterThanOrEqual(move.effects?.length ?? 0);
    }
});
