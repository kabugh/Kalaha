import { Ref } from "vue";
import House from "./House";
import {
  calculateResult,
  isGameOver,
  movePlayerStones,
  MoveResult,
  sumStones
} from "./Server";
import { copyEndZones, copyHouses, getRandomInt } from "./utils/Utils";

export const numberOfPlayerHouses = 6;

export const randomMoveAi = (
  houses: House[],
  endZones: House[],
  currentPlayer: Ref<number>,
  currentHouseMove: Ref<number>
): MoveResult => {
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
  // An opimisation would be to get rid of 'currentPlayer.value == 0' check
  // and use half of houses but it's difficult to work with IDs as they are 0 - 11.
  // if ai is starting, it will try to get an additional move
  let nextMoveHouse;
  if (currentPlayer.value == 0) {
    nextMoveHouse = houses.filter(
      house => house.getId < 6 && house.getId - house.getStones == -1
    );
  } else {
    nextMoveHouse = houses.filter(
      house =>
        house.getId >= numberOfPlayerHouses &&
        house.getStones + house.getId == numberOfPlayerHouses * 2
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
};

const minimax = (
  houses: House[],
  endZones: House[],
  treeDepth: number,
  isMaximizing: boolean,
  currentPlayer: number
): number => {
  console.log("End game: " + isGameOver(houses), "Tree depth: " + treeDepth);
  // if the game is over or if the tree is fully searched,
  // return a result which is the difference between players' points (the advantage).
  if (isGameOver(houses) || treeDepth == 0) {
    const result = calculateResult(houses, endZones);
    return result.firstPlayerScore - result.secondPlayerScore;
  }
  if (isMaximizing) {
    let maxScore = -Infinity; // we want to find the move that will make us get highest possible score

    for (
      let i = currentPlayer * numberOfPlayerHouses;
      i < numberOfPlayerHouses * (currentPlayer + 1);
      i++
    ) {
      const housesCopy = copyHouses(houses);
      const endZonesCopy = copyEndZones(endZones);
      if (housesCopy[i].getStones > 0) {
        const moveResult = movePlayerStones(housesCopy, endZonesCopy, i);

        const currentScore = minimax(
          moveResult.houses,
          moveResult.endZones,
          treeDepth - 1,
          false,
          currentPlayer == 0 ? 1 : 0
        );

        maxScore = currentScore > maxScore ? currentScore : maxScore;
      }
    }

    return maxScore;
  } else {
    let minScore = Infinity; // we want to find the move that will make us get smallest possible score

    for (
      let i = currentPlayer * numberOfPlayerHouses;
      i < numberOfPlayerHouses * (currentPlayer + 1);
      i++
    ) {
      const housesCopy = copyHouses(houses);
      const endZonesCopy = copyEndZones(endZones);
      if (housesCopy[i].getStones > 0) {
        const moveResult = movePlayerStones(housesCopy, endZonesCopy, i);

        // no need to pass moveResult.houses, can use housesCopy
        // the object is modified anyways
        const currentScore = minimax(
          moveResult.houses,
          moveResult.endZones,
          treeDepth - 1,
          true,
          currentPlayer == 0 ? 1 : 0
        );

        minScore = currentScore < minScore ? currentScore : minScore;
      }
    }

    return minScore;
  }
};

export const decisionTreeMoveAi = (
  houses: House[],
  endZones: House[],
  currentPlayer: Ref<number>,
  currentHouseMove: Ref<number>
): MoveResult => {
  let currentBestScore = -Infinity;
  let move = 0;

  // create a deep copy so as not to modify the original data before choosing the best move
  const housesCopy = copyHouses(houses);
  const endZonesCopy = copyEndZones(endZones);

  // find the index to move stones, which will be the best choice for AI
  // iterate over each possible move and perform minimax to calculate the best move out of that
  for (
    let i = currentPlayer.value * numberOfPlayerHouses;
    i < numberOfPlayerHouses * (currentPlayer.value + 1);
    i++
  ) {
    const additionalHousesCopy = copyHouses(housesCopy);
    const additionalEndZonesCopy = copyEndZones(endZonesCopy);

    if (additionalHousesCopy[i].getStones > 0) {
      const moveResult = movePlayerStones(
        additionalHousesCopy,
        additionalEndZonesCopy,
        i
      );

      const score = minimax(
        moveResult.houses,
        moveResult.endZones,
        5, // how far should the game (tree) be evaluated
        true,
        currentPlayer.value
      );

      if (score > currentBestScore) {
        currentBestScore = score;
        move = i;
      }
    }
  }

  console.log("Chosen move: " + move, "Best score:" + currentBestScore);

  currentHouseMove.value = move;
  return movePlayerStones(houses, endZones, move);
};
