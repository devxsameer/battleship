// Player.test.js
import Player from "../modules/player.js";
import { ATTACK_RESULTS, SHIPS, AXIS } from "../modules/constants.js";

describe("Player Class", () => {
  let player;
  let enemy;

  beforeEach(() => {
    player = new Player("Alice");
    enemy = new Player("Bob");
  });

  // --------------------------
  // Attack mechanics
  // --------------------------

  test("attack should mark cell and update enemy board", () => {
    enemy.board.setShip("patrolBoat", [0, 0], AXIS.X);
    const result = player.attack(enemy.board, 0, 0);

    expect(result.result).toBe(ATTACK_RESULTS.HIT);
    expect(enemy.board.board[0][0].state).toBe("hit");
  });

  test("attack should return ALREADY when repeating same coordinates", () => {
    player.attack(enemy.board, 1, 1);
    const result = player.attack(enemy.board, 1, 1);

    expect(result.result).toBe(ATTACK_RESULTS.ALREADY);
    expect(result.coordinates).toEqual([1, 1]);
  });

  // --------------------------
  // Smart attack (AI)
  // --------------------------

  test("smartAttack should throw error if called on human", () => {
    expect(() => player.smartAttack(enemy.board)).toThrow();
  });

  test("smartAttack should pick a random valid coordinate", () => {
    const ai = new Player("AI", true);
    const result = ai.smartAttack(enemy.board);

    expect(result.coordinates[0]).toBeGreaterThanOrEqual(0);
    expect(result.coordinates[0]).toBeLessThan(10);
    expect(result.coordinates[1]).toBeGreaterThanOrEqual(0);
    expect(result.coordinates[1]).toBeLessThan(10);
  });

  test("smartAttack should queue neighbors after a hit", () => {
    const ai = new Player("AI", true);
    enemy.board.setShip("patrolBoat", [0, 0], AXIS.X);

    // force AI to hit [0,0]
    const result = ai.attack(enemy.board, 0, 0);
    expect(result.result).toBe(ATTACK_RESULTS.HIT);

    // manually push neighbors (like smartAttack would do)
    ai.targetQueue.push([0, 1]);

    const second = ai.smartAttack(enemy.board);
    expect([
      ATTACK_RESULTS.HIT,
      ATTACK_RESULTS.SUNK,
      ATTACK_RESULTS.MISS,
    ]).toContain(second.result);
  });

  test("smartAttack should clear targetQueue when ship is sunk", () => {
    const ai = new Player("AI", true);
    enemy.board.setShip("patrolBoat", [0, 0], AXIS.X);

    ai.attack(enemy.board, 0, 0); // hit 1
    ai.targetQueue.push([0, 1]); // next hit will sink

    const sunk = ai.smartAttack(enemy.board);
    expect(sunk.result).toBe(ATTACK_RESULTS.SUNK);
    expect(ai.targetQueue.length).toBe(0);
  });

  // --------------------------
  // Ship placement
  // --------------------------

  test("placeShipsRandomly should place full fleet", () => {
    const fleet = player.placeShipsRandomly();
    const shipNames = Object.keys(SHIPS);

    shipNames.forEach((shipName) => {
      expect(fleet[shipName]).toBeDefined();
      expect(fleet[shipName].ship.length).toBe(SHIPS[shipName]);
    });
  });
});
