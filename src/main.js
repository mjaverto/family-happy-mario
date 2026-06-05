// Main game glue: boot, loop, state transitions, and 2-level progression.
window.AM = window.AM || {};

(function () {
  var state = {
    mode: "select", // select | playing | levelup | won | gameover
    player: null,
    enemies: [],
    coins: [],
    lastTs: 0,
    solids: [],
    activeCheckpoint: null,
    levelIndex: 0,
    currentCharacter: "aiden",
  };

  function setupPlayerForLevel(level, character) {
    if (!state.player) {
      state.player = AM.entities.makePlayer(level.spawn, character);
      state.player.lives = AM.C.START_LIVES;
      state.player.coins = 0;
      state.player.char = character;
    } else {
      state.player.char = character || state.player.char;
    }

    state.player.x = level.spawn.x;
    state.player.y = level.spawn.y;
    state.player.vx = 0;
    state.player.vy = 0;
    state.player.facing = 1;
    state.player.invuln = 1.2;
    state.player.alive = true;
    state.player.deathTimer = 0;
    state.player.onGround = false;

    state.player.respawn = { x: level.spawn.x, y: level.spawn.y };
    state.activeCheckpoint = { x: level.spawn.x, y: level.spawn.y };
  }

  function loadLevel(index, keepProgress) {
    if (!AM.LEVELS[index]) return;

    var L = AM.LEVELS[index];
    state.levelIndex = index;
    state.solids = L.solidsPx();
    AM.LEVEL = L;

    setupPlayerForLevel(L, state.currentCharacter);

    state.enemies = [];
    for (var i = 0; i < L.enemies.length; i++) {
      state.enemies.push(AM.entities.makeEnemy(L.enemies[i]));
    }

    state.coins = [];
    for (var j = 0; j < L.coins.length; j++) {
      if (keepProgress && state.prevCollected && state.prevCollected[index + ":" + j]) {
        var c = AM.entities.makeCoin(L.coins[j]);
        c.collected = true;
        state.coins.push(c);
      } else {
        state.coins.push(AM.entities.makeCoin(L.coins[j]));
      }
    }

    if (!keepProgress) {
      state.player.lives = AM.C.START_LIVES;
      state.player.coins = 0;
    }

    AM.ui.setWho(state.currentCharacter);
    AM.ui.setLevel(index + 1);
    AM.ui.setCoins(state.player.coins);
    AM.ui.setLives(state.player.lives);

    if (!state.prevCollected) state.prevCollected = {};
    state.currentLevelKey = index;
  }

  function saveCollectedCoins() {
    if (!state.prevCollected) state.prevCollected = {};
    for (var i = 0; i < state.coins.length; i++) {
      var key = state.currentLevelKey + ":" + i;
      if (state.coins[i].collected) state.prevCollected[key] = true;
    }
  }

  function buildRunState(character) {
    state.currentCharacter = character;
    loadLevel(0, false);
  }

  function respawnPlayer() {
    var p = state.player;
    p.alive = true;
    p.deathTimer = 0;
    p.invuln = 1.5;
    p.x = state.activeCheckpoint.x;
    p.y = state.activeCheckpoint.y;
    p.vx = 0;
    p.vy = 0;
    p.onGround = false;
  }

  function killPlayer(reason) {
    var p = state.player;
    if (!p.alive) return;
    p.alive = false;
    p.deathTimer = 0.01;
    p.vx = 0;
    p.vy = -420;
    AM.audio.sfx(reason === "fall" ? "death" : "hurt");
    p.lives -= 1;
    AM.ui.setLives(Math.max(0, p.lives));
  }

  function checkCoinPickups() {
    var p = state.player;
    for (var i = 0; i < state.coins.length; i++) {
      var c = state.coins[i];
      if (c.collected) continue;
      var dx = (p.x + p.w / 2) - c.x;
      var dy = (p.y + p.h / 2) - c.y;
      if (Math.abs(dx) < p.w / 2 + c.r && Math.abs(dy) < p.h / 2 + c.r) {
        c.collected = true;
        p.coins += AM.C.COIN_SCORE;
        saveCollectedCoins();
        AM.ui.setCoins(p.coins);
        AM.audio.sfx("coin");
      }
    }
  }

  function checkEnemyCollisions() {
    var p = state.player;
    if (!p.alive || p.invuln > 0) return;

    for (var i = 0; i < state.enemies.length; i++) {
      var e = state.enemies[i];
      if (!e.alive) continue;
      if (!AM.physics.rectsOverlap(p, e)) continue;

      var playerFeet = p.y + p.h;
      var enemyMid = e.y + e.h * 0.5;
      if (p.vy > 40 && playerFeet < enemyMid + 10) {
        e.alive = false;
        e.squishTimer = 0.4;
        e.vx = 0;
        p.vy = AM.C.STOMP_BOUNCE;
        AM.audio.sfx("stomp");
      } else {
        p.vx = (p.x < e.x ? -1 : 1) * 220;
        p.vy = -260;
        p.invuln = 1.2;
        p.lives -= 1;
        AM.ui.setLives(Math.max(0, p.lives));
        AM.audio.sfx("hurt");

        if (p.lives <= 0) {
          killPlayer("hit");
        }
        break;
      }
    }
  }

  function checkCheckpointAdvance() {
    var L = AM.LEVEL;
    var p = state.player;
    for (var i = 0; i < L.checkpoints.length; i++) {
      var cp = L.checkpoints[i];
      var cpPx = cp.x * L.tile;
      if (p.x + p.w / 2 > cpPx) {
        if (!state.activeCheckpoint || state.activeCheckpoint.x < cpPx) {
          state.activeCheckpoint = { x: cpPx, y: cp.y * L.tile };
        }
      }
    }
  }

  function checkEndCondition() {
    var L = AM.LEVEL;
    var p = state.player;
    if (!p.alive) return;

    var end = L.end;
    if (!end) return;

    if (end.type === "pole") {
      var flagX = end.x * L.tile + L.tile / 2;
      var nextIndex = state.levelIndex + 1;
      if (p.x + p.w > flagX - 12 && p.x < flagX + 12) {
        if (nextIndex >= AM.LEVELS.length) {
          winGame();
          return;
        }

        state.mode = "levelup";
        AM.audio.stopMusic();
        AM.audio.sfx("win");
        AM.ui.showAdvance(
          nextIndex + 1,
          function () {
            AM.audio.startMusic();
            AM.ui.hideAdvance();
            loadLevel(nextIndex, true);
            state.mode = "playing";
          },
          "Go to Level " + (nextIndex + 1)
        );
      }
      return;
    }

    if (end.type === "boss") {
      var bossRect = {
        x: end.x * L.tile,
        y: end.y * L.tile,
        w: end.w * L.tile,
        h: end.h * L.tile,
      };
      if (AM.physics.rectsOverlap(p, bossRect)) {
        winGame();
      }
    }
  }

  function winGame() {
    if (state.mode === "won") return;
    state.mode = "won";
    saveCollectedCoins();
    AM.audio.stopMusic();
    AM.audio.sfx("win");
    AM.ui.showWin(
      state.levelIndex === AM.LEVELS.length - 1 ? "Final Boss: Uncle Brian" : "Level Complete",
      "Play Again",
      restartFromSelect
    );
  }

  function gameOver() {
    if (state.mode === "gameover") return;
    state.mode = "gameover";
    AM.audio.stopMusic();
    AM.ui.showLose();
  }

  function updateCoinsAnim(dt) {
    for (var i = 0; i < state.coins.length; i++) {
      state.coins[i].t += dt * 3;
    }
  }

  function stepGame(dt) {
    var p = state.player;
    var input = AM.input.poll();

    if (p.alive) {
      AM.physics.stepPlayer(p, input, dt, state.solids);
      if (p.y > AM.LEVEL.heightPx + 64) {
        killPlayer("fall");
      }
    } else {
      p.deathTimer += dt;
      p.vy += AM.C.GRAVITY * dt;
      p.y += p.vy * dt;
      if (p.deathTimer > 1.4) {
        if (p.lives > 0) {
          respawnPlayer();
        } else {
          gameOver();
        }
      }
    }

    for (var i = 0; i < state.enemies.length; i++) {
      AM.physics.stepEnemy(state.enemies[i], dt, state.solids);
    }

    if (p.alive) {
      checkCoinPickups();
      checkEnemyCollisions();
      checkCheckpointAdvance();
      checkEndCondition();
    }
    updateCoinsAnim(dt);
  }

  function loop(ts) {
    var dt = 0;
    if (state.lastTs) dt = (ts - state.lastTs) / 1000;
    state.lastTs = ts;
    if (dt > 1 / 20) dt = 1 / 20;

    if (state.mode === "playing") {
      stepGame(dt);
    }
    AM.render.renderAll(state);
    requestAnimationFrame(loop);
  }

  function startGame(character) {
    state.mode = "select";
    buildRunState(character);

    AM.ui.hideSelect();
    AM.ui.hideWin();
    AM.ui.hideLose();
    AM.ui.hideAdvance();

    AM.input.reset();
    AM.audio.startMusic();
    state.mode = "playing";
  }

  function restartFromSelect() {
    state.mode = "select";
    state.prevCollected = {};
    AM.audio.stopMusic();
    AM.ui.hideWin();
    AM.ui.hideLose();
    AM.ui.hideAdvance();
    AM.ui.showSelect();
  }

  window.addEventListener("DOMContentLoaded", function () {
    AM.render.init();
    AM.ui.init();
    AM.input.attach();
    AM.input.markTouch();

    AM.ui.wireCharacterSelect(function (character) {
      startGame(character);
    });
    AM.ui.wireCloseButtons(restartFromSelect, restartFromSelect);

    requestAnimationFrame(function (t) {
      state.lastTs = t;
      loop(t);
    });

    state.player = { x: 0, y: 0, w: 1, h: 1, alive: false, deathTimer: 0, char: "aiden", invuln: 0, facing: 1 };
    state.enemies = [];
    state.coins = [];
    AM.LEVEL = AM.LEVELS[0];
    state.solids = AM.LEVEL.solidsPx();

    AM.ui.setLevel(1);
    AM.ui.setWho("aiden");
  });
})();
