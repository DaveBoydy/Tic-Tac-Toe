/*
 * Code Inspired by
 * https://www.ayweb.dev/blog/building-a-house-from-the-inside-out
 */

(function () {
  /*
   ** Execute logic after the DOM has loaded.
   */
  addEventListener("load", (event) => {
    console.log(
      "The page is fully loaded and application logic can be safely executed."
    );
    initApp();
  });

  /*
   ** Bootstraps the app.
   */
  function initApp() {
    CacheDom();
    addGameBoardObserver();
    gameBoard.generateBoard();
    displayController();
    gameController();
  }

  /*
   ** Represents the state of the game board
   */

  const gameBoard = {
    board: [],
    rows: 3,
    columns: 3,
    generateBoard() {
      // Create a 2d array that will represent the game board
      for (let i = 0; i < this.rows; i++) {
        this.board[i] = [];
        for (let j = 0; j < this.columns; j++) {
          this.board[i].push(Cell());
        }
      }
    },
    printBoard() {
      const boardWithCellValues = this.board.map((row) =>
        // populate array elements with values returned from the cell function.
        row.map((cell) => cell.getValue())
      );
      console.log(boardWithCellValues);
    },
  };

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
   ** Render updates to the UI and
   ** Subscribes to pubsub to know when events have occurred.
   */
  function displayController() {
    gameBoard.printBoard();

    const gameMeta = CacheDom().getGameMetaView();

    console.log(gameMeta);

    const updateBoard = (data) => {
      console.log(`The display controller noticed ${data} was clicked`);
    };

    pubsub.subscribe("boardClicked", updateBoard);
  }

  /*
   ** Represents the games players
   */
  const players = {
    playerOne: {
      name: "Player One",
    },
    playerTwo: {
      name: "Player Two",
    },
  };

  /*
   ** Handles game flow E.G. player turns.
   */
  function gameController() {
    let activePlayer = players.playerOne.name;

    console.log(`${activePlayer}'s turn.`);
  }

  /*
   ** Stores references to specific DOM nodes
   ** and exposes those references VIA closures.
   */
  function CacheDom() {
    const boardView = document.querySelector("#game-board");
    const gameMeta = document.querySelector("#game-meta");

    const getBoardView = () => boardView;
    const getGameMetaView = () => gameMeta;

    return {
      getBoardView,
      getGameMetaView,
    };
  }

  /*
   ** Listens for click events
   ** and publishes events VIA pubsub
   */
  function addGameBoardObserver() {
    const boardView = CacheDom().getBoardView();

    boardView.addEventListener("click", (e) => {
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
