// main.ts — Court of Embers, the entry program (Node 22, standard library
// only). The grader runs it twice in a fresh container with no network:
// it copies the playable game and the screenshots into the output
// directory and writes dossier.json there, using the vendored make.fun
// dossier library. The game itself is static files a desktop browser
// loads offline; this file only hands it in.
//
// To reproduce the hand-in locally, run:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
// The dossier library lives beside the entry, vendored from the kit.
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The gate's own caps, as the competition's RULES.txt states them: a
// dossier text of at most 160 KiB, at most 4 screenshots of 256 KiB each,
// a game/ of at most 993 files and 48 MiB, paths at most 1000 bytes.
const TEXT_CAP = 163840;
const SHOT_CAP = { max: 4, max_bytes: 262144 };
const GAME_FILE_CAP = 993;
const GAME_BYTE_CAP = 50331648;
const GAME_PATH_CAP = 1000;

function copyDir(source, target) {
  mkdirSync(target, { recursive: true });
  cpSync(source, target, { recursive: true });
}

mkdirSync(outputDir, { recursive: true });

const gameDir = join(repoRoot, 'game');
if (!existsSync(join(gameDir, 'index.html'))) {
  throw new Error('game/index.html is missing, so there is no game to hand in');
}
copyDir(gameDir, join(outputDir, 'game'));

const shotsDir = join(repoRoot, 'screenshots');
if (existsSync(shotsDir)) {
  copyDir(shotsDir, join(outputDir, 'screenshots'));
}

const dossierText = buildDossier(outputDir, {
  text_max_bytes: TEXT_CAP,
  screenshots: SHOT_CAP,
  game_max_files: GAME_FILE_CAP,
  game_max_bytes: GAME_BYTE_CAP,
  game_path_max_bytes: GAME_PATH_CAP,
});
writeFileSync(join(outputDir, 'dossier.json'), dossierText);
