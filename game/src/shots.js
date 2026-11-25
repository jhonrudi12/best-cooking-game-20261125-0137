// The screenshot scenes behind ?shot=start|play|serve|end. Each one plays the real rules
// forward from a fresh kitchen for a fixed number of steps, steered by a small autopilot that
// builds what the top ticket asks for, grills its patties and serves it — so every frame is
// what a short game really looks like, and the same seed always gives the same frame.
import { GRILL_COOK_SECONDS, STEP } from './config.js';
import { EVENT_OVER } from './world.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

const START_SECONDS = 4;
const PLAY_SECONDS = 38;
const END_SECONDS = 170;
const SAMPLE = 1 / 30;

/** One autopilot move: serve when the plate matches, else add what the top ticket still needs. */
function autopilot(world) {
  const state = world.state;
  if (state.plate.length > 0 && world.plateMatches()) {
    world.serve();
    return;
  }
  const need = world.nextNeeded();
  if (!need) return;
  if (need === 'patty') {
    const done = state.grill.findIndex((slot) => slot.status === 'done');
    if (done !== -1) {
      world.pressGrill(done);
      return;
    }
    const cooking = state.grill.some((slot) => slot.status === 'cooking');
    if (!cooking) world.startGrill();
    return;
  }
  world.addIngredient(need);
}

/** Run the world forward for `seconds`, letting the autopilot cook once per sample step. */
function playForward(world, seconds) {
  const steps = Math.round(seconds / SAMPLE);
  for (let index = 0; index < steps; index += 1) {
    autopilot(world);
    if (world.step(SAMPLE) & EVENT_OVER) break;
  }
}

/**
 * Set `world` to the named scene and return the screen to draw over it and the best score.
 * start: the title card over a fresh kitchen. play: mid-rush, a dish half-built and a patty
 * on the grill. serve: a plate that exactly matches the top ticket, ready to serve. end: the
 * shift-over card after a full played shift.
 */
export function stageShot(name, world) {
  world.reset();
  if (name === 'serve') {
    const state = world.state;
    state.orders = [
      { id: 901, dish: 'Classic Ember', needs: ['bun', 'patty', 'lettuce', 'tomato'], patience: 38, maxPatience: 50 },
      { id: 902, dish: 'Cheesy Melt', needs: ['bun', 'patty', 'cheese', 'sauce'], patience: 24, maxPatience: 50 },
      { id: 903, dish: 'Garden Stack', needs: ['bun', 'lettuce', 'tomato', 'cheese', 'sauce'], patience: 44, maxPatience: 50 },
    ];
    state.plate = ['bun', 'patty', 'lettuce', 'tomato'];
    state.grill[0] = { status: 'done', time: GRILL_COOK_SECONDS };
    state.score = 340;
    state.coins = 34;
    state.combo = 2;
    state.bestCombo = 2;
    state.served = 3;
    state.timeLeft = 96;
    return { screen: SCREEN_PLAY, best: 0 };
  }
  if (name === 'play') {
    playForward(world, PLAY_SECONDS);
    // Guarantee the mid-assembly look: tickets on the board, a patty sizzling, the next
    // dish half-built on the plate — even if the autopilot just served everything.
    const state = world.state;
    const wanted = [
      { id: 911, dish: 'Classic Ember', needs: ['bun', 'patty', 'lettuce', 'tomato'], patience: 38 },
      { id: 912, dish: 'Smoky Deluxe', needs: ['bun', 'patty', 'cheese', 'tomato', 'sauce'], patience: 26 },
      { id: 913, dish: 'Cheesy Melt', needs: ['bun', 'patty', 'cheese', 'sauce'], patience: 44 },
    ];
    while (state.orders.length < 3) {
      const next = wanted[state.orders.length];
      state.orders.push({ ...next, maxPatience: 50 });
    }
    state.plate = ['bun', 'lettuce'];
    if (!state.grill.some((slot) => slot.status === 'cooking' || slot.status === 'done')) {
      state.grill[0] = { status: 'cooking', time: 3.5 };
    }
    return { screen: SCREEN_PLAY, best: 0 };
  }
  if (name === 'end') {
    playForward(world, END_SECONDS);
    const state = world.state;
    state.toast = '';
    state.toastTime = 0;
    if (!state.over) {
      state.timeLeft = 0.01;
      world.step(0.02);
    }
    return { screen: SCREEN_OVER, best: Math.max(0, state.score) };
  }
  for (let index = 0; index < START_SECONDS / STEP; index += 1) world.step(STEP);
  return { screen: SCREEN_TITLE, best: 0 };
}
