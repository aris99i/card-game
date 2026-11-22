// config.js — the tuning of Court of Embers: table size, the four elements,
// the card catalogue and the numbers behind a round. Nothing here knows how
// to draw or how to take input; it only names the rules.

export const TABLE = { width: 1280, height: 800 };

// The four elements, in the order of the wheel. Each one beats the next:
// Ember burns Gale, Gale wears Stone, Stone dams Tide, Tide drowns Ember.
export const ELEMENTS = {
  ember: { name: 'Ember', color: '#e4572e', dark: '#8f2f16', glyph: 'flame', beats: 'gale' },
  gale: { name: 'Gale', color: '#7fb069', dark: '#3f6132', glyph: 'leaf', beats: 'stone' },
  stone: { name: 'Stone', color: '#c9a227', dark: '#7a5f10', glyph: 'peak', beats: 'tide' },
  tide: { name: 'Tide', color: '#3e7cb1', dark: '#1f4568', glyph: 'drop', beats: 'ember' },
};

export const ELEMENT_ORDER = ['ember', 'gale', 'stone', 'tide'];

// A strike's mana cost follows its attack: 3 costs 1, 5 costs 2, 7 costs 3,
// 9 costs 4. Guard and Mend are priced so they are a real decision.
export const CARD_KINDS = {
  strike: { label: 'Strike' },
  guard: { label: 'Guard', cost: 2, text: 'Block all damage this round. +2 mana next round.' },
  mend: { label: 'Mend', cost: 3, text: 'Heal 5 life.' },
  surge: { label: 'Surge', cost: 3, text: 'Attack 4. Win the round: draw a card, +2 mana next round.' },
};

// One copy of each strike per element, plus the tricks. Two identical
// 24-card decks are built from this list, one for each duelist.
export const DECK_LIST = (() => {
  const strikes = [
    { value: 3, name: 'Spark' },
    { value: 5, name: 'Lash' },
    { value: 7, name: 'Crash' },
    { value: 9, name: 'Cataclysm' },
  ];
  const list = [];
  for (const element of ELEMENT_ORDER) {
    for (const s of strikes) {
      list.push({
        kind: 'strike',
        element,
        value: s.value,
        cost: s.value === 3 ? 1 : s.value === 5 ? 2 : s.value === 7 ? 3 : 4,
        name: `${ELEMENTS[element].name} ${s.name}`,
      });
    }
  }
  list.push(
    { kind: 'guard', element: 'stone', value: 0, cost: 2, name: 'Stonewall' },
    { kind: 'guard', element: 'stone', value: 0, cost: 2, name: 'Stonewall' },
    { kind: 'guard', element: 'tide', value: 0, cost: 2, name: 'Stillwater' },
    { kind: 'mend', element: 'tide', value: 0, cost: 3, name: 'Spring Mend' },
    { kind: 'mend', element: 'gale', value: 0, cost: 3, name: 'Meadow Mend' },
    { kind: 'mend', element: 'ember', value: 0, cost: 3, name: 'Hearth Mend' },
    { kind: 'surge', element: 'ember', value: 4, cost: 3, name: 'Ember Surge' },
    { kind: 'surge', element: 'gale', value: 4, cost: 3, name: 'Gale Surge' },
  );
  return list;
})();

export const RULES = {
  startLife: 20,
  startHand: 5,
  maxHand: 7,
  maxRounds: 20,
  manaBase: 3,
  manaPerRound: 1,
  manaCap: 8,
  guardManaBonus: 2,
  surgeManaBonus: 2,
  mendHeal: 5,
  tieDamage: 1,
  sparkValue: 2,
};
