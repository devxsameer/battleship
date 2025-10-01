// ==========================
// Ship Class
// ==========================

/**
 * Represents a single ship in the Battleship game.
 * Tracks its name, length, current hits, and sunk status.
 */
class Ship {
  /**
   * @param {string} name - Name/identifier of the ship (e.g., "Battleship").
   * @param {number} length - Length of the ship in cells. Must be a positive integer.
   * @throws {Error} If length is not a positive integer.
   */
  constructor(name, length) {
    if (!Number.isInteger(length) || length < 1) {
      throw new Error("Ship length must be a positive integer");
    }

    this.name = name;
    this.length = length;
    this.hits = 0;
  }

  /**
   * Register a hit on this ship.
   * Prevents hits from exceeding the ship's length.
   */
  hit() {
    if (this.hits < this.length) {
      this.hits++;
    }
  }

  /**
   * Check whether the ship is sunk.
   * @returns {boolean} True if the number of hits equals or exceeds length.
   */
  isSunk() {
    return this.hits >= this.length;
  }
}

export default Ship;
