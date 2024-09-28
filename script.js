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

    pubsub.subscribe("boardClicked", function handleBoardClick(data) {
      console.log(`The display controller noticed ${data} was clicked`);
    });
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
      const target = e.target.id;
      pubsub.publish("boardClicked", target);
    });
  }

  /*
   ** - subscribe(eventName, func) -> subscribe a function to trigger
   ** when a specific event is published.
   *
   ** - unsubscribe(eventName, func) -> remove function from being
   ** triggered when the event is published.
   *
   ** - publish(eventName, func) -> publishes an event, and calls
   ** all functions associated with the event.
   */
  const pubsub = {
    events: {},

    subscribe(eName, fn) {
      console.log(`PUBSUB: someone just subscribed to know about ${eName}`);
      //Check if an event exists, if it doesn't add the event as an empty array.
      this.events[eName] = this.events[eName] || [];
      //add the function that gets passed as an argument to the array.
      this.events[eName].push(fn);
    },
    unsubscribe(eName, fn) {
      console.log(`PUBSUB: someone just Unsubscribed from ${eName}`);
      //remove an event function by name
      if (this.events[eName]) {
        this.events[eName] = this.events[eName].filter((f) => f !== fn);
      }
    },
    publish(eName, data) {
      console.log(`PUBSUB: Making a broadcast about ${eName} with ${data}`);
      //emit|publish|announce the event to anyone who is subscribed
      if (this.events[eName]) {
        this.events[eName].forEach((f) => {
          f(data);
        });
      }
    },
  };
})();
