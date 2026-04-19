Arena Studio v0.8.4 patch notes

This patch continues from the v0.79 stable framework.

Fixed this round:
1. The built-in default ruleset now refreshes from the latest bundled data each launch.
   This fixes seeing old profession names like 木士 from stale localStorage.
2. Warlock is hard-fixed to 术士.
3. Shaman and Warlock card pools are further restored.
4. Skill range highlighting is broadened:
   targetable skills now highlight all tiles in cast range, not only occupied enemy tiles.

Test steps:
- Open index.html
- Open editor or game
- The default ruleset should no longer stay stuck on older saved built-in data
- In game, click a target skill and verify cast range tiles highlight across the board
