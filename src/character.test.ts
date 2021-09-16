import { Character } from "./character";
import { fdata1 } from "./testdata";

type Dictionary = { [key: string]: any };

test('reset changes all character properties except functions and ctor inputs', () => {
    const flaggedProperty = 4298;
    const character = new Character([], [], fdata1, "Name") as Character & Dictionary;
    for (let propertyName in character)
        if (!["models", "soundBites", "fdata", "name"].includes(propertyName) && typeof character[propertyName] !== 'function')
            character[propertyName] = flaggedProperty; // dirty up the model

    character.reset(true);

    for (let propertyName in character)
        if (!["models", "soundBites", "fdata", "name"].includes(propertyName) && typeof character[propertyName] !== 'function')
            expect(character[propertyName]).not.toBe(flaggedProperty);
});

test('reset changes all character properties except functions and ctor inputs -- if a new prop was forgotten...', () => {
    const flaggedProperty = 4298;
    const character = new Character([], [], fdata1, "Name") as Character & Dictionary;
    character.someNewlyAddedProperty = 255;
    for (let propertyName in character)
        if (!["models", "soundBites", "fdata", "name"].includes(propertyName) && typeof character[propertyName] !== 'function')
            character[propertyName] = flaggedProperty; // dirty up the model

    character.reset(true);

    expect(character["someNewlyAddedProperty"]).toBe(flaggedProperty);
    for (let propertyName in character)
        if (!["models", "soundBites", "fdata", "name", "someNewlyAddedProperty"].includes(propertyName) && typeof character[propertyName] !== 'function')
            expect(character[propertyName]).not.toBe(flaggedProperty);
});
