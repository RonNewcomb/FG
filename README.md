## Balancing

Think about rollback netcode in a fighting game like Street Fighter V or Guilty Gear: Strive.

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

## Setup

Create IIS app "FG" pointed to /built folder. The NPM scripts in package.json (visible in VSCode) do the type-checking / testing / building / deploying.

Run the tests (use `npm run test`) to generate matchup info.

Go to http://localhost/fg/ for the game/demo and http://localhost/fg/balancer.html for matchup info.
