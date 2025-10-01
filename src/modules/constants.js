// ==========================
// Game Constants
// ==========================

/**
 * Standardized results for an attack on the game board.
 * Used to unify logic across game controller and UI.
 */
export const ATTACK_RESULTS = Object.freeze({
  MISS: "miss", // Shot landed in water
  HIT: "hit", // Ship was hit but not sunk
  SUNK: "sunk", // Entire ship destroyed
  ALREADY: "already", // Cell was already attacked
});

/**
 * Ship placement directions.
 * X → Horizontal, Y → Vertical.
 */
export const AXIS = Object.freeze({
  X: "X",
  Y: "Y",
});

/**
 * Default size of the game board.
 * Battleship uses a 10x10 grid.
 */
export const BOARD_SIZE = 10;

/**
 * Fleet configuration.
 * Key: ship name, Value: ship length.
 * This defines the standard set of ships for the game.
 */
export const SHIPS = Object.freeze({
  carrier: 5,
  battleship: 4,
  destroyer: 3,
  submarine: 3,
  patrolBoat: 2,
});
