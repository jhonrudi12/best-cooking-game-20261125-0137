// Ember & Thyme — Bistro Rush: every tunable number and the menu live here, so the
// kitchen can be rebalanced without touching the rules in world.js or the drawing in render.js.
export const VIEW = { width: 1280, height: 800 };

// One shift lasts two and a half minutes of real play.
export const SHIFT_SECONDS = 150;
export const MAX_ORDERS = 3;
export const ORDER_SPAWN_SECONDS = 14;
export const ORDER_PATIENCE_SECONDS = 50;
export const GRILL_COOK_SECONDS = 6;
export const GRILL_BURN_SECONDS = 13;
export const HEARTS = 3;

// The pantry: id, display name, keyboard key, colour and what it looks like on a plate.
export const INGREDIENTS = [
  { id: 'bun', name: 'Bun', key: '1', color: '#e8a54b', dark: '#b97a28', shape: 'bun' },
  { id: 'patty', name: 'Patty', key: '2', color: '#7a4a21', dark: '#54330f', shape: 'patty' },
  { id: 'lettuce', name: 'Lettuce', key: '3', color: '#58b368', dark: '#2f7d3d', shape: 'lettuce' },
  { id: 'tomato', name: 'Tomato', key: '4', color: '#e5484d', dark: '#a92c31', shape: 'tomato' },
  { id: 'cheese', name: 'Cheese', key: '5', color: '#f5c542', dark: '#c79a17', shape: 'cheese' },
  { id: 'sauce', name: 'Sauce', key: '6', color: '#f0821f', dark: '#b35c0d', shape: 'sauce' },
];

export const INGREDIENT_BY_ID = Object.fromEntries(INGREDIENTS.map((item) => [item.id, item]));

// The menu: each dish is a multiset of ingredients. A plate serves an order only when its
// contents match a ticket exactly, patty included, so the grill always matters.
export const DISHES = [
  { name: 'Classic Ember', needs: ['bun', 'patty', 'lettuce', 'tomato'], price: 120, tip: 40 },
  { name: 'Cheesy Melt', needs: ['bun', 'patty', 'cheese', 'sauce'], price: 130, tip: 45 },
  { name: 'Garden Stack', needs: ['bun', 'lettuce', 'tomato', 'cheese', 'sauce'], price: 110, tip: 35 },
  { name: 'Double Trouble', needs: ['bun', 'patty', 'patty', 'cheese'], price: 160, tip: 55 },
  { name: 'Smoky Deluxe', needs: ['bun', 'patty', 'cheese', 'tomato', 'sauce'], price: 170, tip: 60 },
];

export const DISH_BY_NAME = Object.fromEntries(DISHES.map((dish) => [dish.name, dish]));

// Fixed step for the simulation, so screenshots staged from a seed always land the same way.
export const STEP = 1 / 60;
export const BEST_KEY = 'ember-and-thyme-best';
