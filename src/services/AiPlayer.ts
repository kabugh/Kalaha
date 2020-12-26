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

export const advancedMoveAi = (
  houses: House[],
  endZones: House[],
  currentPlayer: Ref<number>,
  currentHouseMove: Ref<number>
): MoveResult => {
  const numberOfPlayerHouses = 6;
  // if ai is starting, it will try to get an additional move
  let nextMoveHouse;
  if (currentPlayer.value == 0) {
    nextMoveHouse = houses.filter(
      house => house.getId < 6 && house.getId - house.getStones == -1
    );
  } else {
    nextMoveHouse = houses.filter(
      house => house.getId >= 6 && house.getStones + house.getId == 12
    );
  }

  console.log(nextMoveHouse);

  // if the possible move hasnt been found, pick a rightmost house
  let nextMove: number;
  if (nextMoveHouse.length > 0) nextMove = nextMoveHouse[0].getId;
  else
    nextMove =
      currentPlayer.value == 0
        ? houses[0].getId
        : houses[houses.length - 1].getId;

  console.log("Chosen nextMove 1): " + nextMove);
  const availableStones = sumStones(
    houses.filter(house => house.getOwner == currentPlayer.value)
  );

  const findHouseWithStones = (houses: House[], index: number) => {
    while (houses[index].getStones == 0) {
      nextMove = getRandomInt(
        currentPlayer.value * numberOfPlayerHouses,
        numberOfPlayerHouses * (currentPlayer.value + 1)
      );
    }
  };

  const pickNextSuitableHouse = (houses: House[], index: number) => {
    // check whether index = nextMove +- 1 is not out of range
    if (houses[index].getId < houses.length) {
      nextMove = houses[index].getId;
    } // if index is out of range, pick the next move randomly
    else
      currentPlayer.value == 0
        ? findHouseWithStones(houses, index + 1)
        : findHouseWithStones(houses, index - 1);
  };

  // pick available house to move stones
  if (availableStones > 0) {
    while (houses[nextMove].getStones == 0) {
      // if current nextMove is not avaiable, pick the next rightmost/leftmost house
      // if that doesnt work, pick a random house that fits
      currentPlayer.value == 0
        ? pickNextSuitableHouse(houses, nextMove + 1)
        : pickNextSuitableHouse(houses, nextMove - 1);
    }
  }
  console.log("Chosen nextMove 2): " + nextMove);
  // highlight recent move in template
  currentHouseMove.value = nextMove;
  return movePlayerStones(houses, endZones, nextMove);

  // uproscic z wykorzystaniem playerHouses
  // return movePlayerStones(houses, endZones, currentPlayer.value == 0 ? nextMove : nextMove + 6);
};
