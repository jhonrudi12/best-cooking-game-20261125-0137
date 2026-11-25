// A tiny seeded generator (mulberry32) so a screenshot seed always deals the same orders.
export function createRandom(seed) {
  let state = (seed >>> 0) || 0x9e3779b9;
  function next() {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), state | 1);
    value = (value + Math.imul(value ^ (value >>> 7), value | 61)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  }
  return {
    next,
    /** Integer in [0, max). */
    int(max) {
      return Math.floor(next() * max);
    },
    /** Pick one entry of `list`. */
    pick(list) {
      return list[Math.floor(next() * list.length)];
    },
  };
}
