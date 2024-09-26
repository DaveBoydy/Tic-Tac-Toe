/*
 * Code Inspired by
 * https://www.ayweb.dev/blog/building-a-house-from-the-inside-out
 */

(function () {
  /*
   * Execute logic after the DOM has loaded.
   */
  addEventListener("load", (event) => {
    console.log("The page is fully loaded.");
    initApp();
  });

  /*
   * Bootstrap the app.
   */
  function initApp() {
    displayController();
  }

  /*
   ** Represents the state of the game board
   */
  function gameBoard() {
    const board = [];
    const rows = 3;
    const columns = 3;

    // Create a 2d array that will represent the game board
    for (let i = 0; i < rows; i++) {
      board[i] = [];
      for (let j = 0; j < columns; j++) {
        board[i].push(Cell());
      }
    }

    // print the board to the console.
    const printBoard = () => {
      const boardWithCellValues = board.map((row) =>
        row.map((cell) => cell.getValue())
      );
      console.log(boardWithCellValues);
    };

    // expose an interface to the gameBoard for the app's controller(s).
    return { printBoard };
  }

  /*
   ** Cells represent one "square" on the board.
   ** cell values are, empty: 0, Symbols: X and Y.
   ** symbols represent opposing players.
   */
  function Cell() {
    let value = 0;

    // retrieve the current cell value VIA closure.
    const getValue = () => value;

    return {
      getValue,
    };
  }

  /*
   * Render updates to the UI.
   */
  function displayController() {
    const board = gameBoard();
    board.printBoard();
  }
})();
