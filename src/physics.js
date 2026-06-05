// Physics: gravity + axis-separated AABB collision resolution against solid rectangles.
window.AM = window.AM || {};

(function () {
  function rectsOverlap(a, b) {
    return a.x < b.x + b.w &&
           a.x + a.w > b.x &&
           a.y < b.y + b.h &&
           a.y + a.h > b.y;
  }

  // Move an entity by (dx,dy), resolving collisions against `solids` one axis at a time.
  // Returns a summary of collisions: {hitBottom, hitTop, hitLeft, hitRight}.
  function moveAndCollide(ent, dx, dy, solids) {
    var info = { hitBottom: false, hitTop: false, hitLeft: false, hitRight: false };

    // --- X axis ---
    ent.x += dx;
    for (var i = 0; i < solids.length; i++) {
      var s = solids[i];
      if (rectsOverlap(ent, s)) {
        if (dx > 0) {
          ent.x = s.x - ent.w;
          info.hitRight = true;
        } else if (dx < 0) {
          ent.x = s.x + s.w;
          info.hitLeft = true;
        }
      }
    }

    // --- Y axis ---
    ent.y += dy;
    for (var j = 0; j < solids.length; j++) {
      var s2 = solids[j];
      if (rectsOverlap(ent, s2)) {
        if (dy > 0) {
          ent.y = s2.y - ent.h;
          info.hitBottom = true;
        } else if (dy < 0) {
          ent.y = s2.y + s2.h;
          info.hitTop = true;
        }
      }
    }

    return info;
  }

  function stepPlayer(player, input, dt, solids) {
    player.prevY = player.y;
    player.prevVy = player.vy;

    // Horizontal acceleration / deceleration
    var accel = AM.C.RUN_ACCEL * (player.onGround ? 1 : AM.C.AIR_CONTROL);
    var decel = AM.C.RUN_DECEL * (player.onGround ? 1 : AM.C.AIR_CONTROL * 0.6);

    if (input.left && !input.right) {
      player.vx -= accel * dt;
      player.facing = -1;
    } else if (input.right && !input.left) {
      player.vx += accel * dt;
      player.facing = 1;
    } else {
      if (player.vx > 0) {
        player.vx = Math.max(0, player.vx - decel * dt);
      } else if (player.vx < 0) {
        player.vx = Math.min(0, player.vx + decel * dt);
      }
    }
    if (player.vx >  AM.C.RUN_MAX) player.vx =  AM.C.RUN_MAX;
    if (player.vx < -AM.C.RUN_MAX) player.vx = -AM.C.RUN_MAX;

    // Jump (press, not hold, handled via input.jumpPressed flag)
    if (input.jumpPressed && player.onGround) {
      player.vy = AM.C.JUMP_V;
      player.onGround = false;
      if (AM.audio && AM.audio.sfx) AM.audio.sfx("jump");
    }

    // Variable-height jump: if released early while still going up, cut the rise.
    if (!input.jump && player.vy < -140) {
      player.vy = -140;
    }

    // Gravity
    player.vy += AM.C.GRAVITY * dt;
    if (player.vy > AM.C.MAX_FALL) player.vy = AM.C.MAX_FALL;

    // Move
    var info = moveAndCollide(player, player.vx * dt, player.vy * dt, solids);
    if (info.hitBottom) {
      player.onGround = true;
      player.vy = 0;
    } else {
      player.onGround = false;
    }
    if (info.hitTop)    player.vy = 0;
    if (info.hitLeft)   player.vx = 0;
    if (info.hitRight)  player.vx = 0;

    if (player.invuln > 0) player.invuln -= dt;
  }

  function stepEnemy(enemy, dt, solids) {
    if (!enemy.alive) {
      enemy.squishTimer -= dt;
      return;
    }
    // Gravity
    enemy.vy += AM.C.GRAVITY * dt;
    if (enemy.vy > AM.C.MAX_FALL) enemy.vy = AM.C.MAX_FALL;

    // Turn at patrol bounds
    if (enemy.vx < 0 && enemy.x <= enemy.patrolMin) {
      enemy.vx = AM.C.ENEMY_SPEED;
    } else if (enemy.vx > 0 && enemy.x + enemy.w >= enemy.patrolMax) {
      enemy.vx = -AM.C.ENEMY_SPEED;
    }

    var info = moveAndCollide(enemy, enemy.vx * dt, enemy.vy * dt, solids);
    if (info.hitBottom) enemy.vy = 0;
    if (info.hitLeft  && enemy.vx < 0) enemy.vx = AM.C.ENEMY_SPEED;
    if (info.hitRight && enemy.vx > 0) enemy.vx = -AM.C.ENEMY_SPEED;
  }

  AM.physics = {
    rectsOverlap: rectsOverlap,
    moveAndCollide: moveAndCollide,
    stepPlayer: stepPlayer,
    stepEnemy: stepEnemy,
  };
})();
