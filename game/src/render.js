// render.js — every pixel of Court of Embers: the felt table, the hands, the
// cards with their values and suits, the life and mana bars, and the title,
// win and loss screens. Cards are drawn, never images, so the game needs
// no files beyond its own scripts.

import { TABLE, ELEMENTS, RULES } from './config.js';

const CARD_W = 120;
const CARD_H = 170;
const BACK_W = 92;
const BACK_H = 128;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawGlyph(ctx, glyph, cx, cy, size, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (glyph === 'flame') {
    ctx.moveTo(cx, cy - size);
    ctx.bezierCurveTo(cx + size * 0.9, cy - size * 0.2, cx + size * 0.6, cy + size * 0.7, cx, cy + size * 0.8);
    ctx.bezierCurveTo(cx - size * 0.6, cy + size * 0.7, cx - size * 0.9, cy - size * 0.2, cx, cy - size);
    ctx.fill();
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.moveTo(cx, cy - size * 0.2);
    ctx.bezierCurveTo(cx + size * 0.4, cy + size * 0.2, cx + size * 0.25, cy + size * 0.6, cx, cy + size * 0.6);
    ctx.bezierCurveTo(cx - size * 0.25, cy + size * 0.6, cx - size * 0.4, cy + size * 0.2, cx, cy - size * 0.2);
    ctx.fill();
  } else if (glyph === 'drop') {
    ctx.moveTo(cx, cy - size);
    ctx.bezierCurveTo(cx + size * 0.85, cy - size * 0.1, cx + size * 0.7, cy + size * 0.8, cx, cy + size * 0.8);
    ctx.bezierCurveTo(cx - size * 0.7, cy + size * 0.8, cx - size * 0.85, cy - size * 0.1, cx, cy - size);
    ctx.fill();
  } else if (glyph === 'leaf') {
    ctx.moveTo(cx, cy - size);
    ctx.bezierCurveTo(cx + size, cy - size * 0.4, cx + size * 0.7, cy + size * 0.8, cx, cy + size);
    ctx.bezierCurveTo(cx - size * 0.7, cy + size * 0.8, cx - size, cy - size * 0.4, cx, cy - size);
    ctx.fill();
    ctx.strokeStyle = '#e9f5db';
    ctx.beginPath();
    ctx.moveTo(cx, cy - size * 0.8);
    ctx.lineTo(cx, cy + size * 0.8);
    ctx.stroke();
  } else {
    ctx.moveTo(cx - size, cy + size * 0.7);
    ctx.lineTo(cx - size * 0.3, cy - size * 0.7);
    ctx.lineTo(cx + size * 0.1, cy + size * 0.1);
    ctx.lineTo(cx + size * 0.5, cy - size * 0.4);
    ctx.lineTo(cx + size, cy + size * 0.7);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawCard(ctx, card, x, y, w, h, opts = {}) {
  const el = ELEMENTS[card.element];
  const selected = opts.selected;
  const dimmed = opts.dimmed;
  ctx.save();
  if (dimmed) ctx.globalAlpha = 0.45;
  roundRect(ctx, x, y, w, h, 10);
  ctx.fillStyle = '#f7f1de';
  ctx.fill();
  ctx.lineWidth = selected ? 4 : 2;
  ctx.strokeStyle = selected ? '#ffd166' : '#3a2f1d';
  ctx.stroke();
  // Element band.
  roundRect(ctx, x + 4, y + 4, w - 8, 34, 7);
  ctx.fillStyle = el.color;
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${Math.round(w * 0.11)}px Georgia, serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(el.name.toUpperCase(), x + 12, y + 22);
  // Cost gems, top right.
  for (let i = 0; i < card.cost; i++) {
    const gx = x + w - 14 - i * 16;
    ctx.beginPath();
    ctx.arc(gx, y + 22, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#7fb3d5';
    ctx.fill();
    ctx.strokeStyle = '#1f4568';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  // Glyph and value.
  drawGlyph(ctx, el.glyph, x + w / 2, y + h * 0.42, Math.round(w * 0.22), el.color);
  if (card.kind === 'strike' || card.kind === 'surge') {
    ctx.fillStyle = '#1d1a16';
    ctx.font = `bold ${Math.round(w * 0.42)}px Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.fillText(String(card.value), x + w / 2, y + h * 0.72);
    ctx.font = `bold ${Math.round(w * 0.09)}px Georgia, serif`;
    ctx.fillStyle = '#5a5142';
    ctx.fillText(card.kind === 'surge' ? 'SURGE' : 'ATTACK', x + w / 2, y + h * 0.82);
  } else {
    ctx.fillStyle = '#1d1a16';
    ctx.font = `bold ${Math.round(w * 0.16)}px Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.fillText(card.kind === 'guard' ? 'GUARD' : 'MEND', x + w / 2, y + h * 0.68);
    ctx.font = `${Math.round(w * 0.085)}px Georgia, serif`;
    ctx.fillStyle = '#5a5142';
    const lines = card.kind === 'guard'
      ? ['Block all damage', '+2 mana next round.']
      : ['Heal 5 life.'];
    lines.forEach((line, i) => ctx.fillText(line, x + w / 2, y + h * 0.74 + i * 14));
  }
  // Name strip.
  ctx.fillStyle = '#1d1a16';
  ctx.font = `bold ${Math.round(w * 0.1)}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.fillText(card.name, x + w / 2, y + h - 12);
  ctx.restore();
}

function drawCardBack(ctx, x, y, w, h) {
  roundRect(ctx, x, y, w, h, 8);
  ctx.fillStyle = '#5b2333';
  ctx.fill();
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = 2;
  ctx.stroke();
  roundRect(ctx, x + 6, y + 6, w - 12, h - 12, 6);
  ctx.strokeStyle = 'rgba(255,209,102,0.6)';
  ctx.lineWidth = 1;
  ctx.stroke();
  drawGlyph(ctx, 'flame', x + w / 2, y + h / 2, Math.round(w * 0.22), '#ffd166');
}

function lifeBar(ctx, x, y, w, life, max, alignRight) {
  ctx.save();
  roundRect(ctx, x, y, w, 22, 11);
  ctx.fillStyle = '#101018';
  ctx.fill();
  const frac = Math.max(0, Math.min(1, life / max));
  if (frac > 0) {
    roundRect(ctx, x + 2, y + 2, (w - 4) * frac, 18, 9);
    ctx.fillStyle = frac > 0.5 ? '#e4572e' : frac > 0.25 ? '#e8a13a' : '#c0392b';
    ctx.fill();
  }
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px Georgia, serif';
  ctx.textAlign = alignRight ? 'right' : 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`♥ ${Math.max(0, life)} / ${max}`, alignRight ? x + w - 8 : x + 8, y + 12);
  ctx.restore();
}

function manaGems(ctx, x, y, mana) {
  ctx.save();
  ctx.fillStyle = '#cfd8dc';
  ctx.font = 'bold 14px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Mana', x, y);
  for (let i = 0; i < Math.max(mana, 0); i++) {
    ctx.beginPath();
    ctx.arc(x + 52 + i * 18, y, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#7fb3d5';
    ctx.fill();
    ctx.strokeStyle = '#1f4568';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.restore();
}

export function render(ctx, game) {
  const W = TABLE.width;
  const H = TABLE.height;
  game._hits = { cards: [], playButton: null, startButton: null, restartButton: null };

  // Felt table.
  const felt = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 760);
  felt.addColorStop(0, '#1e4d33');
  felt.addColorStop(1, '#0f2a1c');
  ctx.fillStyle = felt;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 4;
  ctx.strokeRect(14, 14, W - 28, H - 28);
  ctx.strokeStyle = 'rgba(201,162,39,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(W / 2, 400, 210, 0, Math.PI * 2);
  ctx.stroke();

  if (game.state === 'title') {
    drawTitle(ctx, game);
    return;
  }
  if (game.state === 'win' || game.state === 'loss') {
    drawTable(ctx, game);
    drawEnd(ctx, game);
    return;
  }
  drawTable(ctx, game);
}

function drawTable(ctx, game) {
  const W = TABLE.width;
  const p = game.player;
  const a = game.ai;

  // Opponent strip.
  ctx.fillStyle = '#f7f1de';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Champion of Embers', 40, 48);
  ctx.font = '15px Georgia, serif';
  ctx.fillStyle = '#d8cfae';
  ctx.fillText(`Score ${a.score}   •   Tricks ${a.roundsWon}`, 40, 74);
  lifeBar(ctx, W - 340, 36, 300, a.life, RULES.startLife, true);
  ctx.fillStyle = '#d8cfae';
  ctx.font = '15px Georgia, serif';
  ctx.textAlign = 'right';
  ctx.fillText(`Round ${Math.max(1, game.round)} / ${RULES.maxRounds}`, W - 40, 74);

  // Opponent hand, face down.
  const backs = a.hand.length;
  const totalW = backs * (BACK_W + 8) - 8;
  let bx = (W - totalW) / 2;
  for (let i = 0; i < backs; i++) {
    drawCardBack(ctx, bx, 100, BACK_W, BACK_H);
    bx += BACK_W + 8;
  }

  // Centre: the two played cards.
  const cy = 300;
  ctx.fillStyle = '#d8cfae';
  ctx.font = 'bold 16px Georgia, serif';
  ctx.textAlign = 'center';
  if (game.reveal) {
    drawCard(ctx, game.reveal.ai, W / 2 + 60, cy - 48, 140, 195);
    drawCard(ctx, game.reveal.player, W / 2 - 200, cy - 48, 140, 195);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 34px Georgia, serif';
    ctx.fillText('VS', W / 2, cy + 62);
    ctx.font = 'bold 15px Georgia, serif';
    ctx.fillStyle = '#f7f1de';
    ctx.fillText('Champion', W / 2 + 130, cy + 172);
    ctx.fillText('You', W / 2 - 130, cy + 172);
  } else {
    ctx.strokeStyle = 'rgba(247,241,222,0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    roundRect(ctx, W / 2 + 60, cy - 48, 140, 195, 10);
    ctx.stroke();
    roundRect(ctx, W / 2 - 200, cy - 48, 140, 195, 10);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(247,241,222,0.7)';
    ctx.font = '16px Georgia, serif';
    ctx.fillText('Champion plays face down', W / 2 + 130, cy + 62);
    ctx.fillText('Your card goes here', W / 2 - 130, cy + 62);
  }

  // Message banner.
  ctx.fillStyle = game.messageKind === 'good' ? '#b8e986' : game.messageKind === 'bad' ? '#ff9a8a' : '#f7f1de';
  ctx.font = '17px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(game.message || '', W / 2, 500);

  // Player strip: life, mana, score.
  lifeBar(ctx, 40, 532, 300, p.life, RULES.startLife, false);
  manaGems(ctx, 40, 568, p.mana);
  ctx.fillStyle = '#f7f1de';
  ctx.font = 'bold 18px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(`You — Score ${p.score}   •   Tricks ${p.roundsWon}`, 380, 568);

  // Commit button.
  const canCommit = game.state === 'play' && game.selected >= 0
    && p.hand[game.selected] && p.hand[game.selected].cost <= p.mana;
  const btnX = W - 220;
  const btnY = 528;
  roundRect(ctx, btnX, btnY, 180, 48, 10);
  ctx.fillStyle = canCommit ? '#c9a227' : '#4a4436';
  ctx.fill();
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = canCommit ? '#1d1a16' : '#9a917c';
  ctx.font = 'bold 19px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Play card  ⏎', btnX + 90, btnY + 25);
  if (canCommit) game._hits.playButton = { x: btnX, y: btnY, w: 180, h: 48 };

  // Player hand, fanned.
  const hand = p.hand;
  const totalHandW = hand.length * (CARD_W + 10) - 10;
  let hx = (W - totalHandW) / 2;
  const hy = 610;
  hand.forEach((card, i) => {
    const lift = game.selected === i ? -22 : 0;
    const dimmed = game.state === 'play' && card.cost > p.mana;
    drawCard(ctx, card, hx, hy + lift, CARD_W, CARD_H, { selected: game.selected === i, dimmed });
    if (game.state === 'play') {
      game._hits.cards.push({ x: hx, y: hy + lift, w: CARD_W, h: CARD_H, index: i });
    }
    hx += CARD_W + 10;
  });

  // Hint line.
  ctx.fillStyle = '#8a8272';
  ctx.font = '13px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Click a card or press 1–7 to select • Enter to play it • M mute • R restart', W / 2, 795);
}

function drawTitle(ctx, game) {
  const W = TABLE.width;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 84px Georgia, serif';
  ctx.fillText('COURT OF EMBERS', W / 2, 190);
  ctx.fillStyle = '#f7f1de';
  ctx.font = 'italic 26px Georgia, serif';
  ctx.fillText('A duel card game of the four winds', W / 2, 240);

  // Element wheel.
  const cy = 340;
  const cx = W / 2;
  const order = ['ember', 'gale', 'stone', 'tide'];
  order.forEach((key, i) => {
    const el = ELEMENTS[key];
    const x = cx + (i - 1.5) * 190;
    drawGlyph(ctx, el.glyph, x, cy, 34, el.color);
    ctx.fillStyle = '#f7f1de';
    ctx.font = 'bold 19px Georgia, serif';
    ctx.fillText(el.name, x, cy + 62);
    ctx.fillStyle = '#d8cfae';
    ctx.font = '15px Georgia, serif';
    ctx.fillText(`beats ${ELEMENTS[el.beats].name}`, x, cy + 88);
  });
  ctx.fillStyle = '#d8cfae';
  ctx.font = '16px Georgia, serif';
  ctx.fillText('A card played on its beaten element strikes twice as hard; on its beating element, half as hard.', W / 2, 470);

  ctx.fillStyle = '#f7f1de';
  ctx.font = '18px Georgia, serif';
  ctx.fillText('Both duelists start at 20 life. Each round you both commit one card face down,', W / 2, 520);
  ctx.fillText('then reveal: the stronger attack wins the trick and deals the difference as damage.', W / 2, 548);
  ctx.fillText('Guard blocks, Mend heals 5, Surge pays off when it wins. First to 0 life loses.', W / 2, 576);

  const bx = W / 2 - 170;
  const by = 620;
  roundRect(ctx, bx, by, 340, 64, 12);
  ctx.fillStyle = '#c9a227';
  ctx.fill();
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#1d1a16';
  ctx.font = 'bold 24px Georgia, serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('Begin the duel  ⏎', W / 2, by + 33);
  game._hits.startButton = { x: bx, y: by, w: 340, h: 64 };

  ctx.fillStyle = '#8a8272';
  ctx.font = '14px Georgia, serif';
  ctx.fillText('Mouse and keyboard • M mute', W / 2, 730);
}

function drawEnd(ctx, game) {
  const W = TABLE.width;
  const won = game.state === 'win';
  ctx.save();
  ctx.fillStyle = 'rgba(8,6,12,0.72)';
  ctx.fillRect(0, 0, W, TABLE.height);
  const px = W / 2 - 330;
  const py = 200;
  roundRect(ctx, px, py, 660, 400, 16);
  ctx.fillStyle = won ? '#1e4d33' : '#3d1420';
  ctx.fill();
  ctx.strokeStyle = won ? '#ffd166' : '#c0392b';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = won ? '#ffd166' : '#ff9a8a';
  ctx.font = 'bold 64px Georgia, serif';
  ctx.fillText(won ? 'VICTORY' : 'DEFEAT', W / 2, py + 100);
  ctx.fillStyle = '#f7f1de';
  ctx.font = '20px Georgia, serif';
  ctx.fillText(game.message, W / 2, py + 150);
  ctx.font = '18px Georgia, serif';
  ctx.fillText(`Rounds won: ${game.player.roundsWon}  •  Damage dealt: ${game.player.damageDealt}`, W / 2, py + 210);
  ctx.fillText(`Your life: ${Math.max(0, game.player.life)}  •  Champion's life: ${Math.max(0, game.ai.life)}`, W / 2, py + 244);
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 24px Georgia, serif';
  ctx.fillText(`Final score: ${game.player.score}`, W / 2, py + 292);
  const bx = W / 2 - 150;
  const by = py + 320;
  roundRect(ctx, bx, by, 300, 52, 10);
  ctx.fillStyle = '#c9a227';
  ctx.fill();
  ctx.fillStyle = '#1d1a16';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('Duel again  (R)', W / 2, by + 27);
  game._hits.restartButton = { x: bx, y: by, w: 300, h: 52 };
  ctx.restore();
}
