// Entity factories: player, enemies, coins.
window.AM = window.AM || {};

(function () {
  var T = 32;

  function makePlayer(spawn, character) {
    return {
      kind: "player",
      char: character || "aiden",
      x: spawn.x,
      y: spawn.y,
      w: 26,
      h: 30,
      vx: 0,
      vy: 0,
      onGround: false,
      coyoteTime: 0,
      jumpBuffer: 0,
      facing: 1,
      alive: true,
      invuln: 0,       // seconds of post-hit invulnerability
      deathTimer: 0,   // seconds since death (for drop animation)
      coins: 0,
      lives: 3,
      respawn: { x: spawn.x, y: spawn.y },
    };
  }

  function makeEnemy(def) {
    var x = def.x * T;
    var top = def.y * T;
    var w = 28;
    var h = 28;
    return {
      kind: "enemy",
      type: def.type,
      x: x + (T - w) / 2,
      y: top + (T - h),
      w: w,
      h: h,
      vx: -AM.C.ENEMY_SPEED,
      vy: 0,
      alive: true,
      squishTimer: 0,
      patrolMin: def.patrolMin * T,
      patrolMax: (def.patrolMax + 1) * T,
    };
  }

  function makeCoin(def) {
    return {
      kind: "coin",
      x: def.x * T + T / 2,
      y: def.y * T + T / 2,
      r: 9,
      collected: false,
      t: Math.random() * Math.PI * 2, // for bobbing animation
    };
  }

  AM.entities = {
    makePlayer: makePlayer,
    makeEnemy:  makeEnemy,
    makeCoin:   makeCoin,
  };
})();
