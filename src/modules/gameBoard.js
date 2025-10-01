// ==========================
// Game Board Class
// ==========================
import Ship from "./ship.js";
import { ATTACK_RESULTS, AXIS, BOARD_SIZE, SHIPS } from "./constants.js";

/**
 * Represents a player's 10x10 Battleship game board.
 * Handles ship placement, attack resolution, and victory conditions.
 */
class GameBoard {
  constructor() {
    // 10x10 grid:
    // Each cell = { state: "empty"|"ship"|"hit"|"miss"|"sunk", shipName?: string }
    this.board = Array.from({ length: BOARD_SIZE }, () =>
      Array.from({ length: BOARD_SIZE }, () => ({ state: "empty" }))
    );

    // fleet[shipName] = { ship: Ship, coordinates: [[row,col]], axis }
    this.fleet = {};

    // Axis → [rowIncrement, colIncrement]
    this.directions = {
      [AXIS.X]: [0, 1],
      [AXIS.Y]: [1, 0],
    };
  }

  // --------------------------
  // Ship Placement
  // --------------------------

  /**
   * Place a ship on the board at a given starting position and orientation.
   * @param {string} shipName - Name of the ship from SHIPS config.
   * @param {[number,number]} coords - Starting [row,col].
   * @param {"X"|"Y"} axis - Placement axis.
   * @returns {object} Ship placement details.
   * @throws {Error} If invalid ship name, duplicate placement, or invalid position.
   */
  setShip(shipName, [row, col], axis) {
    if (!SHIPS[shipName]) throw new Error(`Invalid ship: ${shipName}`);
    if (this.fleet[shipName]) throw new Error(`${shipName} already placed`);

    const ship = new Ship(shipName, SHIPS[shipName]);
    const coords = this._checkValidPlacement([row, col], ship.length, axis);

    coords.forEach(([r, c]) => {
      this.board[r][c] = { state: "ship", shipName };
    });

    this.fleet[shipName] = { ship, coordinates: coords, axis };
    return this.fleet[shipName];
  }

  /**
   * Validate placement: ensures cells are within bounds and not overlapping.
   * @private
   */
  _checkValidPlacement([row, col], length, axis) {
    const [dr, dc] = this.directions[axis];
    const coords = [];

    for (let i = 0; i < length; i++) {
      const r = row + dr * i;
      const c = col + dc * i;

      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) {
        throw new Error("Invalid placement: out of bounds");
      }
      if (this.board[r][c].state !== "empty") {
        throw new Error("Invalid placement: cell already occupied");
      }

      coords.push([r, c]);
    }
    return coords;
  }

  /**
   * Automatically place the full fleet (used for computer player).
   */
  autoPlaceFleet() {
    for (const shipName of Object.keys(SHIPS)) {
      let placed = false;
      while (!placed) {
        try {
          const axis = Math.random() < 0.5 ? AXIS.X : AXIS.Y;
          const row = Math.floor(Math.random() * BOARD_SIZE);
          const col = Math.floor(Math.random() * BOARD_SIZE);
          this.setShip(shipName, [row, col], axis);
          placed = true;
        } catch {
          // retry until valid placement
        }
      }
    }
  }

  // --------------------------
  // Attacks
  // --------------------------

  /**
   * Resolve an attack on this board.
   * @param {number} row - Row index.
   * @param {number} col - Column index.
   * @returns {object} Attack outcome with:
   *   - result {string} one of ATTACK_RESULTS
   *   - coordinates {[number,number]}
   *   - sunkShip {object} if a ship was sunk
   */
  receiveAttack(row, col) {
    const cell = this.board[row][col];

    // Prevent attacking same cell twice
    if (["miss", "hit", "sunk"].includes(cell.state)) {
      return { result: ATTACK_RESULTS.ALREADY, coordinates: [row, col] };
    }

    // Missed water
    if (cell.state === "empty") {
      this.board[row][col].state = "miss";
      return { result: ATTACK_RESULTS.MISS, coordinates: [row, col] };
    }

    // Hit a ship
    if (cell.state === "ship") {
      const { shipName } = cell;
      const ship = this.fleet[shipName].ship;
      ship.hit();

      this.board[row][col].state = "hit";

      // Ship damaged but not sunk
      if (!ship.isSunk()) {
        return { result: ATTACK_RESULTS.HIT, coordinates: [row, col] };
      }

      // Ship destroyed → mark all its cells as sunk
      this.fleet[shipName].coordinates.forEach(([r, c]) => {
        this.board[r][c].state = "sunk";
      });

      return {
        result: ATTACK_RESULTS.SUNK,
        coordinates: [row, col],
        sunkShip: this.fleet[shipName],
      };
    }
  }

  // --------------------------
  // Helpers
  // --------------------------

  /**
   * Check whether all ships have been placed.
   */
  allShipsPlaced() {
    return Object.keys(this.fleet).length === Object.keys(SHIPS).length;
  }

  /**
   * Check whether all ships on this board are sunk.
   */
  allShipsSunk() {
    return Object.values(this.fleet).every(({ ship }) => ship.isSunk());
  }
}

export default GameBoard;
