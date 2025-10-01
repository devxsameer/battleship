// test.js
import Ship from "../modules/ship.js";

describe("Ship Class", () => {
  test("should create a ship with correct name and length", () => {
    const ship = new Ship("Battleship", 4);
    expect(ship.name).toBe("Battleship");
    expect(ship.length).toBe(4);
    expect(ship.hits).toBe(0);
  });

  test("should throw error if length is not a positive integer", () => {
    expect(() => new Ship("Invalid", 0)).toThrow(
      "Ship length must be a positive integer"
    );
    expect(() => new Ship("Invalid", -3)).toThrow(
      "Ship length must be a positive integer"
    );
    expect(() => new Ship("Invalid", 2.5)).toThrow(
      "Ship length must be a positive integer"
    );
    expect(() => new Ship("Invalid", "three")).toThrow(
      "Ship length must be a positive integer"
    );
  });

  test("hit() should increase hits count", () => {
    const ship = new Ship("Cruiser", 3);
    ship.hit();
    expect(ship.hits).toBe(1);
    ship.hit();
    expect(ship.hits).toBe(2);
  });

  test("hit() should not exceed ship length", () => {
    const ship = new Ship("Destroyer", 2);
    ship.hit();
    ship.hit();
    ship.hit(); // extra hit should not increase hits
    expect(ship.hits).toBe(2);
  });

  test("isSunk() should return false when not all parts are hit", () => {
    const ship = new Ship("Carrier", 5);
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(false);
  });

  test("isSunk() should return true when hits >= length", () => {
    const ship = new Ship("Submarine", 3);
    ship.hit();
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(true);
  });
});
