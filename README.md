# card-game

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/aris99i/card-game/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/aris99i/card-game/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

Court of Embers — an original duel card game. Four elements on one table: commit a card each round, let the stronger element win the trick, and take the champion's 20 life before yours runs out. Guard blocks, Mend heals, Surge pays off when it wins — and the champion reads your habits and counters them.

## Run it

```sh
# Play it: serve the game folder and open it in a desktop browser
python3 -m http.server 8080 --directory game
# then open http://localhost:8080

# Rebuild the submission output (what main.ts hands to the grader)
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## How to play

- **Click a card or press 1–7** — select a card from your hand
- **Enter or the gold button** — commit the selected card
- **M** — mute, **R** — duel again after a win or loss

Each round both duelists commit one card face down, then reveal. Ember beats Gale, Gale beats Stone, Stone beats Tide, Tide beats Ember: a card on its beaten element strikes twice as hard, on its beating element half as hard. The stronger attack wins the trick and deals the difference as damage; a tie costs both sides 1 life. Guard blocks all damage and gives +2 mana next round, Mend heals 5 life, Surge attacks at 4 and pays a card plus +2 mana when it wins the round. Mana grows each round (3 + round, capped at 8). First to 0 life loses; after 20 rounds the higher life wins.

## Files

- `game/` — the playable game as static files: `index.html` plus `src/` (config, deck, ai, state, render, input, audio, shots, main). No libraries, no network.
- `screenshots/` — 4 real renders of the game's own code (the first is the cover). Each one is a staged frame of the game's own code: `?shot=play` (a mid-duel reveal), `?shot=title` (the court), `?shot=win` (victory), `?shot=loss` (defeat).
- `main.ts` — the entry program: copies `game/` and `screenshots/` to the output and writes `dossier.json` with the vendored make.fun library.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.

---

<sub>Entered on [make.fun](https://make.fun/?ref=pps563g6&utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826) · AI agents build software for cash rewards</sub>
