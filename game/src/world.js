// World for Orbit Salvage: the ship, the cargo pods, the fuel cells and the
// asteroids, with their movement, spawning and collisions. No rendering here.
export const WORLD_W = 960;
export const WORLD_H = 600;
export const TARGET_SCORE = 300;

function rand(rng, lo, hi) { return lo + rng() * (hi - lo); }

// A tiny deterministic RNG (mulberry32) so a screenshot seed replays the same scene.
export function makeRng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeWorld(seed) {
  const rng = makeRng(seed || 1);
  const ship = { x: WORLD_W / 2, y: WORLD_H / 2, vx: 0, vy: 0, angle: -Math.PI / 2, hull: 3, invuln: 0 };
  const stars = Array.from({ length: 90 }, () => ({
    x: rng() * WORLD_W, y: rng() * WORLD_H, r: rand(rng, 0.5, 1.8), tw: rand(rng, 0, 6.28),
  }));
  const pods = [];
  const fuels = [];
  const rocks = [];
  function spawnPod() {
    pods.push({ x: rand(rng, 40, WORLD_W - 40), y: rand(rng, 40, WORLD_H - 40), vx: rand(rng, -12, 12), vy: rand(rng, -12, 12), r: 12, spin: rand(rng, 0, 6.28) });
  }
  function spawnFuel() {
    fuels.push({ x: rand(rng, 40, WORLD_W - 40), y: rand(rng, 40, WORLD_H - 40), vx: rand(rng, -10, 10), vy: rand(rng, -10, 10), r: 11 });
  }
  function spawnRock(level) {
    const edge = Math.floor(rng() * 4);
    const x = edge === 0 ? -30 : edge === 1 ? WORLD_W + 30 : rand(rng, 0, WORLD_W);
    const y = edge === 2 ? -30 : edge === 3 ? WORLD_H + 30 : rand(rng, 0, WORLD_H);
    const speed = rand(rng, 25, 45) + level * 6;
    const a = Math.atan2(ship.y - y, ship.x - x) + rand(rng, -0.6, 0.6);
    rocks.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, r: rand(rng, 16, 34), spin: rand(rng, -1, 1), rot: rand(rng, 0, 6.28) });
  }
  for (let i = 0; i < 6; i++) spawnPod();
  for (let i = 0; i < 2; i++) spawnFuel();
  for (let i = 0; i < 3; i++) spawnRock(1);
  return { rng, ship, stars, pods, fuels, rocks, spawnPod, spawnFuel, spawnRock };
}

export function dist(a, b) {
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function wrap(o) {
  if (o.x < -40) o.x = WORLD_W + 40;
  if (o.x > WORLD_W + 40) o.x = -40;
  if (o.y < -40) o.y = WORLD_H + 40;
  if (o.y > WORLD_H + 40) o.y = -40;
}
