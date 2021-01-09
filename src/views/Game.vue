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
              <div
                class="box house"
                :class="{
                  active:
                    ((currentPlayer === 0 ? i < 6 : i >= 6) &&
                      currentGameMode == gameModes[2] &&
                      !blockUserMove) ||
                    (i >= 6 &&
                      currentPlayer == 1 &&
                      currentGameMode == gameModes[1] &&
                      !blockUserMove),
                  players: currentPlayer === 0 ? i < 6 : i >= 6,
                  currentMove: currentHouseMove == i
                }"
                @click="prepareToMove(house, i)"
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
          <select
            v-model="currentDifficulty"
            :disabled="currentGameMode == gameModes[2]"
          >
            <option v-for="difficulty in difficulties" :key="difficulty">{{
              difficulty
            }}</option>
          </select>
        </div>
        <div class="checkbox">
          <label>
            <input type="checkbox" v-model="isTimeLimited" /><span
              class="checkbox-material"
              ><span class="check"></span
            ></span>
            <p>{{ timeLimit }} sec round limit</p>
          </label>
        </div>
        <button type="button" @click="startGame" :disabled="isGameRunning">
          Start
        </button>
      </div>
      <div class="result__container" v-else>
        <div class="result__content">
          <h1>Game Over!</h1>
          <h2 v-if="endResult.winner != -1">
            The winner is {{ playerName(endResult.winner) }}
          </h2>
          <h2 v-else>Draw.</h2>
          <p>
            Total points:
            {{ endResult.firstPlayerScore + endResult.secondPlayerScore }}
          </p>
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
</template>

<script lang="ts">
import { defineComponent, inject, Ref, ref, watch } from "vue";
import {
  calculateResult,
  checkPlayerMove,
  isGameOver,
  moveInfo,
  movePlayerStones,
  MoveResult,
  Result,
  sumStones
} from "@/services/Server";
import {
  advancedMoveAi,
  randomMoveAi,
  numberOfPlayerHouses as playerHousesQuantity,
  decisionTreeMoveAi
} from "@/services/AiPlayer";
import House from "@/services/House";

type EndZone = House;

const loadHouses = () => {
  const numberOfHouses = 12;
  const numberOfStones = 6;
  const numberOfPlayerHouses = playerHousesQuantity;
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
    "Following some rules",
    "Decision tree based"
  ]);
  const currentDifficulty: Ref<string> = ref(difficulties.value[0]);
  const isTimeLimited: Ref<boolean> = ref(false);
  const didPlayerMove: Ref<boolean> = ref(false);
  const currentTimer: Ref<number> = ref(0);
  const currentInterval: Ref<number> = ref(0);
  const blockUserMove: Ref<boolean> = ref(false);
  const isGameRunning: Ref<boolean> = ref(false);
  const timeLimit = 15;

  const houses: Ref<House[]> = ref([]);
  const endZones: Ref<EndZone[]> = ref([]);
  const currentPlayer: Ref<number> = ref(0);
  const endResult: Ref<Result | null> = ref(null);

  const currentHouseMove: Ref<number> = ref(-1);

  houses.value = loadHouses();
  endZones.value = [new House(12, 0, 0), new House(13, 0, 1)];

  return {
    gameModes,
    currentGameMode,
    difficulties,
    currentDifficulty,
    isTimeLimited,
    didPlayerMove,
    currentTimer,
    currentInterval,
    blockUserMove,
    isGameRunning,
    timeLimit,
    houses,
    endZones,
    endResult,
    currentPlayer,
    currentHouseMove
  };
};

