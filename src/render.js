// Canvas rendering: Dunmore football field style + Mario-style gameplay visuals.
window.AM = window.AM || {};

(function () {
  var canvas, ctx;
  var camera = { x: 0, y: 0, w: 0, h: 0 };

  function init() {
    canvas = document.getElementById("game");
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
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

      // Draw stylized boss truck.
      var tx = px + w * 0.5;
      var truckY = py + h - 9;
      ctx.fillStyle = AM.C.BOSS.truckColor;
      ctx.fillRect(tx, truckY - 28, 84, 20);
      ctx.fillRect(tx + 4, truckY - 36, 58, 16);
      ctx.fillStyle = AM.C.COLOR_OUTLINE;
      ctx.fillRect(tx + 2, truckY - 20, 84, 2);
      ctx.fillStyle = AM.C.BOSS.windowColor;
      ctx.fillRect(tx + 44, truckY - 34, 12, 12);
      ctx.fillRect(tx + 60, truckY - 34, 12, 12);

      // rear / front wheels
      ctx.fillStyle = AM.C.COLOR_OUTLINE;
      ctx.beginPath();
      ctx.arc(tx + 14, truckY, 9, 0, Math.PI * 2);
      ctx.arc(tx + 72, truckY, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#d0d0d0";
      ctx.beginPath();
      ctx.arc(tx + 14, truckY, 4, 0, Math.PI * 2);
      ctx.arc(tx + 72, truckY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Boss character (Uncle Brian) standing near truck front.
      var bx = tx - 28;
      var by = truckY - 36;
      ctx.fillStyle = AM.C.BOSS.jacket;
      ctx.fillRect(bx, by, 18, 12);
      ctx.fillStyle = AM.C.BOSS.shirt;
      ctx.fillRect(bx + 2, by + 12, 14, 8);

      ctx.fillStyle = AM.C.BOSS.skin;
      ctx.beginPath();
      ctx.arc(bx + 9, by - 8, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = AM.C.COLOR_OUTLINE;
      ctx.beginPath();
      ctx.arc(bx + 6, by - 7, 1.6, 0, Math.PI * 2);
      ctx.arc(bx + 12, by - 7, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = AM.C.BOSS.shirt;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(bx + 9, by - 4, 3, 0, Math.PI * 2);
      ctx.stroke();

      // label on boss
      ctx.font = "bold 11px -apple-system, system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(255,255,255,0.96)";
      ctx.fillText(AM.C.BOSS.name, tx - 18, py + h - 44);
      ctx.fillText(AM.C.BOSS.truckLabel, tx - 18, py + h - 30);
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

  function drawKidSprite(cfg, px, py, facing, t, deadMode) {
    cfg = cfg || {};
    cfg.palette = cfg.palette || {};
    var shirt = cfg.palette.shirt || "#2f6de0";
    var shorts = cfg.palette.shorts || "#112c5a";
    var skin = cfg.palette.skin || "#f2be84";
    var shoe = cfg.palette.shoe || "#2c2417";
    var hair = cfg.palette.hair || "#553722";
    var cap = cfg.palette.cap || shirt;
    var outline = cfg.palette.outline || "#1d1d1d";
    t = t || 0;

    if (facing === 0) facing = 1;
    var bob = Math.sin(t * 14 + px) * 0.45;

    if (deadMode) {
      ctx.save();
      ctx.translate(px, py);
      ctx.fillStyle = "#f4d7c1";
      ctx.beginPath();
      ctx.ellipse(0, 4, 7, 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    function block(x, y, w, h, color) {
      if (!color) return;
      ctx.fillStyle = color;
      ctx.fillRect((x) * 2, (y) * 2, (w) * 2, (h) * 2);
    }

    ctx.save();
    ctx.translate(px, py);
    if (facing < 0) {
      ctx.scale(-1, 1);
    }

    // Mario-like block sprite silhouette.
    var x = -7;
    var y = -24;

    block(x + 1, y + 1, 12, 2, hair);
    block(x + 3, y + 1, 8, 2, cap);
    block(x + 2, y + 3, 10, 2, hair);
    block(x + 2, y + 4, 10, 1, outline);

    block(x + 2, y + 5, 10, 8, skin);
    block(x + 3, y + 5, 1, 1, "#fff");
    block(x + 10, y + 5, 1, 1, "#fff");
    block(x + 4, y + 6, 1, 1, outline);
    block(x + 9, y + 6, 1, 1, outline);
    block(x + 4, y + 7, 2, 1, outline);
    block(x + 8, y + 7, 2, 1, outline);

    block(x + 2, y + 13, 10, 9, shirt);
    block(x + 2, y + 22, 10, 4, shorts);

    block(x + 1, y + 21, 4, 3, shoe);
    block(x + 9, y + 21, 4, 3, shoe);
    block(x + 0, y + 24, 2, 2, outline);
    block(x + 12, y + 24, 2, 2, outline);
    block(x + 1, y + 26, 4, 2, shoe);
    block(x + 9, y + 26, 4, 2, shoe);

    block(x + 0, y + 13, 2, 7, shirt);
    block(x + 12, y + 13, 2, 7, shirt);
    block(x + 0, y + 12 + bob, 1, 2, outline);
    block(x + 13, y + 12 - bob, 1, 2, outline);

    block(x + 2, y + 18, 2, 1, outline);
    block(x + 10, y + 18, 2, 1, outline);
    ctx.restore();
  }

  function drawDuckHead(x, y) {
    ctx.fillStyle = AM.C.ENEMY_TYPES.duck;
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = AM.C.BOSS.jacket;
    ctx.beginPath();
    ctx.moveTo(x - 4, y + 1);
    ctx.lineTo(x + 5, y);
    ctx.lineTo(x - 4, y + 5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = AM.C.ENEMY_TYPES.duckEyes;
    ctx.beginPath();
    ctx.arc(x - 2, y - 2, 1.3, 0, Math.PI * 2);
    ctx.arc(x + 2, y - 2, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillRect(x - 3.5, y - 0.7, 2, 1.2);
    ctx.fillRect(x + 1.5, y - 0.7, 2, 1.2);
  }

  function drawMascot(px, py) {
    // Buck mascot from Dunmore mascot theme.
    ctx.fillStyle = "#5b8e45";
    ctx.beginPath();
    ctx.roundRect(px - 7, py - 10, 14, 16, 4);
    ctx.fill();
    ctx.fillStyle = "#7a5a38";
    ctx.beginPath();
    ctx.arc(px, py - 14, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(px - 2, py - 10, 1.5, 2.5, 0, 0, Math.PI * 2);
    ctx.ellipse(px + 2, py - 10, 1.5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#2d4a3e";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px - 7, py - 4);
    ctx.lineTo(px - 12, py - 9);
    ctx.moveTo(px + 7, py - 4);
    ctx.lineTo(px + 12, py - 8);
    ctx.stroke();
  }

  function drawEnemy(e) {
    var px = e.x - camera.x + e.w / 2;
    var py = e.y - camera.y + e.h / 2;
    if (!e.alive) {
      ctx.save();
      ctx.translate(px, py + 12);
      ctx.scale(1.2, 0.35);
      ctx.fillStyle = AM.C.ENEMY_TYPES.web;
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    var bob = Math.sin(Date.now() / 140 + e.x * 0.03) * 2;
    // classic block-style spider shell
    var s = 2;
    function enemyBlock(x, y, w, h, color) {
      ctx.fillStyle = color;
      ctx.fillRect((px + x * s - 18), (py + bob + 6 + y * s) - 3, w * s, h * s);
    }

    enemyBlock(-6, 0, 12, 6, AM.C.ENEMY_TYPES.body);
    enemyBlock(-5, 6, 10, 2, AM.C.ENEMY_TYPES.web);
    enemyBlock(-2, -1, 4, 1, AM.C.COLOR_OUTLINE);
    // spider legs
    ctx.strokeStyle = AM.C.ENEMY_TYPES.web;
    ctx.lineWidth = 2;
    for (var leg = 0; leg < 6; leg++) {
      var ang = (Math.PI / 6) * leg - Math.PI / 2;
      var lx1 = Math.cos(ang) * 7;
      var ly1 = Math.sin(ang) * 4;
      var lx2 = Math.cos(ang) * 14;
      var ly2 = Math.sin(ang) * 10;
      ctx.beginPath();
      ctx.moveTo(px, py + bob + 6);
      ctx.quadraticCurveTo(px + lx1, py + bob + 6 + ly1, px + lx2, py + bob + ly2 + 4);
      ctx.stroke();
    }

    // Duck head motif.
    drawDuckHead(px, py + bob - 8);

    // eyes on body
    ctx.fillStyle = AM.C.ENEMY_TYPES.eyes;
    ctx.beginPath();
    ctx.arc(px - 2, py + bob + 4, 1.2, 0, Math.PI * 2);
    ctx.arc(px + 2, py + bob + 4, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPlayer(p) {
    if (!p.alive && p.deathTimer > 0) {
      var px = p.x - camera.x + p.w / 2;
      var py = p.y - camera.y + p.h / 2;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(p.deathTimer * 6);
      drawKidSprite(AM.C.CHARS[p.char] || AM.C.CHARS.aiden, 0, -6, p.facing || 1, p.vy || 0, true);
      ctx.restore();
      return;
    }
    if (!p.alive) return;

    var px2 = p.x - camera.x + p.w / 2;
    var py2 = p.y - camera.y + p.h / 2;
    if (p.invuln > 0 && Math.floor(p.invuln * 10) % 2 === 0) return;
    drawKidSprite(AM.C.CHARS[p.char] || AM.C.CHARS.aiden, px2, py2, p.facing || 1, p.invuln + 0.1, false);
  }

  function drawCheckpoints(level) {
    var T = level.tile;
    for (var i = 0; i < level.checkpoints.length; i++) {
      var cp = level.checkpoints[i];
      if (cp.who === "start") continue;
      var px = cp.x * T + T / 2 - camera.x;
      var py = cp.y * T + T / 2 - camera.y;

      var charData = AM.C.CHARS[cp.who] || {};
      var marker = charData.palette || {};
      ctx.fillStyle = marker.shirt || "#fff";
      ctx.beginPath();
      ctx.arc(px, py, 12, 0, Math.PI * 2);
      ctx.fill();
      drawKidSprite(charData, px, py + 4, 1, 0, false);

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
      drawMascot(px, py);
    }

      // Buck mascots from level-specific placements.
      if (!level.mascots) return;
      for (var j = 0; j < level.mascots.length; j++) {
        var m = level.mascots[j];
        var bx = m.x * T - camera.x;
        var by = m.y * T + T / 2 - camera.y;
        drawMascot(bx + T / 2, by);
        if (m.side < 0) {
          drawMascot(bx + T / 2 - 16, by - 3);
        } else {
          drawMascot(bx + T / 2 + 16, by - 3);
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
