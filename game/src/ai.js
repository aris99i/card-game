// ai.js — the Ember Court champion. It watches what the player keeps
// playing and answers it: it favours the element that beats the player's
// most-played one, guards or mends when its life runs low, and spends a
// Surge when it holds a heavy strike behind it. Every choice is readable
// from the table, so the player can counter it back.

import { ELEMENTS } from './config.js';

function strikes(cards) {
  return cards.filter((c) => c.kind === 'strike');
}

function ofKind(cards, kind) {
  return cards.filter((c) => c.kind === kind);
}

function mostPlayedElement(counts) {
  let best = null;
  let bestCount = 0;
  for (const [element, count] of Object.entries(counts)) {
    if (count > bestCount) {
      best = element;
      bestCount = count;
    }
  }
  return best;
}

// Pick the champion's card for this round. `seen` is what it knows:
// the player's element counts, the champion's life and the round.
export function chooseCard(hand, mana, seen) {
  const playable = hand.filter((c) => c.cost <= mana);
  if (playable.length === 0) return null;

  const roll = Math.random();

  // Low life: survival first. A Mend below 6 life, a Guard below 8.
  const mends = ofKind(playable, 'mend');
  const guards = ofKind(playable, 'guard');
  if (seen.aiLife <= 5 && mends.length > 0 && roll < 0.7) return mends[0];
  if (seen.aiLife <= 8 && guards.length > 0 && roll < 0.6) return guards[0];

  // A Surge is worth it when a heavy strike waits behind it.
  const surges = ofKind(playable, 'surge');
  const heavy = strikes(playable).some((c) => c.value >= 7);
  if (surges.length > 0 && heavy && roll < 0.5) return surges[0];

  // Counter the player's habit: beat their most-played element.
  const favourite = mostPlayedElement(seen.playerElements);
  if (favourite) {
    const counter = strikes(playable).filter(
      (c) => ELEMENTS[c.element].beats === favourite,
    );
    if (counter.length > 0 && roll < 0.75) {
      counter.sort((a, b) => b.value - a.value);
      return counter[0];
    }
  }

  // Otherwise the heaviest strike it can afford.
  const ordered = strikes(playable).sort((a, b) => b.value - a.value);
  if (ordered.length > 0) return ordered[0];

  // Only tricks left: spend one at random.
  return playable[Math.floor(Math.random() * playable.length)];
}
