import { Ref } from "vue";
import House from "./House";
import { movePlayerStones, MoveResult, sumStones } from "./Server";
import { getRandomInt } from "./utils/Utils";

export const randomMoveAi = (
  houses: House[],
  endZones: House[],
  currentPlayer: Ref<number>,
  currentHouseMove: Ref<number>
): MoveResult => {
  const numberOfPlayerHouses = 6;
  let randomMove = getRandomInt(
    currentPlayer.value * numberOfPlayerHouses,
    numberOfPlayerHouses * (currentPlayer.value + 1)
  );

  const availableStones = sumStones(
    houses.filter(house => house.getOwner == currentPlayer.value)
  );

  // pick available house to move stones
  if (availableStones > 0) {
    while (houses[randomMove].getStones == 0) {
      randomMove = getRandomInt(
        currentPlayer.value * numberOfPlayerHouses,
        numberOfPlayerHouses * (currentPlayer.value + 1)
      );
    }
  }
  // highlight recent move in template
  currentHouseMove.value = randomMove;
  return movePlayerStones(houses, endZones, randomMove);
};
