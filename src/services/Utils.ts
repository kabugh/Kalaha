import House from "./House";

// min is inclusive, max is exclusive
export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

export function copyHouses(houses: House[]) {
  const newHouses: House[] = Array(houses.length);

  for (const i of newHouses.keys())
    newHouses[i] = new House(i, houses[i].getStones, houses[i].getOwner);

  return newHouses;
}

export function copyEndZones(endZones: House[]) {
  return [
    new House(endZones[0].getId, endZones[0].getStones, endZones[0].getOwner),
    new House(endZones[1].getId, endZones[1].getStones, endZones[1].getOwner)
  ];
}
