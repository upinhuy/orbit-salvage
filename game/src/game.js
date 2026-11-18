// Game logic for Orbit Salvage: the state machine (title, playing, paused,
// won, over), the physics step, collisions, levels and the HUD. The ?shot=
// query used for screenshots picks a fixed scene: start, play, win or over.
import { makeWorld, makeRng, dist, wrap, WORLD_W, WORLD_H, TARGET_SCORE } from './world.js';
import { render } from './render.js';
import { makeAudio } from './audio.js';
import { makeInput } from './input.js';

function fmtTime(sec) {
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function startGame(canvas) {
  const ctx = canvas.getContext('2d');
  const params = new URLSearchParams(window.location.search);
  const seed = Number(params.get('seed') || 1);
  const shot = params.get('shot');
  const audio = makeAudio();
  const input = makeInput();
  const world = makeWorld(seed);
  const state = {
    phase: 'title', score: 0, fuel: 100, level: 1,
    elapsed: 0, timeText: '0:00', overReason: '', muted: false,
  };
  let last = performance.now();

  function setHud() {
    const el = (id) => document.getElementById(id);
    el('hud-score').textContent = `SCORE ${state.score} / ${TARGET_SCORE}`;
    el('hud-hull').textContent = `HULL ${'♥'.repeat(Math.max(0, world.ship.hull))}${'♡'.repeat(Math.max(0, 3 - world.ship.hull))}`;
    const bars = Math.round(state.fuel / 10);
    el('hud-fuel').textContent = `FUEL ${'▮'.repeat(bars)}${'▯'.repeat(10 - bars)}`;
    el('hud-level').textContent = `LEVEL ${state.level}`;
    el('hud-time').textContent = `TIME ${fmtTime(state.elapsed)}`;
  }

  function reset() {
    const fresh = makeWorld(seed + Math.floor(Math.random() * 1000));
    Object.assign(world, fresh);
    state.phase = 'playing';
    state.score = 0; state.fuel = 100; state.level = 1; state.elapsed = 0;
    state.overReason = '';
  }

  function step(dt) {
    const ship = world.ship;
    if (input.wasPressed('KeyP')) { state.phase = state.phase === 'playing' ? 'paused' : state.phase === 'paused' ? 'playing' : state.phase; return; }
    if (input.wasPressed('KeyM')) state.muted = audio.toggleMute();
    if (input.wasPressed('KeyR')) { reset(); return; }
    if (state.phase !== 'playing') return;

    // Thrust: WASD / arrows, with drag so the ship drifts like in space.
    const thrust = 420;
    if (input.held('up')) ship.vy -= thrust * dt;
    if (input.held('down')) ship.vy += thrust * dt;
    if (input.held('left')) ship.vx -= thrust * dt;
    if (input.held('right')) ship.vx += thrust * dt;
    ship.vx *= (1 - 0.6 * dt);
    ship.vy *= (1 - 0.6 * dt);
    const sp = Math.hypot(ship.vx, ship.vy);
    if (sp > 320) { ship.vx *= 320 / sp; ship.vy *= 320 / sp; }
    if (sp > 20) ship.angle = Math.atan2(ship.vy, ship.vx);
    ship.x += ship.vx * dt;
    ship.y += ship.vy * dt;
    wrap(ship);
    if (ship.invuln > 0) ship.invuln -= dt;

    state.elapsed += dt;
    state.timeText = fmtTime(state.elapsed);
    state.fuel -= dt * 1.1;
    if (state.fuel <= 0) { state.fuel = 0; state.overReason = 'fuel'; state.phase = 'over'; audio.lose(); return; }

    for (const o of [...world.pods, ...world.fuels, ...world.rocks]) {
      o.x += o.vx * dt; o.y += o.vy * dt;
      if (o.rot !== undefined) o.rot += o.spin * dt;
      wrap(o);
    }
    // Cargo: +10 points, and a new pod drifts in.
    for (let i = world.pods.length - 1; i >= 0; i--) {
      if (dist(ship, world.pods[i]) < 26) {
        world.pods.splice(i, 1);
        state.score += 10;
        audio.collect();
        world.spawnPod();
        const next = Math.floor(state.score / 100) + 1;
        if (next > state.level) {
          state.level = next;
          audio.level();
          world.spawnRock(state.level);
          world.spawnRock(state.level);
        }
        if (state.score >= TARGET_SCORE) { state.phase = 'won'; audio.win(); return; }
      }
    }
    // Fuel cells: +25 fuel.
    for (let i = world.fuels.length - 1; i >= 0; i--) {
      if (dist(ship, world.fuels[i]) < 26) {
        world.fuels.splice(i, 1);
        state.fuel = Math.min(100, state.fuel + 25);
        audio.fuel();
        world.spawnFuel();
      }
    }
    // Asteroids: one hull point, a knockback and a second of mercy.
    if (ship.invuln <= 0) {
      for (const r of world.rocks) {
        if (dist(ship, r) < r.r + 14) {
          ship.hull -= 1;
          ship.invuln = 1.2;
          ship.vx = -ship.vx * 0.6; ship.vy = -ship.vy * 0.6;
          audio.hit();
          if (ship.hull <= 0) { state.phase = 'over'; state.overReason = 'hull'; audio.lose(); }
          break;
        }
      }
    }
    // Keep the field stocked as the level rises.
    if (world.rocks.length < 2 + state.level && Math.random() < dt * 0.5) world.spawnRock(state.level);
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (input.wasPressed('Enter') || input.wasPressed('Space')) {
      if (state.phase === 'title' || state.phase === 'won' || state.phase === 'over') reset();
    }
    step(dt);
    render(ctx, world, state, now / 1000);
    setHud();
    requestAnimationFrame(frame);
  }

  canvas.addEventListener('click', () => {
    if (state.phase === 'title' || state.phase === 'won' || state.phase === 'over') reset();
  });

  // Fixed scenes for the maker's screenshots (?shot=start|play|win|over&seed=1).
  if (shot === 'play' || shot === 'win' || shot === 'over') {
    state.phase = 'playing';
    state.score = shot === 'play' ? 120 : shot === 'win' ? 300 : 80;
    state.elapsed = shot === 'play' ? 74 : shot === 'win' ? 182 : 96;
    state.timeText = fmtTime(state.elapsed);
    state.level = shot === 'play' ? 2 : shot === 'win' ? 3 : 1;
    state.fuel = shot === 'over' ? 12 : 68;
    world.ship.hull = shot === 'over' ? 1 : 3;
    world.ship.x = 480; world.ship.y = 300; world.ship.vx = 60; world.ship.vy = -30;
    if (shot === 'win') state.phase = 'won';
    if (shot === 'over') { state.phase = 'over'; state.overReason = 'hull'; }
  }

  requestAnimationFrame(frame);
}
