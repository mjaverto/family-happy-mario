// Chiptune music loop + simple SFX using Web Audio oscillators.
// Adapted from the sibling family-game audio engine.
window.AM = window.AM || {};

(function () {
  var ctx = null;
  var masterGain = null;
  var musicGain = null;
  var sfxGain = null;
  var started = false;
  var muted = false;
  var playing = false;
  var nextTime = 0;
  var noteIndex = 0;
  var schedTimer = null;
  var activeTune = null;

  var BPM = 138;
  var EIGHTH = 60 / BPM / 2;

  var N = {
    REST: 0,
    C2: 65.41,  D2: 73.42,  E2: 82.41,  F2: 87.31,  G2: 98.00,  A2: 110.00, B2: 123.47,
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
    C6: 1046.50, D6: 1174.66, E6: 1318.51,
  };

  var TUNES = [
    {
      name: "Overworld Run",
      melody: [
        [N.E5, 1], [N.E5, 1], [N.REST, 1], [N.E5, 1],
        [N.REST, 1], [N.C5, 1], [N.E5, 1], [N.REST, 1],
        [N.G5, 2], [N.REST, 2],
        [N.G4, 2], [N.REST, 2],
        [N.C5, 1], [N.REST, 2], [N.G4, 1],
        [N.REST, 2], [N.E4, 2],
        [N.A4, 1], [N.REST, 1], [N.B4, 1], [N.REST, 1],
        [N.A4, 1], [N.G4, 1], [N.E5, 1], [N.C5, 1],
      ],
      bass: [
        [N.C3, 2], [N.G2, 2], [N.C3, 2], [N.G2, 2],
        [N.F3, 2], [N.C3, 2], [N.G3, 2], [N.G2, 2],
        [N.C3, 2], [N.G2, 2], [N.C3, 2], [N.E3, 2],
        [N.F3, 2], [N.G3, 2], [N.C3, 2], [N.G2, 2],
      ],
    },
    {
      name: "Sky Hop",
      melody: [
        [N.G4, 1], [N.A4, 1], [N.B4, 1], [N.D5, 1],
        [N.G5, 2], [N.D5, 1], [N.B4, 1],
        [N.A4, 1], [N.B4, 1], [N.D5, 1], [N.A4, 1],
        [N.G4, 4],
        [N.B4, 1], [N.D5, 1], [N.G5, 1], [N.B5, 1],
        [N.A5, 2], [N.G5, 1], [N.D5, 1],
        [N.E5, 1], [N.D5, 1], [N.B4, 1], [N.A4, 1],
        [N.G4, 2], [N.REST, 2],
      ],
      bass: [
        [N.G2, 2], [N.G2, 2], [N.D3, 2], [N.D3, 2],
        [N.C3, 2], [N.C3, 2], [N.G2, 2], [N.G2, 2],
        [N.E3, 2], [N.E3, 2], [N.D3, 2], [N.D3, 2],
        [N.G2, 2], [N.B2, 2], [N.D3, 2], [N.G2, 2],
      ],
    },
    {
      name: "Coin Trail",
      melody: [
        [N.C5, 1], [N.E5, 1], [N.G5, 1], [N.E5, 1],
        [N.A5, 2], [N.G5, 1], [N.E5, 1],
        [N.D5, 1], [N.F5, 1], [N.A5, 1], [N.F5, 1],
        [N.G5, 2], [N.E5, 2],
        [N.C5, 1], [N.E5, 1], [N.G5, 1], [N.C6, 1],
        [N.B5, 2], [N.G5, 1], [N.E5, 1],
        [N.D5, 1], [N.F5, 1], [N.A5, 1], [N.D5, 1],
        [N.C5, 2], [N.REST, 2],
      ],
      bass: [
        [N.C3, 2], [N.C3, 2], [N.F3, 2], [N.F3, 2],
        [N.D3, 2], [N.D3, 2], [N.G3, 2], [N.E3, 2],
        [N.C3, 2], [N.C3, 2], [N.G2, 2], [N.G2, 2],
        [N.F3, 2], [N.F3, 2], [N.G3, 2], [N.C3, 2],
      ],
    },
  ];

  function totalEighths(track) {
    var s = 0;
    for (var i = 0; i < track.length; i++) s += track[i][1];
    return s;
  }

  function noteAt(track, loopLen, idx) {
    var t = ((idx % loopLen) + loopLen) % loopLen;
    var acc = 0;
    for (var i = 0; i < track.length; i++) {
      var d = track[i][1];
      if (t < acc + d) {
        return { freq: track[i][0], startIdx: acc, dur: d };
      }
      acc += d;
    }
    return null;
  }

  function playNoteOn(destGain, time, freq, duration, type, gain) {
    if (!freq || freq <= 0 || !ctx || !destGain) return;
    var osc = ctx.createOscillator();
    var env = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(gain, time + 0.006);
    env.gain.exponentialRampToValueAtTime(0.0001, time + Math.max(0.02, duration * 0.95));
    osc.connect(env);
    env.connect(destGain);
    osc.start(time);
    osc.stop(time + duration + 0.02);
  }

  function scheduler() {
    if (!ctx || !activeTune || !playing) return;
    var aheadWindow = 0.25;
    var mLen = activeTune.melodyLen;
    var bLen = activeTune.bassLen;

    while (nextTime < ctx.currentTime + aheadWindow) {
      var mTick = ((noteIndex % mLen) + mLen) % mLen;
      var m = noteAt(activeTune.melody, mLen, noteIndex);
      if (m && m.startIdx === mTick) {
        playNoteOn(musicGain, nextTime, m.freq, m.dur * EIGHTH, "square", 0.09);
      }
      var bTick = ((noteIndex % bLen) + bLen) % bLen;
      var b = noteAt(activeTune.bass, bLen, noteIndex);
      if (b && b.startIdx === bTick) {
        playNoteOn(musicGain, nextTime, b.freq, b.dur * EIGHTH, "triangle", 0.16);
      }
      nextTime += EIGHTH;
      noteIndex++;
    }
    schedTimer = setTimeout(scheduler, 45);
  }

  function pickTune() {
    var t = TUNES[Math.floor(Math.random() * TUNES.length)];
    return {
      name:      t.name,
      melody:    t.melody,
      bass:      t.bass,
      melodyLen: totalEighths(t.melody),
      bassLen:   totalEighths(t.bass),
    };
  }

  function ensureCtx() {
    if (ctx) return true;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
    } catch (e) { return false; }
    if (ctx.state === "suspended" && ctx.resume) ctx.resume();
    masterGain = ctx.createGain();
    masterGain.gain.value = muted ? 0 : 1;
    masterGain.connect(ctx.destination);
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.22;
    musicGain.connect(masterGain);
    sfxGain = ctx.createGain();
    sfxGain.gain.value = 0.45;
    sfxGain.connect(masterGain);
    return true;
  }

  function startMusic() {
    if (!ensureCtx()) return;
    started = true;
    if (playing) return;
    playing = true;
    activeTune = pickTune();
    nextTime = ctx.currentTime + 0.08;
    noteIndex = 0;
    scheduler();
  }

  function stopMusic() {
    playing = false;
    if (schedTimer) {
      clearTimeout(schedTimer);
      schedTimer = null;
    }
  }

  // Short sound effects
  function sfx(kind) {
    if (!ensureCtx()) return;
    var t = ctx.currentTime;
    if (kind === "jump") {
      playNoteOn(sfxGain, t, 660, 0.08, "square", 0.22);
      playNoteOn(sfxGain, t + 0.06, 990, 0.09, "square", 0.18);
    } else if (kind === "coin") {
      playNoteOn(sfxGain, t, 988, 0.06, "square", 0.20);
      playNoteOn(sfxGain, t + 0.07, 1319, 0.12, "square", 0.22);
    } else if (kind === "stomp") {
      playNoteOn(sfxGain, t, 180, 0.12, "square", 0.30);
      playNoteOn(sfxGain, t + 0.05, 120, 0.16, "triangle", 0.28);
    } else if (kind === "hurt") {
      playNoteOn(sfxGain, t, 300, 0.10, "square", 0.28);
      playNoteOn(sfxGain, t + 0.10, 220, 0.18, "square", 0.26);
      playNoteOn(sfxGain, t + 0.22, 140, 0.22, "triangle", 0.26);
    } else if (kind === "death") {
      playNoteOn(sfxGain, t, 440, 0.14, "square", 0.30);
      playNoteOn(sfxGain, t + 0.14, 330, 0.14, "square", 0.26);
      playNoteOn(sfxGain, t + 0.28, 220, 0.16, "square", 0.24);
      playNoteOn(sfxGain, t + 0.44, 110, 0.30, "triangle", 0.26);
    } else if (kind === "win") {
      var seq = [523, 659, 784, 1047, 784, 1047, 1319];
      for (var i = 0; i < seq.length; i++) {
        playNoteOn(sfxGain, t + i * 0.09, seq[i], 0.13, "square", 0.22);
      }
    }
  }

  function toggleMute() {
    muted = !muted;
    if (masterGain) masterGain.gain.value = muted ? 0 : 1;
    return muted;
  }

  AM.audio = {
    startMusic: startMusic,
    stopMusic:  stopMusic,
    sfx:        sfx,
    toggleMute: toggleMute,
    isMuted:    function () { return muted; },
  };
})();
