<template>
  <section class="game">
    <div class="board__container" v-if="isGameRunning">
      <div class="board__content">
        <div class="endZone__container">
          <div
            class="box endZone"
            :class="{ players: currentPlayer === endZones[0].getOwner }"
          >
            <h3>
              {{ endZones[0].getStones }}
            </h3>
          </div>
        </div>

        <div class="houses__container">
          <div
            class="box house"
            :class="{
              active: currentPlayer === house.getOwner,
              players: currentPlayer === 0 ? i < 6 : i >= 6
            }"
            @click="
              currentPlayer === house.getOwner
                ? moveStones(endZones, houses, i)
                : ''
            "
            v-for="(house, i) in houses"
            :key="i"
          >
            <h3>{{ house.stones }}</h3>
          </div>
        </div>
        <div class="endZone__container">
          <div
            class="box endZone"
            :class="{ players: currentPlayer === endZones[1].getOwner }"
          >
            <h3>
              {{ endZones[1].getStones }}
            </h3>
          </div>
        </div>
      </div>
    </div>
    <div class="game__settings" v-else>
      <h2>Kalaha</h2>
      <p>Choose gamemode</p>
      <button type="button" @click="loadGame">Start</button>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, reactive, Ref, ref, watch } from "vue";
import { movePlayerStones } from "@/services/Server";
import House from "@/services/House";

type GameMode = "PC vs PC" | "PC vs Player" | "Player vs Player";

type EndZone = House;

const loadHouses = () => {
  const numberOfHouses = 12;
  const numberOfStones = 30;
  const numberOfPlayerHouses = 6;
  const houses: House[] = Array(numberOfHouses);

  for (const i of houses.keys())
    houses[i] = new House(i, numberOfStones, i < numberOfPlayerHouses ? 0 : 1);

  return houses;
};

const loadGame = () => {
  const gameMode: Ref<GameMode> = ref("PC vs PC");
  const isGameRunning = ref(false);
  const houses: Ref<House[]> = ref([]);
  const endZones: Ref<EndZone[]> = ref([]);
  const currentPlayer: Ref<number> = ref(0);
  console.log("Kalaha game");
  console.log("Choose game mode: ");
  console.log("PC vs PC", "PC vs Player", "Player vs Player");

  houses.value = loadHouses();
  endZones.value = [new House(12, 0, 0), new House(13, 0, 1)];

  currentPlayer.value = 1;
  gameMode.value = "PC vs PC";

  isGameRunning.value = true;
  console.log(houses.value.length, endZones.value.length);

  return { gameMode, isGameRunning, houses, endZones, currentPlayer };
};

export default defineComponent({
  name: "Game",
  setup() {
    const {
      gameMode,
      houses,
      endZones,
      currentPlayer,
      isGameRunning
    } = loadGame();

    const moveStones = (
      endZones: EndZone[],
      houses: House[],
      houseId: number
    ) => {
      if (houses[houseId].getStones === 0) return [endZones, houses];
      else {
        currentPlayer.value = currentPlayer.value === 0 ? 1 : 0;
        return ([endZones, houses] = movePlayerStones(
          endZones,
          houses,
          houseId
        ));
      }
    };

    return {
      gameMode,
      isGameRunning,
      houses,
      endZones,
      currentPlayer,
      loadGame,
      moveStones
    };
  }
});
</script>

<style lang="scss">
@import "@/assets/styles.scss";
$rows: 2;
$columns: 6;
$verticalGap: 4vh;
$horizontalGap: 8vw;
$houseGap: $horizontalGap / 3;
$houseSize: 8vw;
$houseColor: #f7d6ab;
$houseColorHover: #dfbc8d;
.game {
  width: 100%;
  height: 100vh;
  @include flex;
  flex-direction: column;
  background: #343637;
  background: -webkit-linear-gradient(to bottom, #414345, #343637);
  background: linear-gradient(to bottom, #414345, #343637);

  .board__container {
    @include flex;
    margin: 0 auto;
    padding: $verticalGap;
    background-image: url("../assets/background.png");
    background-position: center;
    background-size: cover;
    .board__content {
      display: grid;
      grid-template-columns: auto;
      row-gap: $houseGap;
      justify-content: center;
      align-items: center;
      .houses__container {
        @include scalable-grid($columns, $rows);
        row-gap: $houseGap;
        column-gap: $houseGap * 4;
        .house {
          width: $houseSize * 2.5;
          height: $houseSize * 2.5;
          background-image: url("../assets/house.png");
          @include backgroundDefault;
        }
      }
      @media (min-width: 450px) {
        .houses__container {
          column-gap: $houseGap * 2;
          .house {
            width: $houseSize * 2;
            height: $houseSize * 2;
          }
        }
      }
      @media (min-width: 768px) {
        grid-template-columns: 0.5fr auto 0.5fr;
        column-gap: $houseGap;

        .houses__container {
          @include scalable-grid($rows, $columns);
          gap: $houseGap;
          .house {
            width: $houseSize;
            height: $houseSize;
          }
        }
      }
      .box {
        background-color: $houseColor;
        border-radius: 20px;
        @include flex;
        @include transition;
        border-radius: 50%;
        &:not(.endZone).players h3 {
          color: $houseColor;
        }
        &:not(.endZone).players:hover {
          cursor: pointer;
          background-color: rgba(0, 0, 0, 0.3);
        }
        &:not(.endZone).players:hover h3 {
          color: $houseColorHover;
        }
        h3 {
          font-weight: bold;
          font-size: 2rem;
          @include transition;
        }
        @media (min-width: 1024px) {
          h3 {
            font-size: 2.5rem;
          }
        }
        @media (min-width: 1650px) {
          h3 {
            font-size: 4rem;
          }
        }
      }
      .endZone__container {
        height: 100%;
        width: 100%;
        @include flex;
        .endZone {
          height: $houseSize * 2;
          width: 100%;
          background-color: transparent;
          &:hover {
            background-color: transparent;
          }
          border-radius: 0;
          @include flex;
          @include backgroundDefault;
          background-image: url("../assets/endZoneHor.png");

          h3 {
            padding: 0 3vh;
          }

          @media (min-width: 768px) {
            width: $houseSize;
            height: 80%;
            border-radius: 30%;
            background-image: url("../assets/endZoneVer.png");
            h3 {
              padding: 2vh 0;
            }
          }
        }
        &:first-of-type {
          align-items: flex-start;
          .endZone {
            justify-content: flex-start;
          }
        }
        &:last-of-type {
          align-items: flex-end;
          .endZone {
            justify-content: flex-end;
          }
        }
        @media (min-width: 768px) {
          &:first-of-type {
            align-items: flex-start;
            .endZone {
              justify-content: center;
              align-items: flex-start;
            }
          }
          &:last-of-type {
            align-items: flex-end;
            .endZone {
              justify-content: center;
              align-items: flex-end;
            }
          }
        }
      }
    }
  }

  @media (min-width: 768px) {
    .board__container {
      max-height: 50vh;
      padding: 4vw;
    }
  }

  .game__settings {
    padding: $verticalGap;
  }
}
</style>
