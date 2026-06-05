// Keyboard + touch input. Exposes AM.input.state and AM.input.poll (consumes one-frame flags).
window.AM = window.AM || {};

(function () {
  var held = {
    left: false,
    right: false,
    up: false,
    jump: false,
  };
  // Edge-triggered jump press that must be consumed each frame.
  var jumpPressedEdge = false;
  var wasJumpDown = false;

  function setLeft(v)  { held.left = !!v; }
  function setRight(v) { held.right = !!v; }
  function setUp(v)    { held.up = !!v; held.jump = !!v; }
  function setJump(v)  { held.jump = !!v; held.up = !!v; }

  function onKey(e, down) {
    var k = e.key;
    if (k === "ArrowLeft"  || k === "a" || k === "A") { setLeft(down); e.preventDefault(); return; }
    if (k === "ArrowRight" || k === "d" || k === "D") { setRight(down); e.preventDefault(); return; }
    if (k === "ArrowUp"    || k === "w" || k === "W") { setUp(down); e.preventDefault(); return; }
    if (k === " "          || k === "Spacebar")       { setJump(down); e.preventDefault(); return; }
  }

  window.addEventListener("keydown", function (e) {
    if (e.repeat) return;
    onKey(e, true);
  }, { passive: false });
  window.addEventListener("keyup", function (e) {
    onKey(e, false);
  }, { passive: false });

  // Touch controls: any button with data-dir; we listen for pointer events.
  function wireTouchButton(el) {
    if (!el) return;
    var dir = el.getAttribute("data-dir");
    var setter = null;
    if (dir === "left") setter = setLeft;
    else if (dir === "right") setter = setRight;
    else if (dir === "up") setter = setUp;
    if (!setter) return;
    var press = function (e) {
      e.preventDefault();
      setter(true);
      document.body.classList.add("touch");
    };
    var release = function (e) {
      e.preventDefault();
      setter(false);
    };
    el.addEventListener("pointerdown",   press);
    el.addEventListener("pointerup",     release);
    el.addEventListener("pointercancel", release);
    el.addEventListener("pointerleave",  release);
    el.addEventListener("touchstart",    press, { passive: false });
    el.addEventListener("touchend",      release, { passive: false });
  }

  function attach() {
    var btns = document.querySelectorAll("#touch [data-dir]");
    for (var i = 0; i < btns.length; i++) wireTouchButton(btns[i]);
  }

  // Detect touch device to show controls
  function maybeMarkTouch() {
    var isTouch = ("ontouchstart" in window) || (navigator.maxTouchPoints > 0);
    if (isTouch) document.body.classList.add("touch");
  }

  // Call each physics frame. Returns a snapshot of the input, and clears one-shot flags.
  function poll() {
    // Compute jump "just pressed" edge: jump went from up -> down since last poll.
    if (held.jump && !wasJumpDown) jumpPressedEdge = true;
    wasJumpDown = held.jump;
    var snap = {
      left:  held.left,
      right: held.right,
      up:    held.up,
      jump:  held.jump,
      jumpPressed: jumpPressedEdge,
    };
    jumpPressedEdge = false;
    return snap;
  }

  // Reset everything (e.g. on respawn or game reset)
  function reset() {
    held.left = held.right = held.up = held.jump = false;
    jumpPressedEdge = false;
    wasJumpDown = false;
  }

  AM.input = {
    attach: attach,
    markTouch: maybeMarkTouch,
    poll: poll,
    reset: reset,
  };
})();
