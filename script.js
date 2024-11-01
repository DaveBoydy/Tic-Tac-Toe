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
    LocalStoragePlayers();
    addGameBoardObserver();
    gameBoard.generateBoard();
    gameBoard.virtualBoard();
    gameController();
    inputController();
    displayController();
    pubsub.publish("newRound");

    //TODO reset the game when one player wins the match

    // let players_serialized = JSON.stringify(players);
    // localStorage.setItem("players", players_serialized);
  }

  /*
   ** Represents the games players
   */
  const players = {
    playerOne: {
      mark: "X",
      score: 0,
    },
    playerTwo: {
      mark: "O",
      score: 0,
    },
  };

  players.activePlayer = players.playerOne.mark;

  /*
   ** Cells represent one "square" on the board.
   ** cell values are marked with Symbols: X and O.
   ** symbols represent opposing players.
   */
  function Cell(cell) {
    let value = cell;

    const setValue = (player) => {
      value = player;
    };

    // retrieve the current cell value VIA closure.
    const getValue = () => value;

    return {
      getValue,
      setValue,
    };
  }

  /*
   ** Represents the state of the game board
   */
  const gameBoard = {
    board: [],
    rows: 3,
    columns: 3,
    generateBoard() {
      // Create a 2d array that will represent the game board.
      for (let i = 0; i < this.rows; i++) {
        this.board[i] = [];
        // Add HTML div ID's that represent the board to the corresponding array index.
        for (let j = 0; j < this.columns; j++) {
          this.board[i].push(Cell(`row${i + 1}-cell${j + 1}`));
        }
      }
    },
    printBoard() {
      const boardWithCellValues = this.board.map((row) =>
        // populate array elements with values returned from the cell function.
        row.map((cell) => cell.getValue())
      );
      console.table(boardWithCellValues);
    },
    virtualBoard() {
      const updateVirtualBoard = (element) => {
        const eID = element.id;

        this.board.forEach((row) => {
          row.forEach((cell) => {
            if (cell.getValue() === eID) {
              if (players.activePlayer === players.playerOne.mark) {
                cell.setValue(players.playerOne.mark);
                console.log(cell.getValue());
              } else if (players.activePlayer === players.playerTwo.mark) {
                cell.setValue(players.playerTwo.mark);
                console.log(cell.getValue());
              }
            }
          });
        });
      };

      const allMarksMatch = (col) => {
        const allMarkedX = col.every((cell) => cell.getValue() === "X");
        const allMarkedO = col.every((cell) => cell.getValue() === "O");

        if (allMarkedX) {
          pubsub.publish("roundOver", "X");
        }
        if (allMarkedO) {
          pubsub.publish("roundOver", "O");
        }
      };

      const scanVirtualRows = () => {
        this.board.forEach((row) => {
          allMarksMatch(row);
        });
      };

      const scanVirtualColumns = () => {
        let column1 = [];
        let column2 = [];
        let column3 = [];
        this.board.forEach((row) => {
          column1.push(row[0]);
          column2.push(row[1]);
          column3.push(row[2]);
        });

        allMarksMatch(column1);
        allMarksMatch(column2);
        allMarksMatch(column3);
      };

      const scanVirtualCrossColumns = () => {
        let crossColumnRight = [];
        let crossColumnLeft = [];
        let columns = 3;

        this.board.forEach((row) => {
          columns -= 1;
          crossColumnRight.push(row[columns]);
        });

        this.board.forEach((row) => {
          crossColumnLeft.push(row[columns]);
          columns += 1;
        });

        allMarksMatch(crossColumnRight);
        allMarksMatch(crossColumnLeft);
      };

      pubsub.subscribe("inputCleaned", updateVirtualBoard);

      return {
        scanVirtualRows,
        scanVirtualColumns,
        scanVirtualCrossColumns,
      };
    },
  };

  /*
   ** Render updates to the UI.
   */
  function displayController() {
    const updateBoardView = (element) => {
      let cellSymbol = "";
      if (players.activePlayer === players.playerOne.mark) {
        cellSymbol = players.playerOne.mark;
      } else if (players.activePlayer === players.playerTwo.mark) {
        cellSymbol = players.playerTwo.mark;
      }
      element.textContent = cellSymbol;
      if (players.activePlayer === players.playerOne.mark) {
        element.classList.add("player-one-color");
      } else if (players.activePlayer === players.playerTwo.mark) {
        element.classList.add("player-two-color");
      }

      pubsub.publish("boardMarked");
    };

    const updatePlayersTurnMetaView = () => {
      const playerTurnMetaView = CacheDom().getPlayerTurnMeta();
      playerTurnMetaView.textContent = `Player ${players.activePlayer}'s Turn`;

      ["player-one-color", "player-two-color"].map((c) =>
        playerTurnMetaView.classList.toggle(c)
      );
    };

    const updatePlayersScoreMetaView = () => {
      const playerOneScoreMeta = CacheDom().getPlayerOneScoreMeta();
      const playerTwoScoreMeta = CacheDom().getPlayerTwoScoreMeta();

      const players_deserialized = LocalStoragePlayers().getPlayers();

      playerOneScoreMeta.textContent = players_deserialized.playerOne.score;
      playerTwoScoreMeta.textContent = players_deserialized.playerTwo.score;
    };

    pubsub.subscribe("inputCleaned", updateBoardView);
    pubsub.subscribe("playerSwitched", updatePlayersTurnMetaView);
    pubsub.subscribe("newRound", updatePlayersScoreMetaView);
  }

  /*
   ** Sanitizes input before use by the display controller.
   */
  function inputController() {
    const gameBoardView = CacheDom().getBoardView();

    const sanitizeInput = (data) => {
      gameBoardView.querySelectorAll(".board-square").forEach((cell) => {
        let gameCell = cell.getAttribute("id");

        //find the cell that was clicked
        if (data == gameCell) {
          //if the cell has been marked return I.E. do nothing
          if (
            cell.classList.contains("player-one-color") ||
            cell.classList.contains("player-two-color")
          ) {
            return;
          }

          pubsub.publish("inputCleaned", cell);
        }
      });
    };

    pubsub.subscribe("boardClicked", sanitizeInput);
  }

  /*
   ** Handles game flow E.G. player turns and wins.
   */
  function gameController() {
    console.log(`${players.activePlayer}'s turn.`);

    function checkWinCondition() {
      gameBoard.virtualBoard().scanVirtualRows();
      gameBoard.virtualBoard().scanVirtualColumns();
      gameBoard.virtualBoard().scanVirtualCrossColumns();
    }

    const switchPlayerTurn = () => {
      players.activePlayer =
        players.activePlayer === players.playerOne.mark
          ? players.playerTwo.mark
          : players.playerOne.mark;

      console.log(`${players.activePlayer}'s turn.`);
      pubsub.publish("playerSwitched");
    };

    const beginNewRound = (winner) => {
      if (winner === "X") {
        LocalStoragePlayers().incrementPlayerOneScore();
      }
      if (winner === "O") {
        LocalStoragePlayers().incrementPlayerTwoScore();
      }

      gameBoard.generateBoard();
      // gameBoard.printBoard();

      // Refresh the page
      location.reload();

      pubsub.publish("newRound");
    };

    pubsub.subscribe("boardMarked", checkWinCondition);
    pubsub.subscribe("boardMarked", switchPlayerTurn);
    pubsub.subscribe("roundOver", beginNewRound);
  }

  /*
   ** Stores references to specific DOM nodes
   ** and exposes those references VIA closures.
   */
  function CacheDom() {
    const boardView = document.querySelector("#game-board");
    const playerTurnMeta = document.querySelector("#player-turn");
    const playerOneScoreMeta = document.querySelector("#player-one-score");
    const playerTwoScoreMeta = document.querySelector("#player-two-score");

    const getBoardView = () => boardView;
    const getPlayerTurnMeta = () => playerTurnMeta;
    const getPlayerOneScoreMeta = () => playerOneScoreMeta;
    const getPlayerTwoScoreMeta = () => playerTwoScoreMeta;

    return {
      getBoardView,
      getPlayerTurnMeta,
      getPlayerOneScoreMeta,
      getPlayerTwoScoreMeta,
    };
  }

  function LocalStoragePlayers() {
    if (localStorage.getItem("players") === null) {
      const players_serialized = JSON.stringify(players);
      localStorage.setItem("players", players_serialized);
    }

    let players_deserialized = JSON.parse(localStorage.getItem("players"));

    const getPlayers = () => players_deserialized;

    const incrementPlayerOneScore = () => {
      players_deserialized.playerOne.score += 1;
      console.log(players_deserialized.playerOne.score);

      const players_serialized = JSON.stringify(players_deserialized);
      localStorage.setItem("players", players_serialized);
    };

    const incrementPlayerTwoScore = () => {
      players_deserialized.playerTwo.score += 1;
      const players_serialized = JSON.stringify(players_deserialized);
      localStorage.setItem("players", players_serialized);
    };

    return {
      getPlayers,
      incrementPlayerOneScore,
      incrementPlayerTwoScore,
    };
  }

  /*
   ** Listens for game board click events
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
      // console.log(`PUBSUB: someone just subscribed to know about ${eName}`);
      //Check if an event exists, if it doesn't add the event as an empty array.
      this.events[eName] = this.events[eName] || [];
      //add the function that gets passed as an argument to the array.
      this.events[eName].push(fn);
    },
    unsubscribe(eName, fn) {
      // console.log(`PUBSUB: someone just Unsubscribed from ${eName}`);
      //remove an event function by name
      if (this.events[eName]) {
        this.events[eName] = this.events[eName].filter((f) => f !== fn);
      }
    },
    publish(eName, data) {
      // console.log(`PUBSUB: Making a broadcast about ${eName} with ${data}`);
      //emit|publish|announce the event to anyone who is subscribed
      if (this.events[eName]) {
        this.events[eName].forEach((f) => {
          f(data);
        });
      }
    },
  };
})();
