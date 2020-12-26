import { Ref } from "vue";
import House from "./House";
import { movePlayerStones, sumStones } from "./Server";
import { getRandomInt } from "./utils/Utils";

export const randomMoveAi = (
  houses: House[],
  endZones: House[],
  currentPlayer: Ref<number>
) => {
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
    console.log(`move ${randomMove} - stones left: ${availableStones}`);
  }

  return movePlayerStones(houses, endZones, randomMove);
};
