export default class Node {
  // private currentPlayer: number;
  private pointsDifference: number;
  private possibleMoves: Node[];

  constructor(currentPlayer: number, pointsDifference: number) {
    this.pointsDifference = 0;
    this.possibleMoves = [];
  }

  public set setPointsDifference(pointsDifference: number) {
    this.pointsDifference = pointsDifference;
  }

  public get getPointsDifference(): number {
    return this.pointsDifference;
  }

  public addPossibleMove(move: Node) {
    this.possibleMoves.push(move);
  }
}
