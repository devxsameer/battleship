// GameBoard.test.js
import GameBoard from "../modules/gameBoard.js";
import Ship from "../modules/ship.js";
import {
  ATTACK_RESULTS,
  AXIS,
  BOARD_SIZE,
  SHIPS,
} from "../modules/constants.js";

describe("GameBoard Class", () => {
  let board;

  beforeEach(() => {
    board = new GameBoard();
  });

  // --------------------------
  // Placement
  // --------------------------

  test("should place a valid ship correctly", () => {
    const placement = board.setShip("destroyer", [0, 0], AXIS.X);
    expect(placement.ship).toBeInstanceOf(Ship);
    expect(board.board[0][0].state).toBe("ship");
    expect(board.board[0][1].state).toBe("ship");
  });

  test("should not allow placing the same ship twice", () => {
    board.setShip("destroyer", [0, 0], AXIS.X);
    expect(() => board.setShip("destroyer", [2, 2], AXIS.Y)).toThrow(
      "destroyer already placed"
    );
  });

  test("should throw if ship goes out of bounds", () => {
    expect(() =>
      board.setShip("battleship", [0, BOARD_SIZE - 1], AXIS.X)
    ).toThrow("Invalid placement: out of bounds");
  });

  test("should throw if placement overlaps another ship", () => {
    board.setShip("submarine", [0, 0], AXIS.X);
    expect(() => board.setShip("destroyer", [0, 0], AXIS.Y)).toThrow(
      "Invalid placement: cell already occupied"
    );
  });

  // --------------------------
  // Attacks
  // --------------------------

  test("should return MISS when attacking empty water", () => {
    const result = board.receiveAttack(0, 0);
    expect(result).toEqual({
      result: ATTACK_RESULTS.MISS,
      coordinates: [0, 0],
    });
    expect(board.board[0][0].state).toBe("miss");
  });

  test("should return HIT when attacking a ship", () => {
    board.setShip("destroyer", [0, 0], AXIS.X);
    const result = board.receiveAttack(0, 0);
    expect(result).toEqual({ result: ATTACK_RESULTS.HIT, coordinates: [0, 0] });
    expect(board.board[0][0].state).toBe("hit");
  });

  test("should return SUNK when last part of ship is hit", () => {
    board.setShip("patrolBoat", [0, 0], AXIS.X); // length 2
    board.receiveAttack(0, 0);
    const result = board.receiveAttack(0, 1);
    expect(result.result).toBe(ATTACK_RESULTS.SUNK);
    expect(result.sunkShip.ship.isSunk()).toBe(true);
    expect(board.board[0][0].state).toBe("sunk");
    expect(board.board[0][1].state).toBe("sunk");
  });

  test("should return ALREADY if attacking the same cell twice", () => {
    board.setShip("destroyer", [0, 0], AXIS.X);
    board.receiveAttack(0, 0);
    const result = board.receiveAttack(0, 0);
    expect(result).toEqual({
      result: ATTACK_RESULTS.ALREADY,
      coordinates: [0, 0],
    });
  });

  // --------------------------
  // Fleet helpers
  // --------------------------

  test("allShipsPlaced should return true after placing all ships", () => {
    Object.keys(SHIPS).forEach((shipName, i) => {
      board.setShip(shipName, [i, 0], AXIS.X);
    });
    expect(board.allShipsPlaced()).toBe(true);
  });

  test("allShipsSunk should return true after all ships sunk", () => {
    board.setShip("patrolBoat", [0, 0], AXIS.X);
    board.receiveAttack(0, 0);
    board.receiveAttack(0, 1);
    expect(board.allShipsSunk()).toBe(true);
  });

  test("autoPlaceFleet should place all ships without error", () => {
    board.autoPlaceFleet();
    expect(board.allShipsPlaced()).toBe(true);
  });
});
