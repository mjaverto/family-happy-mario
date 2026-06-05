// UI glue: character select, HUD updates, win/advance modals.
window.AM = window.AM || {};

(function () {
  var selectEl, coinEl, lifeEl, whoEl, levelEl, winEl, loseEl, advanceEl, winStatsEl, winTitleEl, winCloseEl;
  var advanceTitleEl, advanceBodyEl, advanceCloseEl;

  function init() {
    selectEl   = document.getElementById("select");
    coinEl     = document.getElementById("coinCount");
    lifeEl     = document.getElementById("lifeCount");
    whoEl      = document.getElementById("who");
    levelEl    = document.getElementById("level");

    winEl      = document.getElementById("win");
    loseEl     = document.getElementById("lose");
    advanceEl  = document.getElementById("advance");

    winStatsEl = document.getElementById("winStats");
    winTitleEl = document.getElementById("winTitle");
    winCloseEl = document.getElementById("winClose");

    advanceTitleEl = document.getElementById("advanceTitle");
    advanceBodyEl  = document.getElementById("advanceBody");
    advanceCloseEl = document.getElementById("advanceClose");
  }

  function showSelect() {
    if (!selectEl) return;
    selectEl.style.display = "flex";
    document.body.classList.remove("playing");
    if (winEl) winEl.classList.remove("on");
    if (loseEl) loseEl.classList.remove("on");
    if (advanceEl) advanceEl.classList.remove("on");
  }

  function hideSelect() {
    if (!selectEl) return;
    selectEl.style.display = "none";
    document.body.classList.add("playing");
  }

  function setWho(character) {
    if (!whoEl) return;
    var data = AM.C.CHARS[character] || {};
    var em = data.emoji || "👦";

    var age = typeof data.age === "number" ? data.age : null;
    var ageLabel = "";
    if (age !== null) {
      if (age < 1) {
        ageLabel = Math.round(age * 12) + "m";
      } else {
        ageLabel = age + "y";
      }
    }
    var suffix = "";
    if (ageLabel) {
      suffix = ageLabel + " · " + (data.hair || "");
    }
    whoEl.textContent = em + " " + (data.name || character) + (suffix ? " (" + suffix + ")" : "");
  }

  function setLevel(n) {
    if (!levelEl) return;
    levelEl.textContent = "Level " + n + " / 2";
  }

  function setCoins(n) {
    if (!coinEl) return;
    coinEl.textContent = String(n);
  }

  function setLives(n) {
    if (!lifeEl) return;
    lifeEl.textContent = String(n);
  }

  function showWin(title, cta, closeHandler) {
    if (!winEl) return;
    winTitleEl.textContent = title || "You Win";
    if (winStatsEl) winStatsEl.textContent = "Coins: " + stateCoinsString();
    if (winCloseEl) winCloseEl.textContent = cta || "Play Again";
    winEl.classList.add("on");
    if (typeof closeHandler === "function" && winCloseEl) {
      wireOnce(winCloseEl, closeHandler);
    }
  }

  function stateCoinsString() {
    return String((coinEl && coinEl.textContent) || "0");
  }

  function showAdvance(level, onContinue, cta) {
    if (!advanceEl) return;
    advanceTitleEl.textContent = "Level " + (level - 1) + " Complete";
    if (advanceBodyEl) {
      advanceBodyEl.textContent = "Advance to Level " + level + " and keep your coins and lives.";
    }
    if (advanceCloseEl) {
      advanceCloseEl.textContent = cta || "Continue";
    }
    advanceEl.classList.add("on");
    if (typeof onContinue === "function" && advanceCloseEl) {
      wireOnce(advanceCloseEl, onContinue);
    }
  }

  function hideAdvance() {
    if (!advanceEl) return;
    advanceEl.classList.remove("on");
  }

  function wireOnce(btn, handler) {
    if (!btn) return;
    var fresh = function () {
      btn.removeEventListener("click", fresh);
      handler();
    };
    btn.addEventListener("click", fresh);
  }

  function hideWin() {
    if (!winEl) return;
    winEl.classList.remove("on");
  }

  function showLose() {
    if (!loseEl) return;
    loseEl.classList.add("on");
  }

  function hideLose() {
    if (!loseEl) return;
    loseEl.classList.remove("on");
  }

  function wireCharacterSelect(onPick) {
    var btns = selectEl.querySelectorAll(".chars button");
    var handler = function (e) {
      var b = e.currentTarget;
      var c = b.getAttribute("data-char");
      onPick(c);
    };
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener("click", handler);
    }
  }

  function wireCloseButtons(onWinClose, onLoseClose) {
    if (winCloseEl && onWinClose) {
      wireOnce(winCloseEl, onWinClose);
    }
    var loseBtn = document.getElementById("loseClose");
    if (loseBtn && onLoseClose) {
      loseBtn.addEventListener("click", onLoseClose);
    }
  }

  function wireAdvanceButton(onContinue) {
    wireOnce(advanceCloseEl, onContinue);
  }

  AM.ui = {
    init: init,
    showSelect: showSelect,
    hideSelect: hideSelect,
    setLevel: setLevel,
    setWho: setWho,
    setCoins: setCoins,
    setLives: setLives,
    showWin: showWin,
    hideWin: hideWin,
    showAdvance: showAdvance,
    hideAdvance: hideAdvance,
    showLose: showLose,
    hideLose: hideLose,
    wireCharacterSelect: wireCharacterSelect,
    wireCloseButtons: wireCloseButtons,
    wireAdvanceButton: wireAdvanceButton,
  };
})();
