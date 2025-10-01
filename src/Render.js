// Render.js
import { ATTACK_RESULTS, BOARD_SIZE } from "./modules/constants.js";
import Typed from "typed.js";

/**
 * Render Utility
 * Handles all DOM updates for the game UI.
 *
 * Notes:
 * - Uses BOARD_SIZE constant (no hard-coded 10).
 * - Methods are defensive (null checks).
 * - renderAttack can mark a single coord or multiple coords (useful for sunk ships).
 */
const Render = {
  popUp: document.querySelector(".pop-up"),

  /**
   * Draws an empty N x N grid inside the given container.
   * Each cell receives role=gridcell and tabindex for accessibility.
   */
  drawBoard(container, size = BOARD_SIZE) {
    if (!container) return;
    container.innerHTML = "";
    container.style.setProperty("--board-size", size);

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = document.createElement("div");
        cell.classList.add("box");
        cell.dataset.row = r;
        cell.dataset.column = c;
        cell.setAttribute("role", "gridcell");
        cell.setAttribute("tabindex", "0"); // keyboard focusable
        cell.setAttribute("aria-label", `Cell ${Render.coordToLabel([r, c])}`);
        container.appendChild(cell);
      }
    }
  },

  /**
   * Convert numeric coords [row, col] -> human label "A1", "B10", etc.
   */
  coordToLabel([r, c]) {
    const letter = String.fromCharCode("A".charCodeAt(0) + r);
    return `${letter}${c + 1}`;
  },

  /**
   * Show popup with a message (heading slot).
   */
  renderPopUp(message) {
    if (!this.popUp) return;
    const heading = this.popUp.querySelector(".pop-up-heading");
    if (heading) heading.innerText = message;
    this.popUp.classList.add("active");
    this.popUp.setAttribute("aria-hidden", "false");
  },

  /**
   * Hide the popup.
   */
  hidePopUp() {
    if (!this.popUp) return;
    this.popUp.classList.remove("active");
    this.popUp.setAttribute("aria-hidden", "true");
  },

  /**
   * Update info panel or status element.
   */
  showInfo(infoEl, text) {
    if (!infoEl) return;

    // Clear any previous typed instance
    if (infoEl._typedInstance) {
      infoEl._typedInstance.destroy();
      infoEl.textContent = "";
    }

    // Fade out -> type -> fade in
    infoEl.classList.remove("fade-in");
    void infoEl.offsetWidth; // trigger reflow for restart animation

    infoEl._typedInstance = new Typed(infoEl, {
      strings: [text],
      typeSpeed: 20,
      showCursor: false,
      onComplete: () => {
        infoEl.classList.add("fade-in");
      },
    });
  },
  /**
   * Render a ship visually on the board.
   * - Adds "placed" classes for individual cells.
   * - Adds a ship element for styling/positioning.
   * - If `hidden` is true, adds class to hide the ship (useful for computer board).
   */
  renderShipOnBoard(
    board,
    coordinates = [],
    axis = "X",
    ship = { name: "ship" },
    hidden = false
  ) {
    if (!board) return;

    // mark cells
    coordinates.forEach(([r, c]) => {
      const boxEl = board.querySelector(
        `.box[data-row="${r}"][data-column="${c}"]`
      );
      if (boxEl) boxEl.classList.add("placed");
      // keep shipName in DOM cell for later queries (helpful for tests or UI)
      if (boxEl) boxEl.dataset.ship = ship.name;
    });

    // ship element for css styling and "sunk" toggles
    const [row, column] = coordinates[0] ?? [0, 0];
    const shipEl = document.createElement("div");
    shipEl.classList.add("ship", axis);
    if (hidden) shipEl.classList.add("hidden-ship");
    shipEl.dataset.ship = ship.name;
    shipEl.style.setProperty("--row", row);
    shipEl.style.setProperty("--column", column);
    shipEl.style.setProperty("--length", coordinates.length ?? 1);
    board.appendChild(shipEl);
  },

  /**
   * Render the result of an attack (hit, miss, sunk).
   *
   * - board: DOM container
   * - result: ATTACK_RESULTS value
   * - coordinates: either a single [r,c] or an array of coords to mark (for sunk ship)
   * - options: { shipName } optional
   */
  renderAttack(board, result, coordinates, options = {}) {
    if (!board) return;

    const coordsArray = Array.isArray(coordinates[0])
      ? coordinates
      : [coordinates];

    coordsArray.forEach(([r, c]) => {
      const boxEl = board.querySelector(
        `.box[data-row="${r}"][data-column="${c}"]`
      );
      if (!boxEl) return;

      // normalize classes: remove preview classes that might remain
      boxEl.classList.remove("preview", "preview-invalid");

      // Add visual state
      boxEl.classList.add(result);

      // Keep aria updated
      const label = `Cell ${Render.coordToLabel([r, c])} — ${result}`;
      boxEl.setAttribute("aria-label", label);
    });

    // If sunk and shipName available, mark the ship element
    if (result === ATTACK_RESULTS.SUNK && options.shipName) {
      const shipEl = board.querySelector(
        `.ship[data-ship="${options.shipName}"]`
      );
      if (shipEl) shipEl.classList.add("sunk");
    }
  },

  /**
   * Utility to clear previews or temporary styles from a board.
   */
  clearPreviews(board) {
    if (!board) return;
    board
      .querySelectorAll(".preview, .preview-invalid")
      .forEach((el) => el.classList.remove("preview", "preview-invalid"));
  },
};

export default Render;
