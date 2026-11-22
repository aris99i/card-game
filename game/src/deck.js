// deck.js — builds a fresh 24-card deck from the catalogue, shuffles it and
// deals hands. Each duelist gets their own shuffled copy, so the two decks
// never run out in the same order.

import { DECK_LIST, RULES } from './config.js';

let nextCardId = 1;

export function makeCard(def) {
  return {
    id: nextCardId++,
    kind: def.kind,
    element: def.element,
    value: def.value,
    cost: def.cost,
    name: def.name,
  };
}

// The free fallback card: when a hand holds nothing affordable, a Spark
// joins it so a round can never stall.
export function makeSpark() {
  return {
    id: nextCardId++,
    kind: 'strike',
    element: 'ember',
    value: RULES.sparkValue,
    cost: 0,
    name: 'Ember Spark',
    free: true,
  };
}

export function buildDeck() {
  const deck = DECK_LIST.map(makeCard);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function drawCards(deck, hand, count) {
  for (let n = 0; n < count; n++) {
    if (hand.length >= RULES.maxHand) break;
    if (deck.length === 0) break;
    hand.push(deck.pop());
  }
}

export function affordable(hand, mana) {
  return hand.filter((card) => card.cost <= mana);
}
