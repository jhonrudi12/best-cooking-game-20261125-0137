// Boot and the one loop: input is read every frame, the world advances in fixed 1/60 s steps
// (several in a slow frame, none in a fast one), and the renderer paints what is there. The game
// moves between four screens: title, play, paused and game over.
//
// ?seed=N fixes the order pattern. ?shot=start|play|serve|end (with &seed=N) stages that scene
// instead of running the loop, paints it twice and sets window.__shotReady for a screenshot.
import { BEST_KEY, STEP } from './config.js';
import { createRandom } from './random.js';
import { createWorld, EVENT_FAILED_SERVE, EVENT_ORDER_LOST, EVENT_OVER, EVENT_PATTY_DONE, EVENT_SERVED } from './world.js';
import {
  ACTION_CONFIRM,
  ACTION_GRILL,
  ACTION_PAUSE,
  ACTION_SERVE,
  ACTION_TRASH,
  createInput,
} from './input.js';
import { createAudio } from './audio.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall (a hidden tab) is dropped, not replayed. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);
const audio = createAudio();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best, false);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas, (ingredient) => {
    audio.unlock();
    if (screen !== SCREEN_PLAY) return;
    if (world.addIngredient(ingredient)) audio.add();
    else audio.click();
  });
  let screen = SCREEN_TITLE;
  let best = readBest();
  let muted = false;
  let accumulator = 0;
  let last = performance.now();

  // Screen readers (and anyone watching the page's text) hear the screen changes and each serve.
  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    world.reset();
    accumulator = 0;
    screen = SCREEN_PLAY;
    audio.unlock();
    audio.startSizzle();
    announce(`Playing. ${world.state.hearts} hearts. Serve the tickets before they walk out.`);
  }

  function endGame() {
    screen = SCREEN_OVER;
    audio.stopSizzle();
    audio.over();
    if (world.state.score > best) {
      best = world.state.score;
      saveBest(best);
    }
    announce(`Shift over. Score ${world.state.score}. Dishes served ${world.state.served}. Best ${best}.`);
  }

  function handleEvents(events) {
    if (events & EVENT_SERVED) audio.served();
    if (events & EVENT_FAILED_SERVE) audio.failed();
    if (events & EVENT_PATTY_DONE) audio.pattyDone();
    if (events & EVENT_ORDER_LOST) audio.lost();
    if (events & EVENT_OVER) endGame();
  }

  /** Route one click to the grill, the plate buttons, the pantry or the mute toggle. */
  function handleClick(point) {
    audio.unlock();
    const zones = renderer.zones;
    if (point.x >= zones.mute.x && point.x <= zones.mute.x + zones.mute.w &&
        point.y >= zones.mute.y && point.y <= zones.mute.y + zones.mute.h) {
      muted = audio.toggleMute();
      return;
    }
    if (screen === SCREEN_TITLE || screen === SCREEN_OVER) {
      startGame();
      return;
    }
    if (screen !== SCREEN_PLAY) return;
    for (const [id, zone] of Object.entries(zones.bins)) {
      if (point.x >= zone.x && point.x <= zone.x + zone.w && point.y >= zone.y && point.y <= zone.y + zone.h) {
        if (world.addIngredient(id)) audio.add();
        else audio.click();
        return;
      }
    }
    for (let slot = 0; slot < zones.grill.length; slot += 1) {
      const zone = zones.grill[slot];
      if (point.x >= zone.x && point.x <= zone.x + zone.w && point.y >= zone.y && point.y <= zone.y + zone.h) {
        if (world.pressGrill(slot)) audio.add();
        else audio.click();
        return;
      }
    }
    const serve = zones.serve;
    if (point.x >= serve.x && point.x <= serve.x + serve.w && point.y >= serve.y && point.y <= serve.y + serve.h) {
      handleEvents(world.serve());
      return;
    }
    const trash = zones.trash;
    if (point.x >= trash.x && point.x <= trash.x + trash.w && point.y >= trash.y && point.y <= trash.y + trash.h) {
      if (world.trashPlate()) audio.click();
    }
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_CONFIRM && (screen === SCREEN_TITLE || screen === SCREEN_OVER)) startGame();
    else if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      audio.stopSizzle();
      announce('Paused.');
    } else if (actions & (ACTION_PAUSE | ACTION_CONFIRM) && screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      audio.startSizzle();
      announce('Playing.');
    } else if (actions & ACTION_SERVE && screen === SCREEN_PLAY) {
      handleEvents(world.serve());
    } else if (actions & ACTION_TRASH && screen === SCREEN_PLAY) {
      world.trashPlate();
    } else if (actions & ACTION_GRILL && screen === SCREEN_PLAY) {
      world.startGrill();
    }
    for (const point of input.takeClicks()) handleClick(point);
  }

  function step() {
    if (screen === SCREEN_TITLE) {
      world.step(STEP);
      return;
    }
    handleEvents(world.step(STEP));
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    if (screen === SCREEN_TITLE || screen === SCREEN_PLAY) {
      while (accumulator >= STEP && (screen === SCREEN_TITLE || screen === SCREEN_PLAY)) {
        step();
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world.state, screen, best, muted);
  }

  // Leaving the tab pauses a running game rather than letting tickets expire unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      audio.stopSizzle();
      announce('Paused.');
    }
  });

  // M toggles sound without a button of its own.
  window.addEventListener('keydown', (event) => {
    if (event.code === 'KeyM' && !event.repeat) muted = audio.toggleMute();
  });

  announce('Ember and Thyme Bistro Rush. Press Enter or click to start your shift.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
