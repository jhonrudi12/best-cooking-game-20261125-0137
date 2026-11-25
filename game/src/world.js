// Ember & Thyme — Bistro Rush: the rules. No drawing and no input here, only the kitchen
// state: orders on the board, the two grill slots, the plate being assembled, the shift clock,
// score, combo and hearts. Every public method is one player action, so the autopilot that
// stages screenshots and the real input path play exactly the same game.
import {
  DISHES,
  GRILL_BURN_SECONDS,
  GRILL_COOK_SECONDS,
  HEARTS,
  INGREDIENT_BY_ID,
  MAX_ORDERS,
  ORDER_PATIENCE_SECONDS,
  ORDER_SPAWN_SECONDS,
  SHIFT_SECONDS,
  STEP,
} from './config.js';

export const EVENT_SERVED = 1;
export const EVENT_FAILED_SERVE = 2;
export const EVENT_ORDER_LOST = 4;
export const EVENT_OVER = 8;
export const EVENT_PATTY_DONE = 16;

let orderId = 1;

function sameMultiset(a, b) {
  if (a.length !== b.length) return false;
  const counts = new Map();
  for (const item of a) counts.set(item, (counts.get(item) ?? 0) + 1);
  for (const item of b) {
    const left = (counts.get(item) ?? 0) - 1;
    if (left < 0) return false;
    counts.set(item, left);
  }
  return true;
}

function countIn(list, id) {
  let count = 0;
  for (const item of list) if (item === id) count += 1;
  return count;
}

