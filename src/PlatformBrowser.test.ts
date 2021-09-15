import { IColor } from "./IPlatform";
import { asHexValue } from "./PlatformBrowser";

test('asHexValue creates valid RGB for browser', () => {
    const color: IColor = { R: 0.5, G: 0, B: 0.5 };
    expect(asHexValue(color)).toBe("rgb(128,0,128)");
});

test('asHexValue creates valid RGBA for browser', () => {
    const color: IColor = { R: 0.5, G: 0, B: 0.5, A: 0.5 };
    expect(asHexValue(color)).toBe("rgba(128,0,128,128)");
});
