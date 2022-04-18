## Setup

Needs IIS app "FG" pointed to /built folder. For it, IIS "Mime Types" need to have the extension "." (just a period) as `application/javascript` because we aren't using a module loader, and typescript doesn't add .js to import statements.

The NPM scripts in package.json (visible in VSCode) do the rest. Typescript compiles to /built folder. NPM script "copy" moves `index.html` and removes .js extensions. Browser follows import statements from there.

Go to http://localhost/fg/ for the game or http://localhost/fg/balance/matchup.html for the post-build move matchup charts.

## Balancing

Think about rollback netcode.

- requires re-running the game for several frames within one frame.
- Re-running shouldn't affect or ask for I/O
- effectively a pure computation on gamepad inputs

✔️ Stick into nested loops to generate which move beats/trades with which other move for the whole moveset, for every possible frame advantage/disadvantage, for every possible range.

✔️ Create probability table for which move to use when. Perfect information is missing because all info on which move opposes you is 15 frames stale, hence, it is a probability because the exact spacing, timing, or what move the opponent is doing at that moment can't realistically be perceived.

📝 Create decision tree from probability table. This is now the AI for that side of the matchup for that character vs that other character.

📝 Distill matchup ratio from above.

📝 Repeat for all matchups in the game, creating complete matchup chart & tier list.

📝 Now rebalance, and repeat the process.

📝 Use Inspector tool on the decision trees to see probabilities of success at every step of the match to inform balancing patch.
