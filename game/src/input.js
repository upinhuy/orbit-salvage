// Input for Orbit Salvage: keyboard state plus the one-shot keys the game
// reads each frame (pause, mute, restart, start).
export function makeInput() {
  const keys = new Set();
  const pressed = new Set();
  const map = {
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
  };
  window.addEventListener('keydown', (e) => {
    if (map[e.code]) { keys.add(map[e.code]); e.preventDefault(); }
    if (['KeyP', 'KeyM', 'KeyR', 'Enter', 'Space'].includes(e.code)) {
      if (!e.repeat) pressed.add(e.code);
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', (e) => {
    if (map[e.code]) keys.delete(map[e.code]);
  });
  return {
    held(dir) { return keys.has(dir); },
    wasPressed(code) {
      if (pressed.has(code)) { pressed.delete(code); return true; }
      return false;
    },
    clearPressed() { pressed.clear(); },
  };
}
