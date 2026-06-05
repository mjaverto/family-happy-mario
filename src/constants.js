// Tile / world constants for Aiden's side-scroll adventure.
window.AM = window.AM || {};

AM.C = {
  TILE: 32,
  GRAVITY: 1650,     // px/s^2
  JUMP_V: -610,      // px/s (negative = up)
  MAX_FALL: 980,     // terminal velocity
  RUN_ACCEL: 1500,   // px/s^2
  RUN_DECEL: 1800,   // px/s^2
  RUN_MAX: 240,      // px/s
  AIR_CONTROL: 0.7,  // accel multiplier in air
  STOMP_BOUNCE: -390,
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
  COLOR_OUTLINE: "#18372b",

  ENEMY_TYPES: {
    spider: "🕷️",
    duck: "🦆",
  },

  CHARS: {
    aiden: { emoji: "👦", name: "Aiden", age: 6, hair: "brown hair" },
    dean:  { emoji: "👦", name: "Dean", age: 3, hair: "blonde hair" },
    jake:  { emoji: "👦", name: "Jake", age: 11, hair: "brown hair" },
    kash:  { emoji: "👦", name: "Kash", age: 7, hair: "brown hair" },
    riggs: { emoji: "👦", name: "Riggs", age: 0.5, hair: "brown hair" },
  },

  BOSS: {
    name: "Uncle Brian",
    age: 38,
    description: "Tall and thin",
    emoji: "👨",
    vehicle: "🚚",
    vehicleColor: "#4b4b4b", // dark grey Nissan Frontier
    truckLabel: "Nissan Frontier",
    truckColor: "#4a4a4a",
  },
};
