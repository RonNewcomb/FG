import { IColor } from "../interfaces/IPlatform";
import { asHexValue } from "../game/PlatformBrowser";

test('asHexValue creates valid RGB for browser', () => {
    const color: IColor = { R: 500000, G: 0, B: 500000 };
    expect(asHexValue(color)).toBe("rgb(128,0,128)");
});

test('asHexValue creates valid RGBA for browser', () => {
    const color: IColor = { R: 500000, G: 0, B: 500000, A: 500000 };
    expect(asHexValue(color)).toBe("rgba(128,0,128,0.5)");
});
