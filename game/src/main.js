// main.js — the entry point of Court of Embers in the browser. It wires
// the state machine, the renderer, input and audio together, runs the
// frame loop, and stages a screenshot state when the page is opened with
// ?shot=title|play|win|loss. The game object is left on window.__game so
// a test can drive it and read it back.

import { TABLE } from './config.js';
import { createGame } from './state.js';
import { render } from './render.js';
import { attachInput } from './input.js';
import { createAudio } from './audio.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const game = createGame();
const audio = createAudio();

attachInput(canvas, game, audio);

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  stageShot(game, shot);
}

let last = performance.now();

function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;

  if (game.state === 'reveal') {
    game.revealTimer += dt;
    if (game.revealTimer > 1.6) {
      game.resolveRound();
      if (game.state === 'win') audio.play('win');
      if (game.state === 'loss') audio.play('lose');
    }
  }

  render(ctx, game);
  requestAnimationFrame(frame);
}

window.__game = game;
window.__game.audio = audio;
window.__game.table = TABLE;

requestAnimationFrame(frame);