export default defineComponent({
  name: "Game",
  setup() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const progressBar: any = inject("progressBar");
    /* eslint-disable prefer-const */
    let {
      gameModes,
      currentGameMode,
      difficulties,
      currentDifficulty,
      isTimeLimited,
      didPlayerMove,
      currentTimer,
      currentInterval,
      blockUserMove,
      timeLimit,
      houses,
      endZones,
      currentPlayer,
      endResult,
      isGameRunning,
      currentHouseMove
    } = loadGame();

    const endGame = (houses: House[], endZones: House[]) => {
      endResult.value = calculateResult(houses, endZones);
      isGameRunning.value = false;
      currentHouseMove.value = -1;
      progressBar.finish();
    };

    const restartGame = () => {
      didPlayerMove.value = false;
      isGameRunning.value = false;
      houses.value = loadHouses();
      endZones.value = [new House(12, 0, 0), new House(13, 0, 1)];
      currentPlayer.value = 0;
      endResult.value = null;
      currentHouseMove.value = -1;
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

    const simulateMove = async (
      houses: House[],
      endZones: House[],
      currentHouseMove: Ref<number>
    ) => {
      return await new Promise<MoveResult>(resolve =>
        setTimeout(async () => {
          let moveResult: MoveResult;
          if (currentDifficulty.value == difficulties.value[0]) {
            moveResult = randomMoveAi(
              houses,
              endZones,
              currentPlayer,
              currentHouseMove
            );
          } else if (currentDifficulty.value == difficulties.value[1]) {
            moveResult = advancedMoveAi(
              houses,
              endZones,
              currentPlayer,
              currentHouseMove
            );
          } else
            moveResult = decisionTreeMoveAi(
              houses,
              endZones,
              currentPlayer,
              currentHouseMove
            );

          moveInfo(
            moveResult.houses,
            moveResult.endZones,
            currentHouseMove.value,
            currentPlayer.value
          );

          if (isGameOver(moveResult.houses))
            endGame(moveResult.houses, moveResult.endZones);

          if (!moveResult.additionalMove)
            currentPlayer.value = currentPlayer.value == 0 ? 1 : 0;
          else if (moveResult.additionalMove && isTimeLimited.value) {
            if (
              currentGameMode.value == gameModes.value[2] ||
              (currentGameMode.value == gameModes.value[1] &&
                currentPlayer.value == 1)
            ) {
              progressBar.start(timeLimit);
              progressBar.setColor(
                currentPlayer.value == 0 ? "#db0a5b" : "#5333ed"
              );
              blockUserMove.value = false;
              const didMove = await checkPlayerMove(
                didPlayerMove,
                currentTimer,
                currentInterval,
                timeLimit
              );

              if (!didMove) {
                progressBar.fail();
                blockUserMove.value = true;
                await simulateMove(houses, endZones, currentHouseMove);
                blockUserMove.value = false;
              }
            }
          }
          resolve(moveResult);
        }, 2000)
      );
    };

    const autoSimulation = async (houses: House[], endZones: House[]) => {
      while (isGameRunning.value) {
        await simulateMove(houses, endZones, currentHouseMove);
      }
    };

    const partialSimulation = async (houses: House[], endZones: House[]) => {
      if (currentPlayer.value == 0) {
        let moveResult = await simulateMove(houses, endZones, currentHouseMove);

        // PC has an additional move, so prompt him to move
        while (moveResult.additionalMove) {
          moveResult = await simulateMove(
            moveResult.houses,
            moveResult.endZones,
            currentHouseMove
          );
        }
      }
    };

    const moveStones = async (
      houses: House[],
      endZones: EndZone[],
      houseId: number
    ) => {
      if (houses[houseId].getStones == 0) return;
      else {
        if (isTimeLimited.value) didPlayerMove.value = true;
        const moveResult = movePlayerStones(houses, endZones, houseId);
        moveInfo(houses, endZones, houseId, currentPlayer.value);

        if (!moveResult.additionalMove)
          currentPlayer.value = currentPlayer.value == 0 ? 1 : 0;
        else if (moveResult.additionalMove && isTimeLimited.value) {
          progressBar.start(timeLimit);
          progressBar.setColor(
            currentPlayer.value == 0 ? "#db0a5b" : "#5333ed"
          );
          const didMove = await checkPlayerMove(
            didPlayerMove,
            currentTimer,
            currentInterval,
            timeLimit
          );
          if (!didMove) {
            blockUserMove.value = true;
            await simulateMove(houses, endZones, currentHouseMove);
            blockUserMove.value = false;
          }
        }

        if (isGameOver(moveResult.houses))
          endGame(moveResult.houses, moveResult.endZones);
      }
    };

    const startGame = async () => {
      const areHousesFull = sumStones(houses.value) == houses.value.length * 6;
      if (isGameRunning.value || !areHousesFull) {
        if (!areHousesFull) endGame(houses.value, endZones.value);
        return;
      }

      isGameRunning.value = !isGameRunning.value;
      if (currentGameMode.value == gameModes.value[0])
        autoSimulation(houses.value, endZones.value);
      else if (currentGameMode.value == gameModes.value[1])
        partialSimulation(houses.value, endZones.value);
      else if (
        currentGameMode.value == gameModes.value[2] &&
        isTimeLimited.value
      ) {
        progressBar.start(timeLimit);
        progressBar.setColor(currentPlayer.value == 0 ? "#db0a5b" : "#5333ed");
        const didMove = await checkPlayerMove(
          didPlayerMove,
          currentTimer,
          currentInterval,
          timeLimit
        );

        if (!didMove) {
          progressBar.fail();
          blockUserMove.value = true;
          await simulateMove(houses.value, endZones.value, currentHouseMove);
          blockUserMove.value = false;
        }
      }
    };

    const prepareToMove = async (house: House, i: number) => {
      if (currentPlayer.value === house.getOwner && !blockUserMove.value) {
        if (currentGameMode.value == gameModes.value[2])
          moveStones(houses.value, endZones.value, i);
        else if (currentGameMode.value == gameModes.value[1] && i >= 6) {
          moveStones(houses.value, endZones.value, i);
        }
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    watch(currentPlayer, async (nextPlayer: number, prevPlayer: number) => {
      if (isGameRunning.value) {
        if (currentGameMode.value == gameModes.value[1] && nextPlayer == 0) {
          if (isTimeLimited.value) progressBar.finish();
          partialSimulation(houses.value, endZones.value);
        }
        if (isTimeLimited.value) {
          if (
            (currentGameMode.value == gameModes.value[1] && nextPlayer == 1) ||
            currentGameMode.value == gameModes.value[2]
          ) {
            progressBar.start(timeLimit);
            progressBar.setColor(
              currentPlayer.value == 0 ? "#db0a5b" : "#5333ed"
            );
            const didMove = await checkPlayerMove(
              didPlayerMove,
              currentTimer,
              currentInterval,
              timeLimit
            );
            if (!didMove) {
              progressBar.fail();
              blockUserMove.value = true;
              await simulateMove(
                houses.value,
                endZones.value,
                currentHouseMove
              );
              blockUserMove.value = false;
            }
          }
        }
      }
    });
    return {
      gameModes,
      currentGameMode,
      difficulties,
      currentDifficulty,
      isTimeLimited,
      didPlayerMove,
      currentTimer,
      timeLimit,
      blockUserMove,
      isGameRunning,
      houses,
      endZones,
      currentPlayer,
      endResult,
      loadGame,
      moveStones,
      restartGame,
      playerName,
      startGame,
      currentHouseMove,
      prepareToMove
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
$currentMove: #ff950d;

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
        &:not(.endZone).active:hover {
          cursor: pointer;
          background-color: rgba(0, 0, 0, 0.3);
        }
        &:not(.endZone).players h3 {
          color: $houseColor;
        }
        &:not(.endZone).active:hover h3 {
          color: $houseColorHover;
        }
        &:not(.endZone).currentMove {
          color: $currentMove;
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
