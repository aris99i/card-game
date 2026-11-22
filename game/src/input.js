// input.js — mouse and keyboard for Court of Embers. Clicking a card
// selects it, clicking the gold button (or Enter) commits it; keys 1-7
// select from the hand, M mutes, R restarts from an end screen. The canvas
// scales to the window, so clicks are mapped back to game coordinates.

export function attachInput(canvas, game, audio) {
  function toGameCoords(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function inside(point, box) {
    return box && point.x >= box.x && point.x <= box.x + box.w
      && point.y >= box.y && point.y <= box.y + box.h;
  }

  canvas.addEventListener('click', (event) => {
    const point = toGameCoords(event);
    audio.unlock();
    if (game.state === 'title') {
      if (inside(point, game._hits.startButton)) {
        audio.play('start');
        game.startDuel();
      }
      return;
    }
    if (game.state === 'win' || game.state === 'loss') {
      if (inside(point, game._hits.restartButton)) {
        audio.play('start');
        game.startDuel();
      }
      return;
    }
    if (game.state === 'play') {
      if (inside(point, game._hits.playButton)) {
        if (game.commitCard()) audio.play('play');
        return;
      }
      for (const hit of game._hits.cards) {
        if (inside(point, hit)) {
          game.selected = game.selected === hit.index ? -1 : hit.index;
          audio.play('select');
          return;
        }
      }
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key;
    if (key === 'm' || key === 'M') {
      audio.toggleMute();
      return;
    }
    if (game.state === 'title') {
      if (key === 'Enter' || key === ' ') {
        audio.unlock();
        audio.play('start');
        game.startDuel();
      }
      return;
    }
    if (game.state === 'win' || game.state === 'loss') {
      if (key === 'r' || key === 'R' || key === 'Enter') {
        audio.play('start');
        game.startDuel();
      }
      return;
    }
    if (game.state === 'play') {
      if (key >= '1' && key <= '7') {
        const index = Number(key) - 1;
        if (index < game.player.hand.length) {
          game.selected = game.selected === index ? -1 : index;
          audio.play('select');
        }
      } else if (key === 'Enter' || key === ' ') {
        if (game.commitCard()) audio.play('play');
      } else if (key === 'Escape') {
        game.selected = -1;
      }
    } else if (game.state === 'reveal') {
      if (key === 'r' || key === 'R') {
        game.startDuel();
      }
    }
  });
}
