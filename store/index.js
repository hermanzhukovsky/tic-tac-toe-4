import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		firstPlayerTurn: true,
		secondPlayerTurn: false,
		isGameOver: false,
		isBotTurn: false,
		botCount: 0,
		playerCount: 0,
		options: {
			multiplayer: {
				player: {
					symbol: "",
					id: "",
					count: 0,
					isHisTurn: false
				},
			}
		},
		squares: [
			{ id: 1, value: "", isHighlighted: false }, 
			{ id: 2, value: "", isHighlighted: false },
			{ id: 3, value: "", isHighlighted: false },
			{ id: 4, value: "", isHighlighted: false },
			{ id: 5, value: "", isHighlighted: false },
			{ id: 6, value: "", isHighlighted: false },
			{ id: 7, value: "", isHighlighted: false },
			{ id: 8, value: "", isHighlighted: false },
			{ id: 9, value: "", isHighlighted: false },
		],
		lines: [
			[0, 4, 8],
			[2, 4, 6],
			[0, 1, 2],
			[3, 4, 5],
			[6, 7, 8],
			[0, 3, 6],
			[1, 4, 7],
			[2, 5, 8]
		],
		mode: 'multiplayer',
	},
	actions: {
		singlePlayerModeHandler({ commit, state }, index) {
			if (state.isGameOver) {
				commit('resetGame');
				return;
			}

			if (!state.isBotTurn && state.squares[index].value === "") {
				commit('setSquareValue', { value: "X", index });
				commit('toggleTurn');
				commit('calculateWinner');
			}

			if (!state.isGameOver) {
				commit('playWithBot');
				commit('calculateWinner');
			}
		},
		multiplayerModeHandler({ commit, state }, index) {
			if (state.isGameOver) {
				commit('resetGame');
				return;
			}
			if (!state.options.multiplayer.player.isHisTurn) return;
			commit('setSquareValue', { value: state.options.multiplayer.player.symbol, index });

			const multiplayerTurn = JSON.parse(localStorage.getItem('multiplayerTurn'));
			for (let key in multiplayerTurn) {
				multiplayerTurn[key] = !multiplayerTurn[key];
			}
			localStorage.setItem('multiplayerTurn', JSON.stringify(multiplayerTurn));
			commit('toggleTurn');
			commit('calculateWinner');
		},
		initMultiplayerMode({ commit }) {
			if (!localStorage.getItem('history')) {
				localStorage.setItem('history', '["", "", "", "", "", "", "", "", ""]');
				localStorage.setItem('multiplayerTurn', '{"firstPlayerTurn": true, "secondPlayerTurn": false}');
				commit('setPlayerOptions', { id: "1", count: 0, symbol: "X" });
			} else {
				commit('updateSquares');
				commit('calculateWinner');
				commit('setPlayerOptions', { id: "2", count: 0, symbol: "O" });
			}

			if (!localStorage.getItem('isFirstPlayerTurn')) {
				localStorage.setItem('isFirstPlayerTurn', '0');
			} else if (!localStorage.getItem('isSecondPlayerTurn')) {
				localStorage.setItem('isSecondPlayerTurn', '1');
			}
		}
	},
	getters: {
		isBotTurn(state) {
			return state.isBotTurn;
		},
		squares(state) {
			return state.squares;
		},
		mode(state) {
			return state.mode;
		},
		isGameOver(state) {
			return state.isGameOver;
		},
		playerCount(state) {
			return state.playerCount;
		},
		botCount(state) {
			return state.botCount;
		},
		emptySquaresCount(state) {
			return state.squares.filter(square => square.value === "").length - 1;
		}
	},
	mutations: {
		calculateWinner(state) {
			state.lines.forEach(line => {
				const [firstIndex, secondIndex, thirdIndex] = line;
				const firstSquare = state.squares[firstIndex];
				const secondSqure = state.squares[secondIndex];
				const thirdSquare = state.squares[thirdIndex];

				if (firstSquare.value === "X" && secondSqure.value === "X" && thirdSquare.value === "X") {
					firstSquare.isHighlighted = true;
					secondSqure.isHighlighted = true;
					thirdSquare.isHighlighted = true;
					state.isGameOver = true;
					if (state.mode === "multiplayer" && state.options.multiplayer.player.symbol === "X") {
						++state.options.multiplayer.player.count;
					}
					if (state.mode === "singleplayer") {
						++state.playerCount;
					}
				}
				if (firstSquare.value === "O" && secondSqure.value === "O" && thirdSquare.value === "O") {
					firstSquare.isHighlighted = true;
					secondSqure.isHighlighted = true;
					thirdSquare.isHighlighted = true;
					state.isGameOver = true;
					if (state.mode === "multiplayer" && state.options.multiplayer.player.symbol === "O") {
						++state.options.multiplayer.player.count;
					}
					if (state.mode === "singleplayer") {
						++state.botCount;
					}
					
				}
			});
		},
		loadPreviousGame(state) {
			const keys = Object.keys(localStorage);
			for (let key of keys) {
				if (isFinite(key)) {
					const squareValue = localStorage.getItem(key);
					state.squares[Number(key)].value = squareValue;
				}
			}
		},
		setMode(state, mode) {
			state.mode = mode; 
		},
		updateSquares(state) {
			const history = JSON.parse(localStorage.getItem('history'));
			state.squares.forEach((square, index) => {
				square.value = history[index];
			});
		},
		setSquareValue(state, { value, index }) {
			const square = state.squares[index];
			if (!square.value) {
				square.value = value;
				if (state.mode === 'multiplayer') {
					const history = JSON.parse(localStorage.getItem('history'));
					history[index] = value;
					localStorage.setItem('history', JSON.stringify(history));
				}
			}

		},
		playWithBot(state) {
			if (state.isBotTurn) {
				const emptySquares = state.squares.filter(square => square.value === "");
				state.isBotTurn = false;
				if (emptySquares.length > 0) {
					const randomIndex = Math.floor(Math.random() * emptySquares.length);
					emptySquares[randomIndex].value = "O"; 
				} else {
					state.isGameOver = true;
				}

			}
		},
		toggleGameOverOption(state) {
			this.isGameOver = !this.isGameOver;
		},
		toggleTurn(state) {
			if (state.mode === "multiplayer") {
				state.options.multiplayer.player.isHisTurn = !state.options.multiplayer.player.isHisTurn;
			} else if (state.mode === "singleplayer") {
				state.isBotTurn = !state.isBotTurn;
			}
			
		},
		resetGame(state) {
			state.isGameOver = false;
			state.isBotTurn = false;

			state.squares.forEach(square => {
				square.value = "";
				if (square.isHighlighted) {
					square.isHighlighted = false;
				}
			});

			const history = JSON.parse(localStorage.getItem('history'));
			history.fill("");
			localStorage.setItem('history', JSON.stringify(history));
		},
		setPlayerOptions(state, { id, count, symbol }) {
			if (sessionStorage.getItem('id')) {
				state.options.multiplayer.player.id = sessionStorage.getItem('id');
				state.options.multiplayer.player.symbol = sessionStorage.getItem('symbol');
			} else {
				state.options.multiplayer.player.id = id;
				state.options.multiplayer.player.symbol = symbol;
				sessionStorage.setItem('id', id);
				sessionStorage.setItem('symbol', symbol);
			}
			state.options.multiplayer.player.count = count;

			const turn = JSON.parse(localStorage.getItem('multiplayerTurn'));
			if (state.options.multiplayer.player.id == "1") {
				
				state.options.multiplayer.player.isHisTurn = turn.firstPlayerTurn;
				console.log(state.options.multiplayer.player)
			}
			if (state.options.multiplayer.player.id == "2") {
				state.options.multiplayer.player.isHisTurn = turn.secondPlayerTurn;
			}
		}
	},
});
