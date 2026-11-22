// shots.js — staged frames for the entry's screenshots. Each shot builds a
// fixed, hand-written game state and renders it once, so the screenshots
// are deterministic captures of the game's own code: ?shot=title, play,
// win or loss. A `seed` query parameter is accepted and ignored; the
// states are fixed by hand, not drawn from a random seed.

import { makeCard } from './deck.js';

function duelist(life, mana, score, tricks, damage, hand) {
  return {
    life,
    mana,
    manaBonus: 0,
    deck: [],
    hand,
    score,
    roundsWon: tricks,
    damageDealt: damage,
    elementsPlayed: { ember: 4, gale: 2, stone: 1, tide: 3 },
  };
}

function midHand() {
  return [
    makeCard({ kind: 'strike', element: 'ember', value: 9, cost: 4, name: 'Ember Cataclysm' }),
    makeCard({ kind: 'strike', element: 'tide', value: 5, cost: 2, name: 'Tide Lash' }),
    makeCard({ kind: 'guard', element: 'stone', value: 0, cost: 2, name: 'Stonewall' }),
    makeCard({ kind: 'strike', element: 'gale', value: 7, cost: 3, name: 'Gale Crash' }),
    makeCard({ kind: 'mend', element: 'tide', value: 0, cost: 3, name: 'Spring Mend' }),
    makeCard({ kind: 'surge', element: 'ember', value: 4, cost: 3, name: 'Ember Surge' }),
  ];
}

function aiHand() {
  return [
    makeCard({ kind: 'strike', element: 'ember', value: 3, cost: 1, name: 'Ember Spark' }),
    makeCard({ kind: 'strike', element: 'tide', value: 7, cost: 3, name: 'Tide Crash' }),
    makeCard({ kind: 'strike', element: 'stone', value: 5, cost: 2, name: 'Stone Lash' }),
    makeCard({ kind: 'guard', element: 'stone', value: 0, cost: 2, name: 'Stonewall' }),
    makeCard({ kind: 'strike', element: 'gale', value: 3, cost: 1, name: 'Gale Spark' }),
  ];
}

export function stageShot(game, name) {
  if (name === 'title') {
    game.toTitle();
    return true;
  }
  if (name === 'play') {
    game.player = duelist(14, 6, 42, 4, 26, midHand());
    game.ai = duelist(11, 5, 35, 3, 18, aiHand());
    game.round = 7;
    game.state = 'reveal';
    game.selected = -1;
    game.reveal = {
      player: makeCard({ kind: 'strike', element: 'ember', value: 9, cost: 4, name: 'Ember Cataclysm' }),
      ai: makeCard({ kind: 'strike', element: 'gale', value: 5, cost: 2, name: 'Gale Lash' }),
    };
    game.revealTimer = 0;
    game.message = 'Ember burns Gale — you take the trick, 13 damage.';
    game.messageKind = 'good';
    return true;
  }
  if (name === 'win') {
    game.player = duelist(9, 4, 87, 8, 41, midHand().slice(0, 4));
    game.ai = duelist(0, 3, 52, 5, 22, aiHand().slice(0, 3));
    game.round = 13;
    game.state = 'win';
    game.selected = -1;
    game.reveal = {
      player: makeCard({ kind: 'strike', element: 'gale', value: 9, cost: 4, name: 'Gale Cataclysm' }),
      ai: makeCard({ kind: 'strike', element: 'stone', value: 3, cost: 1, name: 'Stone Spark' }),
    };
    game.message = 'The champion falls. The Court is yours.';
    game.messageKind = 'good';
    return true;
  }
  if (name === 'loss') {
    game.player = duelist(0, 2, 38, 3, 19, midHand().slice(0, 3));
    game.ai = duelist(6, 5, 74, 7, 33, aiHand().slice(0, 4));
    game.round = 11;
    game.state = 'loss';
    game.selected = -1;
    game.reveal = {
      player: makeCard({ kind: 'strike', element: 'tide', value: 5, cost: 2, name: 'Tide Lash' }),
      ai: makeCard({ kind: 'strike', element: 'ember', value: 9, cost: 4, name: 'Ember Cataclysm' }),
    };
    game.message = 'Your life runs out. The Court keeps its crown.';
    game.messageKind = 'bad';
    return true;
  }
  return false;
}
