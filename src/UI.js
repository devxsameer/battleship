// ui.js
import Render from "./Render.js";
import "./css/gameBoard.css";
import {
  ATTACK_RESULTS,
  AXIS,
  SHIPS,
  BOARD_SIZE,
} from "./modules/constants.js";
import Player from "./modules/player.js";

const UI = {
  mainContainer: document.querySelector(".main-container"),
  humanBoard: document.querySelector(".human-board"),
  computerBoard: document.querySelector(".computer-board"),
  shipsSelection: document.querySelector(".ships-selection"),
  infoEl: document.querySelector(".info"),
  axisBtn: document.querySelector(".axis-btn"),
  startGameBtn: document.querySelector(".start-game-btn"),
  clearBoardBtn: document.querySelector(".clear-board-btn"),
  playAgainBtn: document.querySelector(".play-again-btn"),
  popUp: document.querySelector(".pop-up"),
  popUpInput: document.querySelector(".pop-up input"),
  confirmNameBtn: document.querySelector(".confirm-name-btn"),

  selectedShip: "carrier",
  axis: AXIS.X,
  gameStarted: false,
  playerName: "Commander Erwin",

  init() {
    Render.drawBoard(this.humanBoard, BOARD_SIZE);
    Render.drawBoard(this.computerBoard, BOARD_SIZE);

    // initial selection UI state
    this.shipsSelection
      .querySelectorAll(".ship")
      .forEach((el) => el.classList.remove("selected", "disabled"));
    this.shipsSelection
      .querySelector(`[data-ship="${this.selectedShip}"]`)
      ?.classList.add("selected");
    Render.showInfo(this.infoEl, `Place your ${this.selectedShip}!`);

    // --------------------------
    // Event Listeners
    // --------------------------

    // Ship selection
    this.shipsSelection.addEventListener("click", (e) => {
      const shipEl = e.target.closest(".ship");
      if (!shipEl || shipEl.classList.contains("disabled")) return;

      this.shipsSelection
        .querySelector(".ship.selected")
        ?.classList.remove("selected");
      this.selectedShip = shipEl.dataset.ship;
      shipEl.classList.add("selected");
      Render.showInfo(this.infoEl, `Place your ${this.selectedShip}!`);
    });

    // Hover preview (mouse over)
    this.humanBoard.addEventListener("mouseover", (e) => {
      if (this.gameStarted) return; // no previews after game start
      const cell = e.target.closest(".box");
      if (!cell) return;
      const row = +cell.dataset.row;
      const col = +cell.dataset.column;
      this._showPlacementPreview(row, col);
    });

    // Remove preview on mouseout or focus change
    this.humanBoard.addEventListener("mouseout", () =>
      Render.clearPreviews(this.humanBoard)
    );

    // Keyboard support: place ship with Enter when focused on a box
    this.humanBoard.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      if (this.gameStarted) return;
      const cell = e.target.closest(".box");
      if (!cell) return;
      const row = +cell.dataset.row;
      const col = +cell.dataset.column;
      this.handlePlaceShipOnHumanBoard(row, col, this.selectedShip);
    });

    // Place ship (click)
    this.humanBoard.addEventListener("click", (e) => {
      if (this.gameStarted) return;
      const cell = e.target.closest(".box");
      if (!cell) return;
      const row = +cell.dataset.row;
      const col = +cell.dataset.column;
      this.handlePlaceShipOnHumanBoard(row, col, this.selectedShip);
    });

    // Change Axis
    this.axisBtn.addEventListener("click", () => {
      this.axis = this.axis === AXIS.X ? AXIS.Y : AXIS.X;
      this.axisBtn.innerText =
        this.axis === AXIS.X ? "Axis: Horizontal" : "Axis: Vertical";
    });

    // Confirm player name
    this.confirmNameBtn.addEventListener("click", () => {
      const val = this.popUpInput.value;
      if (val?.trim()) this.playerName = val.trim();
      this.player = new Player(this.playerName);
      this.popUp.classList.remove("initial");
      Render.hidePopUp();
    });

    // Start Game
    this.startGameBtn.addEventListener("click", () => this.startGame());

    // Clear Board
    this.clearBoardBtn.addEventListener("click", () => this.resetBoard());

    // Play Again
    this.playAgainBtn.addEventListener("click", () => this.resetBoard(true));

    // Attack via clicking computer board (supports keyboard enter since cells have tabindex)
    this.computerBoard.addEventListener("click", (e) => {
      if (!this.gameStarted) return;
      const cell = e.target.closest(".box");
      if (!cell) return;
      const row = +cell.dataset.row;
      const col = +cell.dataset.column;
      this.handleAttack(row, col);
    });
    this.computerBoard.addEventListener("keydown", (e) => {
      if (!this.gameStarted || e.key !== "Enter") return;
      const cell = e.target.closest(".box");
      if (!cell) return;
      const row = +cell.dataset.row;
      const col = +cell.dataset.column;
      this.handleAttack(row, col);
    });
  },

  /**
   * Show placement preview for the selectedShip at start coords (row,col).
   * Produces preview or preview-invalid depending on bounds/occupancy.
   */
  _showPlacementPreview(row, col) {
    Render.clearPreviews(this.humanBoard);

    const length = SHIPS[this.selectedShip];

    let valid = true;
    const coords = [];

    for (let i = 0; i < length; i++) {
      const r = this.axis === AXIS.X ? row : row + i;
      const c = this.axis === AXIS.X ? col + i : col;

      // out of bounds => invalid
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) {
        valid = false;
        break;
      }

      const cell = this.humanBoard.querySelector(
        `.box[data-row="${r}"][data-column="${c}"]`
      );
      // if already placed, invalid
      if (!cell || cell.classList.contains("placed")) {
        valid = false;
      }
      coords.push([r, c]);
    }

    coords.forEach(([r, c]) => {
      const cell = this.humanBoard.querySelector(
        `.box[data-row="${r}"][data-column="${c}"]`
      );
      if (!cell) return;
      cell.classList.add(valid ? "preview" : "preview-invalid");
    });
  },

  handlePlaceShipOnHumanBoard(row, column, shipName) {
    try {
      const { ship, coordinates, axis } = this.player.board.setShip(
        shipName,
        [row, column],
        this.axis
      );

      // render placed ship (human ships visible)
      Render.renderShipOnBoard(this.humanBoard, coordinates, axis, ship, false);
      Render.clearPreviews(this.humanBoard);
      this.selectNextShip(shipName);
    } catch (err) {
      // user-visible friendly message (use A1 labels)
      const label = Render.coordToLabel([row, column]);
      Render.showInfo(this.infoEl, `${err.message} (at ${label})`);
    }
  },

  selectNextShip(shipName) {
    const shipEl = this.shipsSelection.querySelector(
      `[data-ship="${shipName}"]`
    );
    if (!shipEl) return;

    shipEl.classList.remove("selected");
    shipEl.classList.add("disabled");

    const nextShipEl = this.shipsSelection.querySelector(
      ".ship:not(.disabled)"
    );
    if (!nextShipEl) {
      Render.showInfo(
        this.infoEl,
        "All ships placed! Ready to start the game."
      );
      this.humanBoard.classList.add("placed");
      return;
    }

    nextShipEl.classList.add("selected");
    this.selectedShip = nextShipEl.dataset.ship;
    Render.showInfo(this.infoEl, `Place your ${this.selectedShip}!`);
  },

  startGame() {
    // require player instance (created when name is confirmed or during reset)
    if (!this.player) this.player = new Player(this.playerName);

    this.cPlayer = new Player("AI", true);
    const fleet = this.cPlayer.placeShipsRandomly();

    // Render AI ships but keep them visually hidden (CSS .hidden-ship)
    Object.values(fleet).forEach(({ ship, coordinates, axis }) => {
      Render.renderShipOnBoard(
        this.computerBoard,
        coordinates,
        axis,
        ship,
        true /* hidden */
      );
    });

    this.gameStarted = true;
    this.mainContainer.classList.remove("initial");
    Render.showInfo(this.infoEl, "Game Started! Attack the AI!");
  },

  handleAttack(row, column) {
    // Ensure the game is started
    if (!this.gameStarted) {
      Render.showInfo(this.infoEl, "Start the game first!");
      return;
    }

    const hResult = this.player.attack(this.cPlayer.board, row, column);

    // Already attacked
    if (hResult.result === ATTACK_RESULTS.ALREADY) {
      Render.showInfo(this.infoEl, "Already attacked this spot. Try another!");
      return;
    }

    // If we sunk a ship, mark every part of the sunk ship
    if (hResult.result === ATTACK_RESULTS.SUNK && hResult.sunkShip) {
      const sunkCoords = hResult.sunkShip.coordinates;
      Render.renderAttack(this.computerBoard, hResult.result, sunkCoords, {
        shipName: hResult.sunkShip.ship.name,
      });
      Render.showInfo(
        this.infoEl,
        `You sunk the enemy ${hResult.sunkShip.ship.name}!`
      );
    } else {
      // single cell hit/miss
      Render.renderAttack(
        this.computerBoard,
        hResult.result,
        hResult.coordinates
      );
      if (hResult.result === ATTACK_RESULTS.HIT) {
        Render.showInfo(
          this.infoEl,
          `Hit at ${Render.coordToLabel(hResult.coordinates)}!`
        );
      } else if (hResult.result === ATTACK_RESULTS.MISS) {
        Render.showInfo(
          this.infoEl,
          `Miss at ${Render.coordToLabel(hResult.coordinates)}.`
        );
      }
    }

    // Win check for player
    if (this.cPlayer.board.allShipsSunk()) {
      Render.renderPopUp(`${this.playerName} wins!`);
      this.gameStarted = false;
      return;
    }

    // Add AI delay for realism
    setTimeout(() => {
      const cResult = this.cPlayer.smartAttack(this.player.board);

      if (cResult.result === ATTACK_RESULTS.SUNK && cResult.sunkShip) {
        const sunkCoords = cResult.sunkShip.coordinates;
        Render.renderAttack(this.humanBoard, ATTACK_RESULTS.SUNK, sunkCoords, {
          shipName: cResult.sunkShip.ship.name,
        });
        Render.showInfo(
          this.infoEl,
          `AI sunk your ${cResult.sunkShip.ship.name}!`
        );
      } else {
        Render.renderAttack(
          this.humanBoard,
          cResult.result,
          cResult.coordinates
        );
        if (cResult.result === ATTACK_RESULTS.HIT) {
          Render.showInfo(
            this.infoEl,
            `AI hit at ${Render.coordToLabel(cResult.coordinates)}!`
          );
        } else if (cResult.result === ATTACK_RESULTS.MISS) {
          Render.showInfo(
            this.infoEl,
            `AI missed at ${Render.coordToLabel(cResult.coordinates)}.`
          );
        }
      }

      // Win check for AI
      if (this.player.board.allShipsSunk()) {
        Render.renderPopUp("AI wins!");
        this.gameStarted = false;
        return;
      }
    }, 1000); // <-- 1 second "thinking" delay
  },

  resetBoard(playAgain = false) {
    Render.drawBoard(this.humanBoard, BOARD_SIZE);
    Render.drawBoard(this.computerBoard, BOARD_SIZE);

    // create fresh player
    this.player = new Player(this.playerName);
    this.selectedShip = "carrier";
    this.gameStarted = false;

    // reset ship selection UI
    this.shipsSelection.querySelectorAll(".ship").forEach((shipEl) => {
      shipEl.classList.remove("disabled", "selected");
    });
    this.shipsSelection
      .querySelector(`[data-ship="${this.selectedShip}"]`)
      ?.classList.add("selected");

    this.humanBoard.classList.remove("placed");
    Render.showInfo(this.infoEl, "Game reset. Place your ships!");

    if (playAgain) {
      this.mainContainer.classList.add("initial");
      Render.hidePopUp();
    }
  },
};

export default UI;
