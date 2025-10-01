// ==========================
// Player Class
// ==========================
import GameBoard from "./gameBoard.js";
import { ATTACK_RESULTS, BOARD_SIZE } from "./constants.js";

/**
 * Represents a human or computer player.
 * Tracks their own board and attacks against an opponent.
 */
class Player {
  constructor(name = "Player", isComputer = false) {
    this.name = name;
    this.isComputer = isComputer;
    this.board = new GameBoard();

    // Track previous attacks to avoid duplicates
    this.attacks = new Set();

    // Used by AI for smarter targeting
    this.targetQueue = [];
  }

  // --------------------------
  // Attacks
  // --------------------------

  /**
   * Perform an attack on the opponent’s board.
   * Returns both raw result + user-friendly message.
   */
  attack(enemyBoard, row, col) {
    const key = `${row},${col}`;
    if (this.attacks.has(key)) {
      return {
        result: ATTACK_RESULTS.ALREADY,
        coordinates: [row, col],
        message: `${this.name} already fired at (${row}, ${col}).`,
      };
    }

    this.attacks.add(key);
    const outcome = enemyBoard.receiveAttack(row, col);

    // Attach player context + message
    return {
      ...outcome,
      message: this._buildAttackMessage(outcome, row, col),
    };
  }

  /**
   * Smarter AI: prioritizes neighbors after a hit.
   */
  smartAttack(enemyBoard) {
    if (!this.isComputer) {
      throw new Error("smartAttack should only be called for AI players");
    }

    let coords;

    // Use queued neighbor targets first
    while (this.targetQueue.length > 0) {
      const [r, c] = this.targetQueue.shift();
      if (
        r >= 0 &&
        r < BOARD_SIZE &&
        c >= 0 &&
        c < BOARD_SIZE &&
        !this.attacks.has(`${r},${c}`)
      ) {
        coords = [r, c];
        break;
      }
    }

    // Otherwise pick random
    if (!coords) {
      do {
        coords = [
          Math.floor(Math.random() * BOARD_SIZE),
          Math.floor(Math.random() * BOARD_SIZE),
        ];
      } while (
        this.attacks.has(`${coords[0]},${coords[1]}`) &&
        this.attacks.size < BOARD_SIZE ** 2
      );
    }

    const result = this.attack(enemyBoard, coords[0], coords[1]);

    // Queue up adjacent cells if hit
    if (result.result === ATTACK_RESULTS.HIT) {
      const [r, c] = coords;
      this.targetQueue.push([r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]);
    }

    // Reset queue on sunk
    if (result.result === ATTACK_RESULTS.SUNK) {
      this.targetQueue = [];
    }

    return result;
  }

  // --------------------------
  // Ship Placement
  // --------------------------

  /**
   * Randomly place entire fleet (used for AI).
   */
  placeShipsRandomly() {
    this.board.autoPlaceFleet();
    return this.board.fleet;
  }

  // --------------------------
  // Helpers
  // --------------------------

  /**
   * Build a descriptive attack message for UI/console.
   */
  _buildAttackMessage(outcome, row, col) {
    switch (outcome.result) {
      case ATTACK_RESULTS.MISS:
        return `${this.name} fired at (${row}, ${col}) and missed.`;
      case ATTACK_RESULTS.HIT:
        return `${this.name} scored a hit at (${row}, ${col})!`;
      case ATTACK_RESULTS.SUNK:
        return `${this.name} sunk the ${outcome.sunkShip.ship.name} at (${row}, ${col})!`;
      case ATTACK_RESULTS.ALREADY:
        return `${this.name} already fired at (${row}, ${col}).`;
      default:
        return `${this.name} fired at (${row}, ${col}).`;
    }
  }
}

export default Player;
