// main.ts — Court of Embers, the entry program (Node 22, standard library
// only). The grader runs it twice in a fresh container with no network:
// it copies the playable game and the screenshots into the output
// directory and writes dossier.json there, using the vendored make.fun
// dossier library. The game itself is static files a desktop browser
// loads offline; this file only hands it in.
//
// To reproduce the hand-in locally:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The gate's own caps, so a hand-in this program writes is one the sealed
// scorer accepts: at most 4 screenshots of 256 KiB each, a game/ of at
// most 993 files and 48 MiB, and a dossier text of at most 160 KiB.
const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

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

const dossierText = buildDossier(outputDir, CAPS);
writeFileSync(join(outputDir, 'dossier.json'), dossierText);
