export default class House {
  private id: number;
  private stones: number;
  private owner: number;

  constructor(id: number, stones: number, owner: number) {
    this.id = id;
    this.stones = stones;
    this.owner = owner;
  }

  public get getStones(): number {
    return this.stones;
  }

  public set setStones(value: number) {
    this.stones = value;
  }

  public get getOwner(): number {
    return this.owner;
  }

  public get getId(): number {
    return this.id;
  }
}
