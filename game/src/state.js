// state.js — the duel itself: hands, life, mana, rounds and the reveal.
// One round is a simultaneous commit: the player picks a card, the
// champion picks one blind, both turn face up and the stronger element
// wins the trick. Damage is the gap between the two attacks; a tie costs
// each side 1 life. Guard blocks, Mend heals, Surge pays off next round.

import { RULES, ELEMENTS } from './config.js';
import { buildDeck, drawCards, makeSpark, affordable } from './deck.js';
import { chooseCard } from './ai.js';

export function manaForRound(round, bonus) {
  return Math.min(RULES.manaBase + (round - 1) * RULES.manaPerRound, RULES.manaCap) + bonus;
}

function attackOf(card, foe) {
  if (!card || card.kind === 'guard' || card.kind === 'mend') return 0;
  if (!foe || foe.kind === 'guard' || foe.kind === 'mend') return card.value;
  if (ELEMENTS[card.element].beats === foe.element) return card.value * 2;
  if (ELEMENTS[foe.element].beats === card.element) return Math.max(1, Math.floor(card.value / 2));
  return card.value;
}

export function createGame() {
  const game = {
    state: 'title',
    round: 0,
    message: '',
    messageKind: '',
    selected: -1,
    reveal: null,
    revealTimer: 0,
    player: null,
    ai: null,
    log: [],
  };

  function newDuelist() {
    return {
      life: RULES.startLife,
      mana: 0,
      manaBonus: 0,
      deck: buildDeck(),
      hand: [],
      score: 0,
      roundsWon: 0,
      damageDealt: 0,
      elementsPlayed: {},
    };
  }

  function dealOpening() {
    game.player = newDuelist();
    game.ai = newDuelist();
    drawCards(game.player.deck, game.player.hand, RULES.startHand);
    drawCards(game.ai.deck, game.ai.hand, RULES.startHand);
  }

  function startRound() {
    game.round += 1;
    for (const side of [game.player, game.ai]) {
      drawCards(side.deck, side.hand, 1);
      side.mana = manaForRound(game.round, side.manaBonus);
      side.manaBonus = 0;
      if (affordable(side.hand, side.mana).length === 0) {
        side.hand.push(makeSpark());
      }
    }
    game.selected = -1;
    game.reveal = null;
    game.state = 'play';
    game.message = `Round ${game.round} — pick a card, then commit it.`;
    game.messageKind = 'info';
  }

  function startDuel() {
    dealOpening();
    game.round = 0;
    game.log = [];
    startRound();
  }

  function commitCard() {
    if (game.state !== 'play') return false;
    const card = game.player.hand[game.selected];
    if (!card || card.cost > game.player.mana) return false;
    game.player.hand.splice(game.selected, 1);
    game.player.mana -= card.cost;
    game.player.elementsPlayed[card.element] = (game.player.elementsPlayed[card.element] || 0) + 1;

    const aiCard = chooseCard(game.ai.hand, game.ai.mana, {
      aiLife: game.ai.life,
      playerLife: game.player.life,
      playerElements: game.player.elementsPlayed,
      round: game.round,
    });
    let aiPlayed = aiCard;
    if (!aiPlayed) {
      aiPlayed = makeSpark();
    } else {
      game.ai.hand.splice(game.ai.hand.indexOf(aiPlayed), 1);
      game.ai.mana -= aiPlayed.cost;
    }

    game.reveal = { player: card, ai: aiPlayed };
    game.state = 'reveal';
    game.revealTimer = 0;
    game.selected = -1;
    return true;
  }

  function resolveRound() {
    const { player: pCard, ai: aCard } = game.reveal;
    const pAtk = attackOf(pCard, aCard);
    const aAtk = attackOf(aCard, pCard);
    const pGuard = pCard.kind === 'guard';
    const aGuard = aCard.kind === 'guard';

    let pDamage = 0;
    let aDamage = 0;
    let winner = 'tie';
    if (pAtk > aAtk) {
      winner = 'player';
      aDamage = pAtk - aAtk;
    } else if (aAtk > pAtk) {
      winner = 'ai';
      pDamage = aAtk - pAtk;
    } else {
      pDamage = RULES.tieDamage;
      aDamage = RULES.tieDamage;
    }
    if (pGuard) pDamage = 0;
    if (aGuard) aDamage = 0;

    game.player.life -= pDamage;
    game.ai.life -= aDamage;
    game.player.damageDealt += aDamage;
    game.ai.damageDealt += pDamage;

    if (pCard.kind === 'mend') game.player.life = Math.min(RULES.startLife, game.player.life + RULES.mendHeal);
    if (aCard.kind === 'mend') game.ai.life = Math.min(RULES.startLife, game.ai.life + RULES.mendHeal);
    if (pGuard) game.player.manaBonus += RULES.guardManaBonus;
    if (aGuard) game.ai.manaBonus += RULES.guardManaBonus;

    if (winner === 'player') {
      game.player.roundsWon += 1;
      game.player.score += 10 + aDamage;
      if (pCard.kind === 'surge') {
        drawCards(game.player.deck, game.player.hand, 1);
        game.player.manaBonus += RULES.surgeManaBonus;
      }
    } else if (winner === 'ai') {
      game.ai.roundsWon += 1;
      game.ai.score += 10 + pDamage;
      if (aCard.kind === 'surge') {
        drawCards(game.ai.deck, game.ai.hand, 1);
        game.ai.manaBonus += RULES.surgeManaBonus;
      }
    } else {
      game.player.score += 2;
      game.ai.score += 2;
    }

    const bits = [];
    if (pCard.kind === 'guard') bits.push('You stand behind Stonewall.');
    if (aCard.kind === 'guard') bits.push('The champion stands behind a guard.');
    if (winner === 'player') bits.push(`You take the trick — ${aDamage} damage.`);
    if (winner === 'ai') bits.push(`The champion takes the trick — ${pDamage} damage.`);
    if (winner === 'tie') bits.push(`Even trick — both sides lose ${RULES.tieDamage}.`);
    if (pCard.kind === 'mend') bits.push(`You mend ${RULES.mendHeal} life.`);
    if (aCard.kind === 'mend') bits.push(`The champion mends ${RULES.mendHeal} life.`);
    game.message = bits.join(' ');
    game.messageKind = winner === 'player' ? 'good' : winner === 'ai' ? 'bad' : 'info';
    game.log.push(`R${game.round}: ${pCard.name} (${pAtk}) vs ${aCard.name} (${aAtk}) — ${winner}`);

    if (game.ai.life <= 0 || game.player.life <= 0 || game.round >= RULES.maxRounds) {
      endDuel();
    } else {
      startRound();
    }
  }

  function endDuel() {
    const pLife = Math.max(0, game.player.life);
    const aLife = Math.max(0, game.ai.life);
    let won = false;
    let reason = '';
    if (aLife <= 0 && pLife > 0) {
      won = true;
      reason = 'The champion falls. The Court is yours.';
    } else if (pLife <= 0 && aLife > 0) {
      reason = 'Your life runs out. The Court keeps its crown.';
    } else if (game.round >= RULES.maxRounds) {
      if (pLife > aLife) {
        won = true;
        reason = 'Twenty rounds done — you stand with more life.';
      } else if (aLife > pLife) {
        reason = 'Twenty rounds done — the champion stands with more life.';
      } else if (game.player.score > game.ai.score) {
        won = true;
        reason = 'Life even, but your score is higher. The Court is yours.';
      } else {
        reason = 'Life and score even — on a tie the Court keeps its crown.';
      }
    } else {
      reason = 'Both duelists fall at once — the Court keeps its crown.';
    }
    game.player.score += game.player.roundsWon * 5 + Math.max(0, game.player.life);
    game.state = won ? 'win' : 'loss';
    game.message = reason;
    game.messageKind = won ? 'good' : 'bad';
  }

  game.startDuel = startDuel;
  game.startRound = startRound;
  game.commitCard = commitCard;
  game.resolveRound = resolveRound;
  game.endDuel = endDuel;
  game.toTitle = () => {
    game.state = 'title';
    game.message = '';
  };
  return game;
}
