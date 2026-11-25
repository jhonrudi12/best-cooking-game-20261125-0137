// Ember & Thyme — Bistro Rush: every pixel the player sees. One canvas, warm kitchen colours,
// big readable panels: the order board on the left, the grill and the assembly plate in the
// middle, the pantry bins on the right, the shift clock up top. Ingredients are drawn as vector
// shapes (no image files), so the game ships no assets at all.
import { DISH_BY_NAME, INGREDIENTS, INGREDIENT_BY_ID, VIEW } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

const WOOD = '#5d3a1e';
const WOOD_DARK = '#4a2d16';
const CREAM = '#fdf3dd';
const PAPER = '#fff8e7';
const INK = '#2e2118';
const MUTED = '#7a6a58';
const GREEN = '#3f9e57';
const RED = '#d64545';
const GOLD = '#f5b942';

// Fixed layout in logical pixels; main.js uses the same zones to route clicks.
export function getZones() {
  const bins = {};
  const binW = 189;
  const binH = 240;
  const binX0 = 672;
  const binY0 = 158;
  INGREDIENTS.forEach((item, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    bins[item.id] = {
      x: binX0 + col * (binW + 12),
      y: binY0 + row * (binH + 14),
      w: binW,
      h: binH,
    };
  });
  return {
    bins,
    grill: [
      { x: 336, y: 132, w: 138, h: 138 },
      { x: 490, y: 132, w: 138, h: 138 },
    ],
    serve: { x: 336, y: 668, w: 150, h: 56 },
    trash: { x: 496, y: 668, w: 132, h: 56 },
    mute: { x: 1224, y: 14, w: 40, h: 40 },
  };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, value, x, y, size, color, weight = '700', align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Trebuchet MS", "Segoe UI", Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

/** Draw one ingredient as a vector icon centred at (cx, cy) with radius r. */
export function drawIngredient(ctx, id, cx, cy, r) {
  const item = INGREDIENT_BY_ID[id];
  if (!item) return;
  ctx.save();
  ctx.translate(cx, cy);
  if (id === 'bun') {
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.arc(0, r * 0.25, r, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = item.dark;
    ctx.fillRect(-r, r * 0.2, r * 2, r * 0.28);
    ctx.fillStyle = '#fff2cf';
    for (const [dx, dy] of [[-r * 0.45, -r * 0.35], [0, -r * 0.6], [r * 0.45, -r * 0.35], [-r * 0.2, -r * 0.15], [r * 0.25, -r * 0.18]]) {
      ctx.beginPath();
      ctx.ellipse(dx, dy, r * 0.12, r * 0.07, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'patty') {
    ctx.fillStyle = item.color;
    roundRect(ctx, -r, -r * 0.45, r * 2, r * 0.9, r * 0.35);
    ctx.fill();
    ctx.fillStyle = item.dark;
    for (const [dx, dy] of [[-r * 0.5, 0], [0, -r * 0.2], [r * 0.5, r * 0.1], [-r * 0.15, r * 0.22]]) {
      ctx.beginPath();
      ctx.arc(dx, dy, r * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'lettuce') {
    ctx.fillStyle = item.color;
    for (const [dx, dy, rad] of [[-r * 0.55, 0, r * 0.55], [0, -r * 0.15, r * 0.6], [r * 0.55, 0, r * 0.55], [-r * 0.28, r * 0.25, r * 0.45], [r * 0.28, r * 0.25, r * 0.45]]) {
      ctx.beginPath();
      ctx.arc(dx, dy, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = item.dark;
    ctx.lineWidth = r * 0.08;
    ctx.beginPath();
    ctx.moveTo(-r * 0.7, 0);
    ctx.quadraticCurveTo(0, r * 0.45, r * 0.7, 0);
    ctx.stroke();
  } else if (id === 'tomato') {
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.35, r * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = GREEN;
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.85, r * 0.3, r * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'cheese') {
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.moveTo(-r, r * 0.6);
    ctx.lineTo(r, r * 0.6);
    ctx.lineTo(r, -r * 0.2);
    ctx.lineTo(0, -r * 0.7);
    ctx.lineTo(-r, -r * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = item.dark;
    for (const [dx, dy] of [[-r * 0.4, r * 0.2], [r * 0.35, 0], [0, r * 0.35]]) {
      ctx.beginPath();
      ctx.arc(dx, dy, r * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'sauce') {
    ctx.strokeStyle = item.color;
    ctx.lineWidth = r * 0.32;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-r * 0.8, -r * 0.3);
    ctx.bezierCurveTo(-r * 0.4, r * 0.5, r * 0.1, -r * 0.6, r * 0.5, r * 0.1);
    ctx.bezierCurveTo(r * 0.7, r * 0.5, r * 0.85, -r * 0.2, r * 0.9, -r * 0.35);
    ctx.stroke();
    ctx.fillStyle = item.dark;
    ctx.beginPath();
    ctx.arc(-r * 0.8, r * 0.55, r * 0.14, 0, Math.PI * 2);
    ctx.arc(r * 0.45, r * 0.6, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawHeart(ctx, cx, cy, r, filled) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = filled ? '#e5484d' : 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.moveTo(0, r * 0.8);
  ctx.bezierCurveTo(-r * 1.2, -r * 0.1, -r * 0.6, -r * 0.9, 0, -r * 0.25);
  ctx.bezierCurveTo(r * 0.6, -r * 0.9, r * 1.2, -r * 0.1, 0, r * 0.8);
  ctx.fill();
  ctx.restore();
}

function drawBurgerStack(ctx, plate, cx, baseY) {
  // A plate ellipse, then the stack bottom-up: bottom bun, fillings, top bun dome.
  ctx.fillStyle = '#e8e2d4';
  ctx.beginPath();
  ctx.ellipse(cx, baseY + 8, 150, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#cfc7b4';
  ctx.beginPath();
  ctx.ellipse(cx, baseY + 8, 118, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  if (plate.length === 0) {
    text(ctx, 'Empty plate — build a dish!', cx, baseY - 60, 17, MUTED, '600', 'center');
    return;
  }
  let y = baseY;
  const layerH = 24;
  const layers = [...plate].reverse();
  for (const id of layers) {
    const item = INGREDIENT_BY_ID[id];
    y -= layerH;
    if (id === 'bun') {
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(cx, y + layerH, 105, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff2cf';
      for (const dx of [-60, -20, 25, 62]) {
        ctx.beginPath();
        ctx.ellipse(cx + dx, y + layerH - 26, 9, 5, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      y -= 18;
    } else if (id === 'patty') {
      ctx.fillStyle = item.color;
      roundRect(ctx, cx - 108, y, 216, layerH, 10);
      ctx.fill();
      ctx.fillStyle = item.dark;
      for (const dx of [-70, -20, 35, 80]) {
        ctx.beginPath();
        ctx.arc(cx + dx, y + 12, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (id === 'lettuce') {
      ctx.fillStyle = item.color;
      for (const dx of [-84, -42, 0, 42, 84]) {
        ctx.beginPath();
        ctx.arc(cx + dx, y + 12, 24, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (id === 'tomato') {
      ctx.fillStyle = item.color;
      for (const dx of [-62, 0, 62]) {
        ctx.beginPath();
        ctx.arc(cx + dx, y + 12, 26, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (id === 'cheese') {
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.moveTo(cx - 108, y + layerH);
      ctx.lineTo(cx + 108, y + layerH);
      ctx.lineTo(cx + 108, y + 6);
      ctx.lineTo(cx, y - 6);
      ctx.lineTo(cx - 108, y + 6);
      ctx.closePath();
      ctx.fill();
    } else if (id === 'sauce') {
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 100, y + 12);
      ctx.bezierCurveTo(cx - 50, y - 4, cx + 20, y + 26, cx + 100, y + 10);
      ctx.stroke();
    }
  }
  // Top bun dome caps the stack.
  ctx.fillStyle = INGREDIENT_BY_ID.bun.color;
  ctx.beginPath();
  ctx.arc(cx, y, 105, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff2cf';
  for (const dx of [-55, -10, 40, 70]) {
    ctx.beginPath();
    ctx.ellipse(cx + dx, y - 24, 9, 5, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawOrderTicket(ctx, order, x, y, w, h, index) {
  const dish = DISH_BY_NAME[order.dish];
  const ratio = Math.max(0, order.patience / order.maxPatience);
  const barColor = ratio > 0.5 ? GREEN : ratio > 0.25 ? GOLD : RED;
  ctx.fillStyle = PAPER;
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.strokeStyle = '#e0cfa8';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#c0392b';
  roundRect(ctx, x, y, 46, 30, 8);
  ctx.fill();
  text(ctx, `#${index + 1}`, x + 23, y + 16, 15, '#fff', '800', 'center');
  text(ctx, order.dish, x + 58, y + 17, 20, INK, '800');
  text(ctx, `$${dish.price}`, x + w - 14, y + 17, 18, '#8a6d1f', '800', 'right');
  // Ingredient chips the ticket asks for.
  let chipX = x + 14;
  const chipY = y + 52;
  for (const need of order.needs) {
    const item = INGREDIENT_BY_ID[need];
    ctx.fillStyle = '#f3e7c9';
    roundRect(ctx, chipX, chipY, 40, 40, 9);
    ctx.fill();
    drawIngredient(ctx, need, chipX + 20, chipY + 20, 15);
    chipX += 48;
  }
  // Patience bar.
  ctx.fillStyle = '#e8dcc0';
  roundRect(ctx, x + 14, y + h - 26, w - 28, 12, 6);
  ctx.fill();
  ctx.fillStyle = barColor;
  roundRect(ctx, x + 14, y + h - 26, Math.max(12, (w - 28) * ratio), 12, 6);
  ctx.fill();
  text(ctx, `${Math.ceil(order.patience)}s`, x + w - 14, y + h - 44, 13, ratio > 0.25 ? MUTED : RED, '700', 'right');
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const zones = getZones();

  function fit() {
    const scale = Math.min(window.innerWidth / VIEW.width, window.innerHeight / VIEW.height);
    canvas.width = VIEW.width;
    canvas.height = VIEW.height;
    canvas.style.width = `${Math.floor(VIEW.width * scale)}px`;
    canvas.style.height = `${Math.floor(VIEW.height * scale)}px`;
  }
  fit();
  window.addEventListener('resize', fit);

  function drawHeader(state, muted) {
    ctx.fillStyle = WOOD;
    ctx.fillRect(0, 0, VIEW.width, 76);
    ctx.fillStyle = WOOD_DARK;
    ctx.fillRect(0, 72, VIEW.width, 4);
    text(ctx, 'EMBER & THYME', 24, 26, 26, '#ffd98a', '800');
    text(ctx, 'BISTRO RUSH', 24, 54, 13, '#e8c9a0', '700');
    // Shift clock.
    const minutes = Math.floor(state.timeLeft / 60);
    const seconds = Math.floor(state.timeLeft % 60);
    const clock = `${minutes}:${String(seconds).padStart(2, '0')}`;
    const low = state.timeLeft <= 30 && !state.over;
    ctx.fillStyle = low ? '#ff6b5e' : 'rgba(255,255,255,0.12)';
    roundRect(ctx, 520, 12, 240, 52, 12);
    ctx.fill();
    text(ctx, 'SHIFT', 640, 26, 12, '#e8c9a0', '700', 'center');
    text(ctx, clock, 640, 50, 26, low ? '#fff' : '#ffe9b8', '800', 'center');
    // Score, coins, hearts.
    text(ctx, `SCORE ${state.score}`, 800, 30, 20, '#fff', '800');
    text(ctx, `COINS ${state.coins}`, 800, 56, 14, GOLD, '700');
    for (let i = 0; i < 3; i += 1) drawHeart(ctx, 1010 + i * 34, 30, 13, i < state.hearts);
    text(ctx, state.combo > 1 ? `COMBO x${state.combo}` : 'COMBO —', 1010, 60, 14, state.combo > 1 ? '#7ee2a0' : MUTED, '800');
    text(ctx, muted ? 'SOUND OFF (M)' : 'SOUND ON (M)', 1180, 30, 12, '#e8c9a0', '700', 'right');
    text(ctx, `SERVED ${state.served}`, 1180, 56, 13, '#e8c9a0', '700', 'right');
  }

  function drawOrderBoard(state) {
    ctx.fillStyle = '#6b4423';
    roundRect(ctx, 16, 92, 284, 612, 14);
    ctx.fill();
    text(ctx, 'ORDER BOARD', 158, 118, 19, '#ffd98a', '800', 'center');
    text(ctx, 'serve the ticket exactly', 158, 142, 12, '#e8c9a0', '600', 'center');
    for (let slot = 0; slot < 3; slot += 1) {
      const order = state.orders[slot];
      const y = 158 + slot * 178;
      if (order) drawOrderTicket(ctx, order, 30, y, 256, 164, slot);
      else {
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        roundRect(ctx, 30, y, 256, 164, 12);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
        text(ctx, 'Waiting for a guest…', 158, y + 82, 15, 'rgba(255,255,255,0.6)', '600', 'center');
      }
    }
  }

  function drawGrill(state) {
    ctx.fillStyle = '#3a3230';
    roundRect(ctx, 320, 92, 324, 200, 14);
    ctx.fill();
    text(ctx, 'GRILL', 482, 116, 18, '#ffb26b', '800', 'center');
    state.grill.forEach((slot, index) => {
      const zone = zones.grill[index];
      const cx = zone.x + zone.w / 2;
      const cy = zone.y + zone.h / 2;
      ctx.fillStyle = '#241f1d';
      roundRect(ctx, zone.x, zone.y, zone.w, zone.h, 12);
      ctx.fill();
      // Grill bars.
      ctx.strokeStyle = '#4a423c';
      ctx.lineWidth = 5;
      for (let bar = 0; bar < 4; bar += 1) {
        ctx.beginPath();
        ctx.moveTo(zone.x + 12, zone.y + 26 + bar * 30);
        ctx.lineTo(zone.x + zone.w - 12, zone.y + 26 + bar * 30);
        ctx.stroke();
      }
      if (slot.status === 'empty') {
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 2;
        roundRect(ctx, zone.x + 10, zone.y + 10, zone.w - 20, zone.h - 20, 9);
        ctx.stroke();
        ctx.setLineDash([]);
        text(ctx, 'empty', cx, cy + 38, 13, '#8a7f76', '600', 'center');
      } else if (slot.status === 'cooking') {
        drawIngredient(ctx, 'patty', cx, cy - 6, 34);
        const ratio = Math.min(1, slot.time / 6);
        ctx.fillStyle = '#241f1d';
        roundRect(ctx, zone.x + 16, zone.y + zone.h - 26, zone.w - 32, 10, 5);
        ctx.fill();
        ctx.fillStyle = '#ffb26b';
        roundRect(ctx, zone.x + 16, zone.y + zone.h - 26, Math.max(10, (zone.w - 32) * ratio), 10, 5);
        ctx.fill();
        // Steam.
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - 14, cy - 44);
        ctx.quadraticCurveTo(cx - 20, cy - 58, cx - 12, cy - 68);
        ctx.moveTo(cx + 10, cy - 44);
        ctx.quadraticCurveTo(cx + 16, cy - 58, cx + 8, cy - 68);
        ctx.stroke();
      } else if (slot.status === 'done') {
        ctx.save();
        ctx.shadowColor = '#ffd76b';
        ctx.shadowBlur = 22;
        drawIngredient(ctx, 'patty', cx, cy - 6, 38);
        ctx.restore();
        ctx.fillStyle = '#ffd76b';
        roundRect(ctx, cx - 44, zone.y + zone.h - 30, 88, 22, 8);
        ctx.fill();
        text(ctx, 'READY!', cx, zone.y + zone.h - 18, 13, '#5d3a1e', '800', 'center');
      } else {
        drawIngredient(ctx, 'patty', cx, cy - 6, 34);
        ctx.fillStyle = 'rgba(20,12,6,0.65)';
        ctx.beginPath();
        ctx.arc(cx, cy - 6, 36, 0, Math.PI * 2);
        ctx.fill();
        text(ctx, 'BURNT — click to bin', cx, zone.y + zone.h - 18, 12, '#ff8a7a', '700', 'center');
      }
    });
  }

  function drawPlate(state) {
    const ready = state.orders.some((order) => {
      if (state.plate.length !== order.needs.length) return false;
      const counts = new Map();
      for (const item of state.plate) counts.set(item, (counts.get(item) ?? 0) + 1);
      const wanted = new Map();
      for (const item of order.needs) wanted.set(item, (wanted.get(item) ?? 0) + 1);
      for (const [item, count] of wanted) if ((counts.get(item) ?? 0) !== count) return false;
      return true;
    });
    ctx.fillStyle = '#f3e3c0';
    roundRect(ctx, 320, 308, 324, 344, 14);
    ctx.fill();
    text(ctx, 'YOUR PLATE', 482, 332, 18, INK, '800', 'center');
    drawBurgerStack(ctx, state.plate, 482, 560);
    const serve = zones.serve;
    const trash = zones.trash;
    ctx.fillStyle = ready ? GREEN : '#9a8f7d';
    if (state.flashServe) ctx.fillStyle = '#2f7d3d';
    roundRect(ctx, serve.x, serve.y, serve.w, serve.h, 12);
    ctx.fill();
    text(ctx, ready ? 'SERVE!  [Space]' : 'SERVE  [Space]', serve.x + serve.w / 2, serve.y + 29, 17, '#fff', '800', 'center');
    ctx.fillStyle = '#c0392b';
    roundRect(ctx, trash.x, trash.y, trash.w, trash.h, 12);
    ctx.fill();
    text(ctx, 'BIN  [Del]', trash.x + trash.w / 2, trash.y + 29, 16, '#fff', '800', 'center');
    if (ready) {
      text(ctx, 'Matches a ticket — serve it!', 482, 742, 14, GREEN, '800', 'center');
    }
  }

  function drawPantry(state) {
    ctx.fillStyle = '#6b4423';
    roundRect(ctx, 660, 92, 604, 612, 14);
    ctx.fill();
    text(ctx, 'PANTRY', 962, 116, 19, '#ffd98a', '800', 'center');
    text(ctx, 'click a bin or press its key — patty goes straight to the grill', 962, 140, 13, '#e8c9a0', '600', 'center');
    for (const item of INGREDIENTS) {
      const zone = zones.bins[item.id];
      ctx.fillStyle = PAPER;
      roundRect(ctx, zone.x, zone.y, zone.w, zone.h, 14);
      ctx.fill();
      ctx.strokeStyle = '#e0cfa8';
      ctx.lineWidth = 2;
      ctx.stroke();
      drawIngredient(ctx, item.id, zone.x + zone.w / 2, zone.y + 100, 62);
      text(ctx, item.name, zone.x + zone.w / 2, zone.y + 186, 20, INK, '800', 'center');
      text(ctx, item.id === 'patty' ? 'grills 6s, then click it' : 'adds to your plate', zone.x + zone.w / 2, zone.y + 210, 13, MUTED, '600', 'center');
      ctx.fillStyle = '#2e2118';
      roundRect(ctx, zone.x + zone.w - 44, zone.y + 12, 32, 32, 8);
      ctx.fill();
      text(ctx, item.key, zone.x + zone.w - 28, zone.y + 29, 17, '#fff', '800', 'center');
    }
  }

  function drawFooter(state) {
    ctx.fillStyle = WOOD_DARK;
    ctx.fillRect(0, 724, VIEW.width, 76);
    text(ctx, '1–6 add ingredients  ·  G grill a patty  ·  Space serve  ·  Del bin the plate  ·  P pause  ·  M sound', 24, 752, 15, '#e8c9a0', '600');
    text(ctx, `Best combo x${state.bestCombo}   ·   Dishes served ${state.served}`, 24, 778, 13, '#b99f7f', '600');
    if (state.toast && state.toastTime > 0) {
      ctx.fillStyle = 'rgba(46,33,24,0.92)';
      const w = ctx.measureText(state.toast).width + 44;
      roundRect(ctx, 640 - w / 2, 690, w, 34, 10);
      ctx.fill();
      text(ctx, state.toast, 640, 708, 15, '#ffe9b8', '700', 'center');
    }
  }

  function drawTitle(state, best) {
    ctx.fillStyle = 'rgba(30,18,8,0.72)';
    ctx.fillRect(0, 76, VIEW.width, 648);
    ctx.fillStyle = PAPER;
    roundRect(ctx, 340, 150, 600, 470, 18);
    ctx.fill();
    text(ctx, 'EMBER & THYME', 640, 210, 44, INK, '800', 'center');
    text(ctx, 'BISTRO RUSH', 640, 252, 22, '#b97a28', '800', 'center');
    text(ctx, 'A tiny bistro, a rush of hungry guests, one grill.', 640, 292, 17, MUTED, '600', 'center');
    const lines = [
      '1  Read the tickets on the order board.',
      '2  Click pantry bins (or press 1–6) to build the dish.',
      '3  Patties grill for 6 seconds — grab them golden.',
      '4  Serve the exact ticket before its patience runs out.',
    ];
    lines.forEach((line, index) => text(ctx, line, 640, 336 + index * 30, 16, INK, '600', 'center'));
    ctx.fillStyle = GREEN;
    roundRect(ctx, 490, 470, 300, 56, 12);
    ctx.fill();
    text(ctx, 'START SHIFT  [Enter]', 640, 499, 19, '#fff', '800', 'center');
    text(ctx, `Best score ${best}  ·  Shift lasts 2:30  ·  3 hearts`, 640, 556, 14, MUTED, '600', 'center');
    text(ctx, 'Keyboard + mouse · desktop browser · no downloads', 640, 584, 13, MUTED, '600', 'center');
  }

  function drawPaused() {
    ctx.fillStyle = 'rgba(30,18,8,0.7)';
    ctx.fillRect(0, 76, VIEW.width, 648);
    text(ctx, 'PAUSED', 640, 380, 48, '#fff', '800', 'center');
    text(ctx, 'Press P or Enter to keep cooking', 640, 430, 18, '#ffe9b8', '600', 'center');
  }

  function drawOver(state, best) {
    ctx.fillStyle = 'rgba(30,18,8,0.78)';
    ctx.fillRect(0, 76, VIEW.width, 648);
    ctx.fillStyle = PAPER;
    roundRect(ctx, 380, 160, 520, 440, 18);
    ctx.fill();
    text(ctx, 'SHIFT OVER', 640, 214, 40, INK, '800', 'center');
    const stars = state.score >= 1500 ? 3 : state.score >= 900 ? 2 : state.score >= 400 ? 1 : 0;
    for (let index = 0; index < 3; index += 1) {
      ctx.fillStyle = index < stars ? GOLD : '#ddd2ba';
      const cx = 640 + (index - 1) * 64;
      ctx.beginPath();
      for (let point = 0; point < 10; point += 1) {
        const angle = (Math.PI / 5) * point - Math.PI / 2;
        const radius = point % 2 === 0 ? 30 : 13;
        const px = cx + Math.cos(angle) * radius;
        const py = 268 + Math.sin(angle) * radius;
        if (point === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }
    text(ctx, `SCORE  ${state.score}`, 640, 340, 28, INK, '800', 'center');
    text(ctx, `Dishes served ${state.served}   ·   Best combo x${state.bestCombo}   ·   Coins ${state.coins}`, 640, 382, 16, MUTED, '600', 'center');
    text(ctx, `Best score ${Math.max(best, state.score)}`, 640, 414, 16, MUTED, '600', 'center');
    const verdict = stars === 3 ? 'Head-chef material!' : stars === 2 ? 'A solid service!' : stars === 1 ? 'The bistro survived.' : 'The rush won this time.';
    text(ctx, verdict, 640, 452, 18, '#b97a28', '800', 'center');
    ctx.fillStyle = GREEN;
    roundRect(ctx, 490, 490, 300, 56, 12);
    ctx.fill();
    text(ctx, 'COOK AGAIN  [Enter]', 640, 519, 19, '#fff', '800', 'center');
  }

  function draw(state, screen, best, muted) {
    ctx.save();
    if (state.shake > 0) {
      const amount = state.shake * 18;
      ctx.translate((Math.random() - 0.5) * amount, (Math.random() - 0.5) * amount);
    }
    // Warm kitchen backdrop.
    ctx.fillStyle = '#f7e8c8';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    ctx.fillStyle = '#e8d3a3';
    for (let x = 0; x < VIEW.width; x += 96) ctx.fillRect(x, 76, 2, 648);
    drawHeader(state, muted);
    drawOrderBoard(state);
    drawGrill(state);
    drawPlate(state);
    drawPantry(state);
    drawFooter(state);
    if (screen === SCREEN_TITLE) drawTitle(state, best);
    else if (screen === SCREEN_PAUSED) drawPaused();
    else if (screen === SCREEN_OVER) drawOver(state, best);
    ctx.restore();
  }

  return { draw, zones };
}
