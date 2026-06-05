// Canvas rendering: Dunmore football field style + Mario-style gameplay visuals.
window.AM = window.AM || {};

(function () {
  var canvas, ctx;
  var camera = { x: 0, y: 0, w: 0, h: 0 };

  function init() {
    canvas = document.getElementById("game");
    ctx = canvas.getContext("2d");
    resize();
    window.addEventListener("resize", resize);
  }

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    camera.w = canvas.width;
    camera.h = canvas.height;
  }

  // Follow a target (player), clamped to world bounds.
  function updateCamera(target, level) {
    var targetX = target.x + target.w / 2 - camera.w / 2;
    camera.x += (targetX - camera.x) * 0.15;
    if (camera.x < 0) camera.x = 0;
    var maxCamX = level.widthPx - camera.w;
    if (maxCamX < 0) maxCamX = 0;
    if (camera.x > maxCamX) camera.x = maxCamX;

    if (camera.h >= level.heightPx) {
      camera.y = level.heightPx - camera.h;
    } else {
      var ty = target.y + target.h / 2 - camera.h / 2;
      camera.y += (ty - camera.y) * 0.1;
      if (camera.y < 0) camera.y = 0;
      var maxCamY = level.heightPx - camera.h;
      if (camera.y > maxCamY) camera.y = maxCamY;
    }
  }

  function drawSky() {
    var g = ctx.createLinearGradient(0, 0, 0, camera.h);
    g.addColorStop(0, AM.C.COLOR_SKY_TOP);
    g.addColorStop(1, AM.C.COLOR_SKY_MID);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, camera.w, camera.h);
  }

  function drawFieldBoundary(level) {
    var T = level.tile;
    var fieldTop = 15 * T - camera.y;
    var fieldBottom = 18 * T - camera.y;
    var top = Math.max(0, fieldTop);
    var bottom = Math.min(camera.h, fieldBottom);
    ctx.fillStyle = AM.C.COLOR_FIELD_GRASS;
    ctx.fillRect(0, top, camera.w, Math.max(0, bottom - top));

    ctx.fillStyle = AM.C.COLOR_FIELD_GRASS_DARK;
    ctx.fillRect(0, fieldBottom - 2, camera.w, 2);

    if (level.header) {
      ctx.fillStyle = AM.C.COLOR_FIELD_SIDELINE;
      ctx.font = "bold 17px -apple-system, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(level.header, camera.w / 2 + 1, 26);
    }
  }

  function drawClouds(level) {
    var T = level.tile;
    ctx.save();
    for (var i = 0; i < level.clouds.length; i++) {
      var c = level.clouds[i];
      var px = c.x * T - camera.x * 0.4;
      var py = c.y * T - camera.y * 0.4;
      var s = c.s;
      ctx.fillStyle = AM.C.COLOR_CLOUD;
      ctx.beginPath();
      ctx.arc(px,           py,         22 * s, 0, Math.PI * 2);
      ctx.arc(px + 22 * s,  py - 8 * s, 20 * s, 0, Math.PI * 2);
      ctx.arc(px + 42 * s,  py,         22 * s, 0, Math.PI * 2);
      ctx.arc(px + 24 * s,  py + 6 * s, 18 * s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawGroundRects(level) {
    var T = level.tile;
    for (var i = 0; i < level.ground.length; i++) {
      var g = level.ground[i];
      var px = g.x * T - camera.x;
      var py = g.y * T - camera.y;
      var pw = g.w * T;
      var ph = g.h * T;

      // Earth + dirt top layer.
      ctx.fillStyle = AM.C.COLOR_GROUND;
      ctx.fillRect(px, py, pw, ph);
      ctx.fillStyle = AM.C.COLOR_GROUND_TOP;
      ctx.fillRect(px, py, pw, 6);
      ctx.fillStyle = AM.C.COLOR_GROUND_SHADOW;
      ctx.fillRect(px, py + ph - 3, pw, 3);

      // Football hash lines over ground.
      ctx.strokeStyle = AM.C.COLOR_FIELD_HASH;
      ctx.lineWidth = 1;
      for (var tx = 1; tx < g.w; tx++) {
        if (tx % 2 === 0) {
          ctx.beginPath();
          ctx.moveTo(px + tx * T, py + 2);
          ctx.lineTo(px + tx * T, py + ph - 4);
          ctx.stroke();
        }
      }

      var yMarker = py + ph - 18;
      for (var row = 0; row <= g.h; row++) {
        if (row % 2 === 0) {
          ctx.beginPath();
          ctx.moveTo(px, yMarker + row * 4);
          ctx.lineTo(px + pw, yMarker + row * 4);
          ctx.strokeStyle = AM.C.COLOR_FIELD_HASH;
          ctx.stroke();
        }
      }
    }
  }

  function drawPlatforms(level) {
    var T = level.tile;
    for (var i = 0; i < level.platforms.length; i++) {
      var p = level.platforms[i];
      var px = p.x * T - camera.x;
      var py = p.y * T - camera.y;
      var pw = p.w * T;
      var ph = p.h * T;
      ctx.fillStyle = AM.C.COLOR_BRICK;
      ctx.fillRect(px, py, pw, ph);
      ctx.strokeStyle = AM.C.COLOR_BRICK_LINE;
      ctx.lineWidth = 2;
      ctx.strokeRect(px + 1, py + 1, pw - 2, ph - 2);

      // little brick divider lines
      ctx.beginPath();
      for (var tx = 1; tx < p.w; tx++) {
        ctx.moveTo(px + tx * T, py + 4);
        ctx.lineTo(px + tx * T, py + ph - 4);
      }
      ctx.stroke();
    }
  }

  function drawEndZone(level) {
    var end = level.end;
    if (!end) return;
    if (end.type === "pole") {
      var T = level.tile;
      var poleX = end.x * T + T / 2 - camera.x;
      var top = end.topY * T - camera.y;
      var bottom = end.bottomY * T - camera.y;

      ctx.fillStyle = AM.C.COLOR_FLAG_POLE;
      ctx.fillRect(poleX - 3, top, 6, bottom - top);
      ctx.strokeStyle = AM.C.COLOR_OUTLINE;
      ctx.lineWidth = 2;
      ctx.strokeRect(poleX - 3, top, 6, bottom - top);

      ctx.fillStyle = "#ffd700";
      ctx.beginPath();
      ctx.arc(poleX, top + 2, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = AM.C.COLOR_FLAG;
      ctx.beginPath();
      ctx.moveTo(poleX + 3, top + 8);
      ctx.lineTo(poleX + 40, top + 18);
      ctx.lineTo(poleX + 3, top + 30);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#7a1a1a";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    if (end.type === "boss") {
      var px = end.x * level.tile - camera.x;
      var py = end.y * level.tile - camera.y;
      var w = end.w * level.tile;
      var h = end.h * level.tile;

      // Boss truck.
      ctx.fillStyle = AM.C.BOSS.truckColor;
      ctx.fillRect(px + w * 0.5, py + h - 4, 70, 26);
      ctx.fillRect(px + w * 0.5 - 6, py + h - 10, 60, 12);
      ctx.fillStyle = "#222";
      ctx.fillRect(px + w * 0.5 - 2, py + h - 1, 18, 12);
      ctx.fillRect(px + 34, py + h - 1, 24, 12);

      ctx.fillStyle = AM.C.COLOR_OUTLINE;
      ctx.beginPath();
      ctx.arc(px + 10, py + h + 8, 7, 0, Math.PI * 2);
      ctx.arc(px + 52, py + h + 8, 7, 0, Math.PI * 2);
      ctx.fill();

      // Uncle Brian.
      ctx.fillStyle = "#fff";
      ctx.font = "20px -apple-system, system-ui, 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(AM.C.BOSS.vehicle, px + 40, py + h + 0);
      ctx.fillText(AM.C.BOSS.emoji, px + 12, py + h - 20);

      ctx.font = "bold 11px -apple-system, system-ui, sans-serif";
      ctx.fillText(AM.C.BOSS.name + " — " + AM.C.BOSS.truckLabel, px + 40, py + h - 38);
    }
  }

  function drawHills(level) {
    var T = level.tile;
    for (var i = 0; i < level.hills.length; i++) {
      var h = level.hills[i];
      var px = h.x * T - camera.x;
      var py = h.y * T - camera.y;
      var pw = h.w * T;
      var ph = h.h * T;

      ctx.fillStyle = AM.C.COLOR_HILL_DARK;
      ctx.beginPath();
      ctx.moveTo(px, py + ph);
      ctx.quadraticCurveTo(px + pw / 2, py - ph * 0.6, px + pw, py + ph);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = AM.C.COLOR_HILL;
      ctx.beginPath();
      ctx.moveTo(px + pw * 0.18, py + ph);
      ctx.quadraticCurveTo(px + pw / 2, py - ph * 0.3, px + pw * 0.82, py + ph);
      ctx.closePath();
      ctx.fill();
    }
  }

  function drawCoins(coins) {
    for (var i = 0; i < coins.length; i++) {
      var c = coins[i];
      if (c.collected) continue;
      var px = c.x - camera.x;
      var py = c.y - camera.y + Math.sin(c.t) * 3;
      ctx.fillStyle = "#ffd700";
      ctx.beginPath();
      ctx.arc(px, py, c.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#b8860b";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#fff7c0";
      ctx.beginPath();
      ctx.arc(px - 3, py - 3, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawEmoji(emoji, px, py, size) {
    ctx.font = size + "px -apple-system, system-ui, 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, px, py);
  }

  function drawEnemy(e) {
    var px = e.x - camera.x + e.w / 2;
    var py = e.y - camera.y + e.h / 2;
    if (!e.alive) {
      var emoji = AM.C.ENEMY_TYPES.spider;
      ctx.save();
      ctx.translate(px, py + e.h * 0.3);
      ctx.scale(1.25, 0.35);
      drawEmoji(emoji, 0, 0, 30);
      ctx.restore();
      return;
    }

    var bob = Math.sin(Date.now() / 140 + e.x * 0.03) * 2;
    drawEmoji(AM.C.ENEMY_TYPES.spider, px, py + bob, 28);
    // Duck head motif: the spiders have duck heads.
    drawEmoji(AM.C.ENEMY_TYPES.duck, px, py - 16 + bob, 16);
  }

  function drawPlayer(p) {
    if (!p.alive && p.deathTimer > 0) {
      var px = p.x - camera.x + p.w / 2;
      var py = p.y - camera.y + p.h / 2;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(p.deathTimer * 6);
      var em = (AM.C.CHARS[p.char] || {}).emoji || "👦";
      drawEmoji(em, 0, 0, 30);
      ctx.restore();
      return;
    }
    if (!p.alive) return;

    var px2 = p.x - camera.x + p.w / 2;
    var py2 = p.y - camera.y + p.h / 2;
    if (p.invuln > 0 && Math.floor(p.invuln * 10) % 2 === 0) return;
    var emChar = (AM.C.CHARS[p.char] || {}).emoji || "👦";

    ctx.save();
    if (p.facing < 0) {
      ctx.translate(px2, py2);
      ctx.scale(-1, 1);
      drawEmoji(emChar, 0, 0, 30);
    } else {
      drawEmoji(emChar, px2, py2, 30);
    }
    ctx.restore();
  }

  function drawCheckpoints(level) {
    var T = level.tile;
    for (var i = 0; i < level.checkpoints.length; i++) {
      var cp = level.checkpoints[i];
      if (!cp.emoji) continue;
      var px = cp.x * T + T / 2 - camera.x;
      var py = cp.y * T + T / 2 - camera.y;
      drawEmoji(cp.emoji, px, py, 28);

      var label = cp.label || "";
      if (!label) continue;
      ctx.font = "bold 12px -apple-system, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      var mw = ctx.measureText(label).width + 10;
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.strokeStyle = AM.C.COLOR_OUTLINE;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(px - mw / 2, py - 38, mw, 18, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = AM.C.COLOR_OUTLINE;
      ctx.fillText(label, px, py - 29);
    }
  }

  function drawCameos(level) {
    var T = level.tile;
    for (var i = 0; i < level.cameos.length; i++) {
      var c = level.cameos[i];
      var px = c.x * T + T / 2 - camera.x;
      var py = c.y * T + T / 2 - camera.y + Math.sin(Date.now() / 400 + c.x) * 2;
      drawEmoji(c.emoji, px, py, 30);
    }

    // Buck mascots from level-specific placements.
    if (!level.mascots) return;
    for (var j = 0; j < level.mascots.length; j++) {
      var m = level.mascots[j];
      var bx = m.x * T - camera.x;
      var by = m.y * T + T / 2 - camera.y;
      drawEmoji("🦬", bx + T / 2, by, 24);
      if (m.side < 0) {
        drawEmoji("🦬", bx + T / 2 - 16, by, 12);
      } else {
        drawEmoji("🦬", bx + T / 2 + 16, by, 12);
      }
    }
  }

  // Polyfill for roundRect in older browsers.
  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      if (typeof r === "undefined") r = 6;
      this.beginPath();
      this.moveTo(x + r, y);
      this.arcTo(x + w, y,     x + w, y + h, r);
      this.arcTo(x + w, y + h, x,     y + h, r);
      this.arcTo(x,     y + h, x,     y,     r);
      this.arcTo(x,     y,     x + w, y,     r);
      this.closePath();
      return this;
    };
  }

  function drawGoalPost(level) {
    var end = level.end;
    if (!end || end.type !== "pole") return;
    var T = level.tile;
    var px = end.x * T - camera.x;
    var py = end.bottomY * T - 7 - camera.y;
    ctx.fillStyle = AM.C.COLOR_OUTLINE;
    ctx.fillRect(px, py - 6, 2, 10);
    ctx.fillRect(px + 48, py - 2, 2, 10);
    ctx.fillRect(px + 24, py + 12, 14, 2);
  }

  function renderAll(state) {
    var level = AM.LEVEL;
    updateCamera(state.player, level);
    drawSky();
    drawFieldBoundary(level);
    drawHills(level);
    drawClouds(level);
    drawCameos(level);
    drawGroundRects(level);
    drawPlatforms(level);
    drawGoalPost(level);
    drawEndZone(level);
    drawCheckpoints(level);
    drawCoins(state.coins);

    for (var i = 0; i < state.enemies.length; i++) {
      var e = state.enemies[i];
      if (!e.alive && e.squishTimer <= 0) continue;
      if (e.x - camera.x < -64 || e.x - camera.x > camera.w + 64) continue;
      drawEnemy(e);
    }
    drawPlayer(state.player);
  }

  AM.render = {
    init: init,
    renderAll: renderAll,
    camera: camera,
  };
})();
