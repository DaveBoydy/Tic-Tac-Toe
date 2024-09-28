/*
 * Code Inspired by
 * https://www.ayweb.dev/blog/building-a-house-from-the-inside-out
 */

(function () {
  /*
   * Execute logic after the DOM has loaded.
   */
  addEventListener("load", (event) => {
    console.log(
      "The page is fully loaded and application logic can be safely executed."
    );
    initApp();
  });

  /*
   * Bootstrap the app.
   */
  function initApp() {
    displayController();
    cacheDom();
    addGameBoardObserver();
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
        // populate array elements with values returned from the cell function.
        row.map((cell) => cell.getValue())
      );
      console.log(boardWithCellValues);
    };

    // expose an interface to the gameBoard for the app's controller(s).
    return { printBoard };
  }

  /*
   ** Cells represent one "square" on the board.
   ** cell values are, empty: "", Symbols: X and O.
   ** symbols represent opposing players.
   */
  function Cell() {
    let value = "";

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

  function cacheDom() {
    const boardView = document.querySelector("#game-board");

    const getBoardView = () => boardView;

    return {
      getBoardView,
    };
  }

  function addGameBoardObserver() {
    const boardView = cacheDom();

    boardView.getBoardView().addEventListener("click", (e) => {
      const target = e.target;

      switch (target.id) {
        case "cell-one":
          console.log("cell one was clicked");
          break;
        case "cell-two":
          console.log("cell two was clicked");
          break;
        case "cell-three":
          console.log("cell three was clicked");
          break;

        case "cell-four":
          console.log("cell four was clicked");
          break;
        case "cell-five":
          console.log("cell five was clicked");
          break;
        case "cell-six":
          console.log("cell six was clicked");
          break;

        case "cell-seven":
          console.log("cell seven was clicked");
          break;
        case "cell-eight":
          console.log("cell eight was clicked");
          break;
        case "cell-nine":
          console.log("cell nine was clicked");
          break;
      }
    });
  }
})();
