import House from "./House";

export type Result = {
  firstPlayerScore: number;
  secondPlayerScore: number;
  winner: number;
};

const updateHouse = (house: House, numberOfStones: number) => {
  if (house != undefined) house.setStones = house.getStones + numberOfStones;
};

const findOppositeHouseIndex = (houseId: number) => {
  const housesInOneRow = 6;
  return houseId < housesInOneRow
    ? houseId + housesInOneRow
    : houseId - housesInOneRow;
};

export function movePlayerStones(
  houses: House[],
  endZones: House[],
  houseId: number
) {
  let additionalMove = false;
  let housePoints = houses[houseId].getStones;
  houses[houseId].setStones = 0;

  if (houseId < 6) {
    let currentHouseId = houseId;
    while (housePoints-- > 0) {
      // split the points on the top row
      if (--currentHouseId >= 0 && housePoints >= 0) {
        // if the last stone is added to the player's endZone, he gets an additional move
        if (currentHouseId === 0 && housePoints === 1) additionalMove = true;
        else if (housePoints === 0 && houses[currentHouseId].getStones === 0) {
          // opposite house move
          const oppositeHouseIndex = findOppositeHouseIndex(currentHouseId);
          const oppositeHouse = houses[oppositeHouseIndex];
          if (oppositeHouse.getStones > 0) {
            updateHouse(endZones[0], oppositeHouse.getStones + 1);
            oppositeHouse.setStones = 0;
            updateHouse(houses[currentHouseId], -1); // contra update to final update a few lines below
          }
        }
        updateHouse(houses[currentHouseId], 1);
      } else if (housePoints >= 0) {
        // if there's only one stone in house[0], additional move is added
        if (currentHouseId < 0 && housePoints === 0) additionalMove = true;
        updateHouse(endZones[0], 1);
        // split the points on the bottom row
        const currentIndex = 6;
        for (let i = currentIndex; i < houses.length; i++)
          if (housePoints-- > 0) updateHouse(houses[i], 1);

        if (housePoints > 0) currentHouseId = 6;
      }
    }
  } else {
    let currentHouseId = houseId;
    while (housePoints-- > 0) {
      // split the points on the bottom row
      if (++currentHouseId < houses.length && housePoints >= 0) {
        // if the last stone is added to the player's endZone, he gets an additional move
        if (currentHouseId === 11 && housePoints === 1) additionalMove = true;
        else if (housePoints === 0 && houses[currentHouseId].getStones === 0) {
          // opposite house move
          const oppositeHouseIndex = findOppositeHouseIndex(currentHouseId);
          const oppositeHouse = houses[oppositeHouseIndex];
          if (oppositeHouse.getStones > 0) {
            updateHouse(endZones[1], oppositeHouse.getStones + 1);
            oppositeHouse.setStones = 0;
            updateHouse(houses[currentHouseId], -1);
          }
        }
        updateHouse(houses[currentHouseId], 1);
      } else if (housePoints >= 0) {
        // if there's only one stone in house[11], additional move is added
        if (currentHouseId > 11 && housePoints === 0) additionalMove = true;
        updateHouse(endZones[1], 1);
        // split the points on the top row
        const currentIndex = 5;
        for (let i = currentIndex; i >= 0; i--)
          if (housePoints-- > 0) updateHouse(houses[i], 1);

        if (housePoints > 0) currentHouseId = 5;
      }
    }
  }
  return {
    houses,
    endZones,
    additionalMove
  };
}

// check whether there are any stones left
const checkRow = (houses: House[]): boolean => {
  let isRowEmpty = true;
  houses.forEach(house => {
    if (house.getStones !== 0) isRowEmpty = false;
  });
  return isRowEmpty;
};

// sum stones of one player
const sumStones = (houses: House[]) =>
  houses.reduce((acc: number, house) => acc + house.getStones, 0);

export const isGameOver = (houses: House[]) => {
  let gameOver = true;
  const firstRow = houses.filter(house => house.getOwner === 0);
  const secondRow = houses.filter(house => house.getOwner === 1);

  gameOver = checkRow(firstRow);
  if (!gameOver) gameOver = checkRow(secondRow); // if 1st row is not empty, check 2nd one

  return gameOver;
};

export const calculateResult = (houses: House[], endZones: House[]): Result => {
  const firstRow = houses.filter(house => house.getOwner === 0);
  const secondRow = houses.filter(house => house.getOwner === 1);

  const firstPlayerScore = endZones[0].getStones + sumStones(firstRow);
  const secondPlayerScore = endZones[1].getStones + sumStones(secondRow);

  // first player wins = 0, second player wind = 1, draw = -1
  const findWinner = () =>
    firstPlayerScore > secondPlayerScore
      ? 0
      : firstPlayerScore == secondPlayerScore
      ? -1
      : 1;

  return {
    firstPlayerScore,
    secondPlayerScore,
    winner: findWinner()
  };
};
