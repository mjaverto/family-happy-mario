// Level data. Expressed as arrays of rectangles and entity positions in TILE coordinates.
// Physics/render convert tile coords -> pixel coords using AM.C.TILE.
window.AM = window.AM || {};

(function () {
  var T = 32;

  function levelGround(rows) {
    return rows.map(function (g) {
      return { x: g.x, y: 15, w: g.w, h: 3 };
    });
  }

  function coinCluster(values) {
    var out = [];
    for (var i = 0; i < values.length; i++) {
      out.push({ x: values[i][0], y: values[i][1] });
    }
    return out;
  }

  function levelSolids(ground, platforms) {
    return { ground: ground, platforms: platforms, clouds: [], hills: [] };
  }

  // ------- Level 1: opening football field run -------------------------------
  // The flag pole is the stage exit for level one.
  var levelOneGround = levelGround([
    { x: 0,   w: 14 },
    { x: 17,  w: 10 },
    { x: 30,  w: 12 },
    { x: 46,  w: 14 },
    { x: 62,  w: 10 },
    { x: 74,  w: 10 },
    { x: 86,  w: 34 },
  ]);

  var levelOnePlatforms = [
    { x: 5,  y: 11, w: 3, h: 1 },
    { x: 10, y: 9,  w: 3, h: 1 },
    { x: 18, y: 11, w: 2, h: 1 },
    { x: 22, y: 9,  w: 3, h: 1 },
    { x: 32, y: 12, w: 2, h: 1 },
    { x: 36, y: 10, w: 2, h: 1 },
    { x: 40, y: 8,  w: 3, h: 1 },
    { x: 48, y: 11, w: 3, h: 1 },
    { x: 53, y: 9,  w: 3, h: 1 },
    { x: 58, y: 11, w: 1, h: 1 },
    { x: 63, y: 10, w: 2, h: 1 },
    { x: 68, y: 8,  w: 3, h: 1 },
    { x: 75, y: 11, w: 2, h: 1 },
    { x: 80, y: 9,  w: 2, h: 1 },
    { x: 88, y: 11, w: 3, h: 1 },
    { x: 94, y: 9,  w: 3, h: 1 },
    { x: 100,y: 8,  w: 2, h: 1 },
    { x: 105,y: 11, w: 3, h: 1 },
  ];

  var levelOneCoins = coinCluster([
    // easy coins above ground
    [6, 13], [7, 13], [8, 13],
    // on first platform
    [5, 10], [6, 10], [7, 10],
    // arc across pit 1
    [15, 12], [16, 11], [17, 12],
    // second platform cluster
    [22, 8], [23, 8], [24, 8],
    // above mid-level
    [36, 9], [37, 9],
    [40, 7], [41, 7], [42, 7],
    // across the big pit
    [43, 10], [44, 11], [45, 12],
    // along the way
    [53, 8], [54, 8], [55, 8],
    [63, 9], [64, 9],
    [68, 7], [69, 7], [70, 7],
    [78, 10], [80, 8], [81, 8],
    // finish stretch
    [88, 10], [89, 10], [90, 10],
    [94, 8], [95, 8], [96, 8],
    [100, 7], [101, 7],
    [105, 10], [106, 10], [107, 10],
    [112, 13], [113, 13], [114, 13],
  ]);

  var levelOneEnemies = [
    { type: "spider", x: 10, y: 14, patrolMin: 8,  patrolMax: 13 },
    { type: "spider", x: 24, y: 8,  patrolMin: 22, patrolMax: 24 },
    { type: "spider", x: 34, y: 14, patrolMin: 30, patrolMax: 41 },
    { type: "spider", x: 50, y: 14, patrolMin: 46, patrolMax: 59 },
    { type: "spider", x: 55, y: 14, patrolMin: 46, patrolMax: 59 },
    { type: "spider", x: 65, y: 14, patrolMin: 62, patrolMax: 71 },
    { type: "spider", x: 78, y: 14, patrolMin: 74, patrolMax: 83 },
    { type: "spider", x: 95, y: 14, patrolMin: 86, patrolMax: 104 },
    { type: "spider", x: 100,y: 14, patrolMin: 86, patrolMax: 104 },
    { type: "spider", x: 110,y: 14, patrolMin: 86, patrolMax: 118 },
  ];

  var levelOneCheckpoints = [
    { x: 1,  y: 14, who: "start", emoji: null },
    { x: 34, y: 14, who: "jake",  emoji: "👦", label: "Jake" },
    { x: 68, y: 14, who: "kash",  emoji: "👦", label: "Kash" },
    { x: 86, y: 14, who: "dean",  emoji: "👦", label: "Dean" },
  ];

  var levelOneCameos = [
    { x: 20, y: 14, emoji: "🦬", label: "Dunmore Buck" },
    { x: 72, y: 14, emoji: "🦬", label: "Buck Mascot" },
    { x: 115,y: 14, emoji: "🦬", label: "Buck Mascot" },
  ];

  var levelOneEnd = { type: "pole", x: 117, topY: 5, bottomY: 15 };

  // Background clouds (parallax): {x, y, scale}
  var levelOneClouds = [
    { x: 4,  y: 2, s: 1.0 },
    { x: 14, y: 3, s: 1.2 },
    { x: 26, y: 2, s: 0.9 },
    { x: 38, y: 1, s: 1.1 },
    { x: 52, y: 3, s: 1.3 },
    { x: 66, y: 2, s: 0.9 },
    { x: 80, y: 3, s: 1.1 },
    { x: 96, y: 2, s: 1.0 },
    { x: 110,y: 3, s: 1.2 },
  ];

  var levelOneHills = [
    { x: 0,   y: 13, w: 10, h: 2 },
    { x: 14,  y: 12, w: 10, h: 3 },
    { x: 26,  y: 13, w: 10, h: 2 },
    { x: 38,  y: 12, w: 9, h: 3 },
    { x: 56,  y: 13, w: 10, h: 2 },
    { x: 70,  y: 12, w: 10, h: 3 },
    { x: 84,  y: 13, w: 10, h: 2 },
    { x: 100, y: 12, w: 10, h: 3 },
  ];

  var levelOneMascots = [
    { x: 18, y: 14, side: -1 },
    { x: 42, y: 14, side: 1 },
    { x: 82, y: 14, side: -1 },
  ];

  var levelOne = {
    name: "Dunmore Yard One",
    tile: T,
    cols: 120,
    rows: 18,
    ground: levelOneGround,
    platforms: levelOnePlatforms,
    coins: levelOneCoins,
    enemies: levelOneEnemies,
    checkpoints: levelOneCheckpoints,
    cameos: levelOneCameos,
    end: levelOneEnd,
    clouds: levelOneClouds,
    hills: levelOneHills,
    mascots: levelOneMascots,
    header: "DUNMORE, PENNSYLVANIA",
    spawn: { x: 1.5 * T, y: 13 * T },
    theme: "stadium",
  };

  // ------- Level 2: stadium run to Uncle Brian -----------------------------
  var levelTwoGround = levelGround([
    { x: 0,   w: 20 },
    { x: 30,  w: 8 },
    { x: 42,  w: 8 },
    { x: 52,  w: 9 },
    { x: 63,  w: 11 },
    { x: 76,  w: 11 },
    { x: 90,  w: 36 },
  ]);

  var levelTwoPlatforms = [
    { x: 4,  y: 11, w: 2, h: 1 },
    { x: 12, y: 10, w: 3, h: 1 },
    { x: 20, y: 8,  w: 4, h: 1 },
    { x: 26, y: 12, w: 2, h: 1 },
    { x: 32, y: 9,  w: 3, h: 1 },
    { x: 44, y: 10, w: 2, h: 1 },
    { x: 56, y: 8,  w: 3, h: 1 },
    { x: 62, y: 11, w: 2, h: 1 },
    { x: 70, y: 7,  w: 4, h: 1 },
    { x: 79, y: 9,  w: 3, h: 1 },
    { x: 86, y: 8,  w: 4, h: 1 },
    { x: 94, y: 10, w: 2, h: 1 },
    { x: 100,y: 11, w: 3, h: 1 },
    { x: 110,y: 9,  w: 3, h: 1 },
    { x: 116,y: 8,  w: 2, h: 1 },
  ];

  var levelTwoCoins = coinCluster([
    [5,12], [6,12], [7,12],
    [12,9], [13,9], [14,9],
    [21,6], [22,6], [23,6], [24,6],
    [34,8], [35,8], [36,8],
    [43,9], [44,9],
    [49,10], [50,10], [52,10],
    [57,7], [58,7],
    [64,10], [65,10], [66,10],
    [71,6], [72,6], [73,6], [74,6],
    [80,8], [81,8],
    [88,11], [89,11],
    [96,9], [97,9], [98,9],
    [103,10], [104,10], [105,10],
    [112,11], [113,11], [114,11], [115,11],
  ]);

  var levelTwoEnemies = [
    { type: "spider", x: 11,  y: 14, patrolMin: 9,  patrolMax: 18 },
    { type: "spider", x: 21,  y: 10, patrolMin: 20, patrolMax: 24 },
    { type: "spider", x: 31,  y: 14, patrolMin: 29, patrolMax: 37 },
    { type: "spider", x: 48,  y: 14, patrolMin: 45, patrolMax: 59 },
    { type: "spider", x: 63,  y: 14, patrolMin: 60, patrolMax: 72 },
    { type: "spider", x: 76,  y: 14, patrolMin: 74, patrolMax: 87 },
    { type: "spider", x: 95,  y: 14, patrolMin: 91, patrolMax: 108 },
    { type: "spider", x: 109, y: 14, patrolMin: 102, patrolMax: 116 },
  ];

  var levelTwoCheckpoints = [
    { x: 1,  y: 14, who: "start", emoji: null },
    { x: 38, y: 14, who: "aiden", emoji: "👦", label: "Aiden" },
    { x: 56, y: 14, who: "kash",  emoji: "👦", label: "Kash" },
    { x: 82, y: 14, who: "jake",  emoji: "👦", label: "Jake" },
  ];

  var levelTwoCameos = [
    { x: 24, y: 13, emoji: "🦬", label: "Buck Mascot" },
    { x: 47, y: 14, emoji: "🦬", label: "Buck Mascot" },
    { x: 73, y: 14, emoji: "🦬", label: "Buck Mascot" },
    { x: 101,y: 14, emoji: "🦬", label: "Buck Mascot" },
  ];

  var levelTwoEnd = {
    type: "boss",
    x: 126,
    y: 14,
    w: 2,
    h: 2,
    title: "Uncle Brian",
    truck: { x: 130, y: 15 },
    bottomPad: 17,
  };

  var levelTwoClouds = [
    { x: 6,  y: 1.7, s: 1.1 },
    { x: 14, y: 2.8, s: 0.9 },
    { x: 24, y: 1.4, s: 1.0 },
    { x: 39, y: 2.1, s: 1.2 },
    { x: 54, y: 1.8, s: 0.8 },
    { x: 69, y: 2.3, s: 1.1 },
    { x: 82, y: 1.7, s: 1.0 },
    { x: 99, y: 2.5, s: 1.2 },
    { x: 116,y: 1.3, s: 1.0 },
  ];

  var levelTwoHills = [
    { x: 0,  y: 13, w: 12, h: 2 },
    { x: 16, y: 12, w: 11, h: 2 },
    { x: 32, y: 13, w: 10, h: 2 },
    { x: 46, y: 12, w: 12, h: 2 },
    { x: 64, y: 13, w: 11, h: 2 },
    { x: 78, y: 12, w: 11, h: 2 },
    { x: 94, y: 13, w: 10, h: 2 },
    { x: 108,y: 12, w: 12, h: 2 },
  ];

  var levelTwoMascots = [
    { x: 10, y: 14, side: 1 },
    { x: 33, y: 14, side: -1 },
    { x: 52, y: 14, side: 1 },
    { x: 87, y: 14, side: -1 },
    { x: 116,y: 14, side: 1 },
  ];

  var levelTwo = {
    name: "Dunmore Field Finish",
    tile: T,
    cols: 140,
    rows: 18,
    ground: levelTwoGround,
    platforms: levelTwoPlatforms,
    coins: levelTwoCoins,
    enemies: levelTwoEnemies,
    checkpoints: levelTwoCheckpoints,
    cameos: levelTwoCameos,
    end: levelTwoEnd,
    clouds: levelTwoClouds,
    hills: levelTwoHills,
    mascots: levelTwoMascots,
    header: "UNIVERSITY PARK FIELD, DUNMORE, PA",
    spawn: { x: 1.5 * T, y: 13 * T },
    theme: "stadium",
  };

  function setupLevel(level) {
    var ground = level.ground;
    var platforms = level.platforms;

    level.widthPx = level.cols * T;
    level.heightPx = level.rows * T;

    // Ensure all ground/platform arrays are in tile coords.
    level.solidsPx = function () {
      var rects = [];
      var i;
      for (i = 0; i < ground.length; i++) {
        var g = ground[i];
        rects.push({ x: g.x * T, y: g.y * T, w: g.w * T, h: g.h * T });
      }
      for (i = 0; i < platforms.length; i++) {
        var p = platforms[i];
        rects.push({ x: p.x * T, y: p.y * T, w: p.w * T, h: p.h * T });
      }
      return rects;
    };

    if (!level.clouds) level.clouds = [];
    if (!level.hills)  level.hills = [];
    if (!level.mascots) level.mascots = [];
    if (!level.checkpoints) level.checkpoints = [];
    return level;
  }

  AM.LEVELS = [setupLevel(levelOne), setupLevel(levelTwo)];
  AM.LEVEL = AM.LEVELS[0];
})();
