import Player from "./Player";
import Server from "./Server";
import { getRandomInt } from "./utils/Utils";

export default class Game {
  private players: Player[];
  private currentPlayer: Player;
  private winner: Player | null;
  constructor(players: Player[], currentPlayer: Player) {
    this.players = players;
    this.currentPlayer = currentPlayer;
    this.winner = null;

    this.setup();
  }

  // public restart(): void {}

  private changePlayer() {
    this.currentPlayer =
      this.currentPlayer.getId === 0 ? this.players[1] : this.players[0];
  }

  public setup() {
    console.log("Kalaha Game");
    console.log("Pick a gamemode: ");
    console.log("PC vs PC");
    console.log("Player vs PC");
  }

  public startGame(gamemode: number) {
    if (gamemode == 0) this.initGamePC();
    // else initGamePlayerVsPC();
  }

  private initGamePC(): void {
    const server = new Server();
    const numberOfPoints = 12 * 6; // TEMPORARILY

    // init decisionTrees for bots
    let gameOver = false;
    this.players = [new Player(0, [], 0), new Player(0, [], 1)];
    const p1 = this.players[0];
    const p2 = this.players[1];

    this.currentPlayer = p1;

    while (!gameOver) {
      console.log(`Player's ${this.currentPlayer.getId + 1} turn.`);

      const randomPick = getRandomInt(1, 6); // choose wisely using decision tree
      console.log(`Chosen house: ${randomPick}`);

      switch (randomPick) {
        case 1:
          break;
        case 2:
          break;
        case 3:
          break;
        case 4:
          break;
        case 5:
          break;
        case 6:
          break;
        default:
          break;
      }

      if (p1.getScore + p2.getScore == numberOfPoints) {
        gameOver = true;

        if (p1.getScore > p2.getScore) this.winner = p1;
        else if (p1.getScore < p2.getScore) this.winner = p2;
        else this.winner = null;
      }
    }
  }
}
