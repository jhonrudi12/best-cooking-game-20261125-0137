// Ember & Thyme — Bistro Rush: keyboard and mouse. The canvas reports clicks in logical
// 1280x800 coordinates (the renderer owns the scale), and keys map to pantry bins, the grill,
// serving and pausing. Actions are drained once per frame by main.js.
export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_SERVE = 4;
export const ACTION_TRASH = 8;
export const ACTION_GRILL = 16;

const KEY_INGREDIENT = {
  Digit1: 'bun',
  Digit2: 'patty',
  Digit3: 'lettuce',
  Digit4: 'tomato',
  Digit5: 'cheese',
  Digit6: 'sauce',
  Numpad1: 'bun',
  Numpad2: 'patty',
  Numpad3: 'lettuce',
  Numpad4: 'tomato',
  Numpad5: 'cheese',
  Numpad6: 'sauce',
};

export function createInput(canvas, onIngredient) {
  let actions = 0;
  let direction = 0;
  const clicks = [];

  function logicalPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 1280,
      y: ((event.clientY - rect.top) / rect.height) * 800,
    };
  }

  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    clicks.push(logicalPoint(event));
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const ingredient = KEY_INGREDIENT[event.code];
    if (ingredient) {
      onIngredient(ingredient);
      event.preventDefault();
      return;
    }
    if (event.code === 'Space' || event.code === 'Enter') {
      actions |= ACTION_CONFIRM;
      event.preventDefault();
    } else if (event.code === 'KeyP' || event.code === 'Escape') {
      actions |= ACTION_PAUSE;
      event.preventDefault();
    } else if (event.code === 'KeyS') {
      actions |= ACTION_SERVE;
    } else if (event.code === 'KeyG') {
      actions |= ACTION_GRILL;
    } else if (event.code === 'Backspace' || event.code === 'Delete') {
      actions |= ACTION_TRASH;
      event.preventDefault();
    } else if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
      direction = -1;
    } else if (event.code === 'ArrowRight' || event.code === 'KeyD') {
      direction = 1;
    }
  });

  window.addEventListener('keyup', (event) => {
    if ((event.code === 'ArrowLeft' || event.code === 'KeyA') && direction === -1) direction = 0;
    if ((event.code === 'ArrowRight' || event.code === 'KeyD') && direction === 1) direction = 0;
  });

  return {
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    takeClicks() {
      return clicks.splice(0, clicks.length);
    },
    direction() {
      return direction;
    },
  };
}
