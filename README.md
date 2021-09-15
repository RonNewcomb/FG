Needs IIS app "FG" pointed to /built folder.

NPM scripts visible in VSCode do the rest. Note the copy of index.html once in built and once in src. Changes need copying over manually. Browser following import statements from there. Typescript compiles to /built folder.

## Balancing

Think about rollback netcode.

- requires re-running the game for several frames within one frame.
- Re-running shouldn't affect or ask for I/O
- effectively a pure computation

Stick into nested loops to generate which move beats/trades with which other move for the whole moveset, for every possible frame advantage/disadvantage, for every possible range.

Create probability table for which move to use when. Perfect information is missing because all info on which move opposes you is 15 frames stale.

Create decision tree from probability table. This is now the AI for that side of the matchup for that character vs that other character.

Distill matchup ratio from above.

Repeat for all matchups in the game, creating complete matchup chart & tier list.

Now rebalance, and repeat the process.

Use Inspector tool on the decision trees to see probabilities of success at every step of the match to inform balancing patch.
