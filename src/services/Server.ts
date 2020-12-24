import House from "./House";

const updateHouse = (house: House) => {
  if (house != undefined) house.setStones = house.getStones + 1;
};

export function movePlayerStones(
  endZones: House[],
  houses: House[],
  houseId: number
) {
  let housePoints = houses[houseId].getStones;
  houses[houseId].setStones = 0;

  if (houseId < 6) {
    let currentHouseId = houseId;
    while (housePoints-- > 0) {
      if (--currentHouseId >= 0 && housePoints >= 0) {
        console.log(
          "housePoints " +
            housePoints +
            `houses[${currentHouseId}]` +
            houses[currentHouseId].getStones
        );
        updateHouse(houses[currentHouseId]);
      } else if (housePoints > 0) {
        updateHouse(endZones[0]);

        const currentIndex = 6;
        for (let i = currentIndex; i < houses.length; i++)
          if (housePoints-- > 0) updateHouse(houses[i]);

        if (housePoints > 0) currentHouseId = 6;
      }
    }
  } else {
    let currentHouseId = houseId;
    while (housePoints-- > 0) {
      if (++currentHouseId < houses.length && housePoints >= 0) {
        updateHouse(houses[currentHouseId]);
      } else if (housePoints > 0) {
        updateHouse(endZones[1]);

        const currentIndex = 5;
        for (let i = currentIndex; i >= 0; i--) {
          if (housePoints-- > 0) updateHouse(houses[i]);
        }

        if (housePoints > 0) currentHouseId = 5;
      }
    }
  }
  return [endZones, houses];
}
