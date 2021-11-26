import { AIInput } from "./ai";
import { Character } from "./character";
import { CharacterTemplate } from "./charaterTemplate";
import { fdata1 } from "./testdata";

type Dictionary = { [key: string]: any };

test('reset changes all character properties except functions and ctor inputs', () => {
    const flaggedProperty = 4298;
    const template = new CharacterTemplate([], [], fdata1, "Name");
    const character = new Character(template, AIInput, true) as Character & Dictionary;
    for (let propertyName in character)
        if (!["assets", "controlSource"].includes(propertyName) && typeof character[propertyName] !== 'function')
            character[propertyName] = flaggedProperty; // dirty up the model

    character.reset(true);

    for (let propertyName in character)
        if (!["assets", "controlSource"].includes(propertyName) && typeof character[propertyName] !== 'function')
            expect(character[propertyName]).not.toBe(flaggedProperty);
});

test('reset changes all character properties except functions and ctor inputs -- if a new prop was forgotten...', () => {
    const flaggedProperty = 4298;
    const template = new CharacterTemplate([], [], fdata1, "Name");
    const character = new Character(template, AIInput, true) as Character & Dictionary;
    character.someNewlyAddedProperty = 255;
    for (let propertyName in character)
        if (!["assets", "controlSource"].includes(propertyName) && typeof character[propertyName] !== 'function')
            character[propertyName] = flaggedProperty; // dirty up the model

    character.reset(true);

    expect(character["someNewlyAddedProperty"]).toBe(flaggedProperty);
    for (let propertyName in character)
        if (!["assets", "controlSource", "someNewlyAddedProperty"].includes(propertyName) && typeof character[propertyName] !== 'function')
            expect(character[propertyName]).not.toBe(flaggedProperty);
});