export function createWorld(random) {
  const state = {
    timeLeft: SHIFT_SECONDS,
    score: 0,
    coins: 0,
    combo: 0,
    bestCombo: 0,
    served: 0,
    hearts: HEARTS,
    orders: [],
    grill: [
      { status: 'empty', time: 0 },
      { status: 'empty', time: 0 },
    ],
    plate: [],
    spawnIn: 2,
    over: false,
    toast: '',
    toastTime: 0,
    shake: 0,
    flashServe: false,
    servedNames: [],
  };

  function spawnOrder() {
    if (state.orders.length >= MAX_ORDERS) return;
    const dish = random.pick(DISHES);
    state.orders.push({
      id: orderId,
      dish: dish.name,
      needs: [...dish.needs],
      patience: ORDER_PATIENCE_SECONDS,
      maxPatience: ORDER_PATIENCE_SECONDS,
    });
    orderId += 1;
  }

  function setToast(text, seconds = 1.6) {
    state.toast = text;
    state.toastTime = seconds;
  }

  function reset() {
    state.timeLeft = SHIFT_SECONDS;
    state.score = 0;
    state.coins = 0;
    state.combo = 0;
    state.bestCombo = 0;
    state.served = 0;
    state.hearts = HEARTS;
    state.orders = [];
    state.grill = [
      { status: 'empty', time: 0 },
      { status: 'empty', time: 0 },
    ];
    state.plate = [];
    state.spawnIn = 2;
    state.over = false;
    state.toast = '';
    state.toastTime = 0;
    state.shake = 0;
    state.flashServe = false;
    state.servedNames = [];
    spawnOrder();
    spawnOrder();
  }

  /** Add an ingredient to the plate. A patty goes on the grill first; a cooked patty is taken off it. */
  function addIngredient(id) {
    if (state.over) return false;
    if (!INGREDIENT_BY_ID[id]) return false;
    if (id === 'patty') return startGrill();
    if (state.plate.length >= 6) {
      setToast('Plate is full — serve or bin it');
      return false;
    }
    state.plate.push(id);
    return true;
  }

  /** Put a raw patty on a free grill slot. Returns the slot index, or -1 when the grill is full. */
  function startGrill() {
    const slot = state.grill.findIndex((item) => item.status === 'empty');
    if (slot === -1) {
      setToast('Grill is full!');
      return -1;
    }
    state.grill[slot] = { status: 'cooking', time: 0 };
    return slot;
  }

  /** Click a grill slot: take a cooked patty onto the plate, or clear a burnt one. */
  function pressGrill(slot) {
    if (state.over) return false;
    const item = state.grill[slot];
    if (!item) return false;
    if (item.status === 'done') {
      if (state.plate.length >= 6) {
        setToast('Plate is full — serve or bin it');
        return false;
      }
      state.plate.push('patty');
      state.grill[slot] = { status: 'empty', time: 0 };
      return true;
    }
    if (item.status === 'burnt') {
      state.grill[slot] = { status: 'empty', time: 0 };
      setToast('Burnt patty binned');
      return true;
    }
    return false;
  }

  /** Serve the plate. It must match one ticket exactly, patty included. */
  function serve() {
    if (state.over || state.plate.length === 0) return 0;
    const index = state.orders.findIndex((order) => sameMultiset(state.plate, order.needs));
    if (index === -1) {
      state.combo = 0;
      state.shake = 0.35;
      setToast('No ticket matches this plate!');
      return EVENT_FAILED_SERVE;
    }
    const order = state.orders[index];
    const dish = DISHES.find((item) => item.name === order.dish);
    const patienceBonus = Math.round((order.patience / order.maxPatience) * dish.tip);
    const comboBonus = state.combo * 15;
    const earned = dish.price + patienceBonus + comboBonus;
    state.score += earned;
    state.coins += Math.round(earned / 10);
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.served += 1;
    state.servedNames.push(order.dish);
    state.orders.splice(index, 1);
    state.plate = [];
    state.flashServe = true;
    setToast(`Served ${order.dish}! +${earned}`);
    return EVENT_SERVED;
  }

  /** Bin everything on the plate. */
  function trashPlate() {
    if (state.plate.length === 0) return false;
    state.plate = [];
    state.combo = 0;
    setToast('Plate binned');
    return true;
  }

  /** True when the plate exactly matches any ticket on the board. */
  function plateMatches() {
    return state.orders.some((order) => sameMultiset(state.plate, order.needs));
  }

  /** The one ingredient the top ticket still needs that the plate does not yet have. */
  function nextNeeded() {
    for (const order of state.orders) {
      for (const need of order.needs) {
        if (countIn(state.plate, need) < countIn(order.needs, need)) return need;
      }
    }
    return null;
  }

  function step(dt) {
    if (state.over) return 0;
    let events = 0;
    state.timeLeft -= dt;
    if (state.toastTime > 0) state.toastTime -= dt;
    if (state.shake > 0) state.shake -= dt;
    if (state.flashServe) state.flashServe = false;

    for (const slot of state.grill) {
      if (slot.status === 'cooking' || slot.status === 'done') {
        slot.time += dt;
        if (slot.status === 'cooking' && slot.time >= GRILL_COOK_SECONDS) {
          slot.status = 'done';
          events |= EVENT_PATTY_DONE;
        } else if (slot.time >= GRILL_BURN_SECONDS) {
          slot.status = 'burnt';
        }
      }
    }

    state.spawnIn -= dt;
    if (state.spawnIn <= 0) {
      spawnOrder();
      state.spawnIn = ORDER_SPAWN_SECONDS;
    }

    for (let index = state.orders.length - 1; index >= 0; index -= 1) {
      const order = state.orders[index];
      order.patience -= dt;
      if (order.patience <= 0) {
        state.orders.splice(index, 1);
        state.hearts -= 1;
        state.combo = 0;
        events |= EVENT_ORDER_LOST;
        setToast(`${order.dish} walked out! -1 heart`);
        if (state.hearts <= 0) {
          state.over = true;
          events |= EVENT_OVER;
        }
      }
    }

    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.over = true;
      events |= EVENT_OVER;
    }
    return events;
  }

  // A fresh kitchen, ready to play, from the first line.
  reset();

  return {
    state,
    reset,
    addIngredient,
    startGrill,
    pressGrill,
    serve,
    trashPlate,
    plateMatches,
    nextNeeded,
    step,
    STEP,
  };
}
