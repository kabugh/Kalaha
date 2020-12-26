<template>
  <section class="game">
    <transition name="fade" mode="out-in">
      <div class="game__container" v-if="isGameRunning && !endResult">
        <transition name="slide-fade" mode="out-in">
          <div
            class="player__indicator"
            style="backgroundColor: #db0a5b"
            v-if="currentPlayer == 0"
          >
            {{ playerName(currentPlayer) }}
          </div>
          <div
            class="player__indicator"
            style="backgroundColor: #5333ed"
            v-else
          >
            {{ playerName(currentPlayer) }}
          </div>
        </transition>
        <div class="board__container">
          <div class="board__content">
            <div class="endZone__container">
              <div
                class="box endZone"
                :class="{
                  players:
                    currentPlayer === endZones[0].getOwner &&
                    currentGameMode != gameModes[0]
                }"
              >
                <h3>
                  {{ endZones[0].getStones }}
                </h3>
              </div>
            </div>

            <div class="houses__container">
              <!-- &&currentGameMode != gameModes[0] -->
              <div
                class="box house"
                :class="{
                  players: currentPlayer === 0 ? i < 6 : i >= 6
                }"
                @click="
                  currentPlayer === house.getOwner &&
                  currentGameMode != gameModes[0]
                    ? moveStones(houses, endZones, i)
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
                :class="{
                  players:
                    currentPlayer === endZones[1].getOwner &&
                    currentGameMode != gameModes[0]
                }"
              >
                <h3>{{ endZones[1].getStones }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="game__settings" v-else-if="!isGameRunning && !endResult">
        <h2>Kalaha</h2>
        <p>Gamemode</p>
        <select v-model="currentGameMode">
          <option v-for="gameMode in gameModes" :key="gameMode">{{
            gameMode
          }}</option>
        </select>
        <div class="difficulty__container">
          <p>PC advancement</p>
          <select v-model="currentDifficulty">
            <option v-for="difficulty in difficulties" :key="difficulty">{{
              difficulty
            }}</option>
          </select>
        </div>

        <button type="button" @click="startGame">
          Start
        </button>
      </div>
      <div class="result__container" v-else>
        <div class="result__content">
          <h1>Game Over!</h1>
          <h2 v-if="endResult.winner != -1">
            The winner is: {{ playerName(endResult.winner) }}
          </h2>
          <h2 v-else>Draw.</h2>
          <div class="result__tile">
            <p>
              {{
                `${playerName(0)}: ${endResult.firstPlayerScore}
              points`
              }}
            </p>
          </div>
          <div class="result__tile">
            <p>
              {{
                `${playerName(1)}: ${endResult.secondPlayerScore}
              points`
              }}
            </p>
          </div>
        </div>
        <button type="button" @click="restartGame">Try again</button>
      </div>
    </transition>
    <p class="footer">
      Coded using Vue 3 composition api 💚 by
      <a href="https://github.com/kabugh" target="_blank">kabugh</a>
    </p>
  </section>
  <!-- <button type="button" @click="">Ai move</button> -->
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from "vue";
import {
  calculateResult,
  isGameOver,
  movePlayerStones,
  Result
} from "@/services/Server";
import { randomMoveAi } from "@/services/AiPlayer";
import House from "@/services/House";

type EndZone = House;

const loadHouses = () => {
  const numberOfHouses = 12;
  const numberOfStones = 2;
  const numberOfPlayerHouses = 6;
  const houses: House[] = Array(numberOfHouses);

  for (const i of houses.keys())
    houses[i] = new House(i, numberOfStones, i < numberOfPlayerHouses ? 0 : 1);

  return houses;
};

const loadGame = () => {
  const gameModes: Ref<string[]> = ref([
    "PC vs PC",
    "PC vs Player",
    "Player vs Player"
  ]);
  const currentGameMode: Ref<string> = ref(gameModes.value[0]);
  const difficulties: Ref<string[]> = ref([
    "Random decisions",
    "Decision tree based"
  ]);
  const currentDifficulty: Ref<string> = ref(difficulties.value[0]);
  const isGameRunning: Ref<boolean> = ref(false);

  const houses: Ref<House[]> = ref([]);
  const endZones: Ref<EndZone[]> = ref([]);
  const currentPlayer: Ref<number> = ref(1);
  const endResult: Ref<Result | null> = ref(null);

  houses.value = loadHouses();
  endZones.value = [new House(12, 0, 0), new House(13, 0, 1)];

  return {
    gameModes,
    currentGameMode,
    difficulties,
    currentDifficulty,
    isGameRunning,
    houses,
    endZones,
    endResult,
    currentPlayer
  };
};

export default defineComponent({
  name: "Game",
  setup() {
    /* eslint-disable prefer-const */
    let {
      gameModes,
      currentGameMode,
      difficulties,
      currentDifficulty,
      houses,
      endZones,
      currentPlayer,
      endResult,
      isGameRunning
    } = loadGame();

    const endGame = (houses: House[], endZones: House[]) => {
      endResult.value = calculateResult(houses, endZones);
      isGameRunning.value = false;
    };

    const moveStones = (
      houses: House[],
      endZones: EndZone[],
      houseId: number
    ) => {
      if (houses[houseId].getStones == 0) return;
      else {
        const moveResult = movePlayerStones(houses, endZones, houseId);
        if (!moveResult.additionalMove)
          currentPlayer.value = currentPlayer.value == 0 ? 1 : 0;

        if (isGameOver(moveResult.houses))
          endGame(moveResult.houses, moveResult.endZones);
      }
    };

    const restartGame = () => {
      isGameRunning.value = false;
      houses.value = loadHouses();
      endZones.value = [new House(12, 0, 0), new House(13, 0, 1)];
      currentPlayer.value = 1;
      endResult.value = null;
    };

    const playerName = (currentPlayer: number) => {
      switch (currentGameMode.value) {
        case gameModes.value[0]:
          return currentPlayer == 0 ? "PC 1" : "PC 2";
        case gameModes.value[1]:
          return currentPlayer == 0 ? "PC" : "You";
        case gameModes.value[2]:
          return currentPlayer == 0 ? "P 1" : "P 2";
        default:
          return "";
      }
    };

    const simulateMove = async (houses: House[], endZones: House[]) => {
      await new Promise<void>(resolve =>
        setTimeout(() => {
          const moveResult = randomMoveAi(houses, endZones, currentPlayer);
          if (isGameOver(moveResult.houses))
            endGame(moveResult.houses, moveResult.endZones);

          if (!moveResult.additionalMove)
            currentPlayer.value = currentPlayer.value == 0 ? 1 : 0;
          resolve();
        }, 2000)
      );
    };

    const simulation = async (houses: House[], endZones: House[]) => {
      while (isGameRunning.value) {
        console.log(isGameRunning.value);
        await simulateMove(houses, endZones);
      }
    };

    const startGame = () => {
      isGameRunning.value = !isGameRunning.value;
      if (currentGameMode.value == gameModes.value[0])
        simulation(houses.value, endZones.value);
    };

    return {
      gameModes,
      currentGameMode,
      difficulties,
      currentDifficulty,
      isGameRunning,
      houses,
      endZones,
      currentPlayer,
      endResult,
      loadGame,
      moveStones,
      restartGame,
      playerName,
      startGame
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
  .game__container {
    @include flex;
    flex-direction: column;
    .player__indicator {
      width: $houseSize;
      height: $houseSize;
      border-radius: 50%;
      background-color: white;
      @include flex;
      margin-bottom: 2vh;
      font-weight: bold;
      @media (min-width: 768px) {
        font-size: 1rem;
        width: $houseSize / 1.5;
        height: $houseSize / 1.5;
        margin-bottom: 4vh;
      }
      @media (min-width: 1024px) {
        font-size: 1.25rem;
      }
      @media (min-width: 1650px) {
        font-size: 2rem;
      }
    }
  }
  .board__container {
    @include flex;
    margin: 0 auto;
    padding: $verticalGap;
    background-image: url("../assets/background.png");
    background-position: center;
    background-size: cover;
    border-radius: 100px;
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
    display: flex;
    flex-direction: column;
    padding: $verticalGap;
    select {
      margin-bottom: 1vh;
      text-transform: unset;
      width: 100%;
    }
    h2 {
      font-size: 3rem;
      padding-bottom: 0;
    }
    p {
      font-size: 1.125rem;
    }
    button {
      margin-top: 1vh;
    }
  }

  .result__container {
    .result__content {
      padding: 2vh 0;
      h1 {
        font-size: 3rem;
        padding-bottom: 0;
      }
      h2 {
        font-size: 2rem;
      }
    }
  }

  p.footer {
    position: absolute;
    bottom: 1vh;
    font-size: 0.75rem;
    a {
      text-decoration: none;
      font-weight: bold;
      color: white;
    }
  }
}
</style>
