import House from "./House";

const updateHouse = (house: House) => {
  if (house != undefined) house.setStones = house.getStones + 1;
};

const findOppositeHouseIndex = (house: House) => {
  const houseId = house.getId;
  const housesInOneRow = 6;
  return houseId < housesInOneRow ? houseId + housesInOneRow : houseId;
};

export function movePlayerStones(
  endZones: House[],
  houses: House[],
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
        updateHouse(houses[currentHouseId]);
        // if the last stone is added to the player's endZone, he gets an additional move
        if (currentHouseId === 0 && housePoints === 1) {
          additionalMove = true;
        }
      } else if (housePoints >= 0) {
        console.log(housePoints, currentHouseId);

        updateHouse(endZones[0]); // update endZone

        // split the points on the bottom row
        const currentIndex = 6;
        for (let i = currentIndex; i < houses.length; i++)
          if (housePoints-- > 0) updateHouse(houses[i]);

        if (housePoints > 0) currentHouseId = 6;
      }
    }
  } else {
    let currentHouseId = houseId;
    while (housePoints-- > 0) {
      // split the points on the bottom row
      if (++currentHouseId < houses.length && housePoints >= 0) {
        updateHouse(houses[currentHouseId]);
        // if the last stone is added to the player's endZone, he gets an additional move
        if (currentHouseId === 0 && housePoints === 1) {
          additionalMove = true;
        }
      } else if (housePoints > 0) {
        updateHouse(endZones[1]); // update EndZone

        // split the points on the top row
        const currentIndex = 5;
        for (let i = currentIndex; i >= 0; i--)
          if (housePoints-- > 0) updateHouse(houses[i]);

        if (housePoints > 0) currentHouseId = 5;
      }
    }
  }
  return {
    endZones,
    houses,
    additionalMove
  };
}
