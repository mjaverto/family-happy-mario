// Tile / world constants for Aiden's side-scroll adventure.
window.AM = window.AM || {};

AM.C = {
  TILE: 32,
  GRAVITY: 1420,     // px/s^2
  JUMP_V: -700,      // px/s (negative = up)
  MAX_FALL: 930,     // terminal velocity
  RUN_ACCEL: 1250,   // px/s^2
  RUN_DECEL: 1500,   // px/s^2
  RUN_MAX: 250,      // px/s
  AIR_CONTROL: 0.82,  // accel multiplier in air
  STOMP_BOUNCE: -430,
  ENEMY_SPEED: 64,
  COIN_SCORE: 1,
  START_LIVES: 3,

  // Dunmore football-field palette
  COLOR_SKY_TOP: "#8dd8ff",
  COLOR_SKY_MID: "#c8edff",
  COLOR_CLOUD: "#ffffff",
  COLOR_FIELD_GRASS: "#6cbf5f",
  COLOR_FIELD_GRASS_DARK: "#56a64a",
  COLOR_FIELD_BROWNS: "#3f6f3b",
  COLOR_FIELD_SIDELINE: "#eef6ff",
  COLOR_FIELD_HASH: "rgba(255,255,255,0.72)",
  COLOR_HILL: "#6f8f6a",
  COLOR_HILL_DARK: "#4e6b4b",
  COLOR_GROUND: "#8b5a2b",
  COLOR_GROUND_TOP: "#2f8a2f",
  COLOR_GROUND_SHADOW: "#6d4a23",
  COLOR_BRICK: "#9f6a36",
  COLOR_BRICK_LINE: "#6b3e1f",
  COLOR_FLAG_POLE: "#e9f7ff",
  COLOR_FLAG: "#ffcc00",
  COLOR_OUTLINE: "#1f1f1f",

  ENEMY_TYPES: {
    body: "#4b4b4b",
    web: "#2b2b2b",
    eyes: "#191919",
    duck: "#e8c63c",
    duckBeak: "#d6861a",
    duckEyes: "#1f1f1f",
  },

  CHARS: {
    aiden: {
      name: "Aiden",
      age: 6,
      hair: "brown hair",
      palette: {
        skin: "#f2be84",
        shirt: "#2f6de0",
        shorts: "#112c5a",
        shoe: "#2c2417",
        cap: "#2f6de0",
        hair: "#553722",
        outline: "#19324e",
      },
    },
    dean: {
      name: "Dean",
      age: 3,
      hair: "blonde hair",
      palette: {
        skin: "#efc79c",
        shirt: "#ff9dd9",
        shorts: "#8a2a64",
        shoe: "#2c2417",
        cap: "#ff9dd9",
        hair: "#c98a37",
        outline: "#5a1f58",
      },
    },
    jake: {
      name: "Jake",
      age: 11,
      hair: "brown hair",
      palette: {
        skin: "#f2be84",
        shirt: "#26a67d",
        shorts: "#0f3f33",
        shoe: "#2c2417",
        cap: "#2f6de0",
        hair: "#553722",
        outline: "#1d4d45",
      },
    },
    kash: {
      name: "Kash",
      age: 7,
      hair: "brown hair",
      palette: {
        skin: "#f2be84",
        shirt: "#6d57c1",
        shorts: "#2f1f64",
        shoe: "#2c2417",
        cap: "#6d57c1",
        hair: "#4c3423",
        outline: "#2f2a55",
      },
    },
    riggs: {
      name: "Riggs",
      age: 0.5,
      hair: "brown hair",
      palette: {
        skin: "#efc79c",
        shirt: "#f3a63a",
        shorts: "#8b4f20",
        shoe: "#2c2417",
        cap: "#f3a63a",
        hair: "#5a3c26",
        outline: "#7a3f13",
      },
    },
  },

  BOSS: {
    name: "Uncle Brian",
    age: 38,
    description: "Tall and thin",
    skin: "#f4d7bc",
    jacket: "#2b2d34",
    shirt: "#7a7a84",
    truckColor: "#4a4a4a",
    truckLabel: "Nissan Frontier",
    windowColor: "#9ec5ff",
  },
};
