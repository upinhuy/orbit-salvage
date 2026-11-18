// Rendering for Orbit Salvage: everything on screen is drawn in code —
// starfield, ship, cargo pods, fuel cells, asteroids and the title, pause,
// win and game-over overlays. No image assets.
import { WORLD_W, WORLD_H, TARGET_SCORE } from './world.js';

function drawShip(ctx, ship, time) {
  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.rotate(ship.angle);
  if (ship.invuln > 0 && Math.floor(time * 12) % 2 === 0) ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.moveTo(18, 0); ctx.lineTo(-12, 11); ctx.lineTo(-6, 0); ctx.lineTo(-12, -11);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#8ecbff';
  ctx.beginPath(); ctx.arc(2, 0, 4, 0, 6.29); ctx.fill();
  ctx.restore();
}

function drawRock(ctx, r) {
  ctx.save();
  ctx.translate(r.x, r.y);
  ctx.rotate(r.rot);
  ctx.fillStyle = '#8a7f72';
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * 6.283;
    const rad = r.r * (0.8 + 0.25 * Math.sin(i * 2.7));
    const x = Math.cos(a) * rad, y = Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#6b6156';
  ctx.beginPath(); ctx.arc(-r.r * 0.25, -r.r * 0.2, r.r * 0.25, 0, 6.29); ctx.fill();
  ctx.restore();
}

function overlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(5, 8, 14, 0.72)';
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = accent;
  ctx.font = 'bold 44px "Segoe UI", sans-serif';
  ctx.fillText(title, WORLD_W / 2, 240);
  ctx.fillStyle = '#dbe7f3';
  ctx.font = '20px "Segoe UI", sans-serif';
  lines.forEach((line, i) => ctx.fillText(line, WORLD_W / 2, 290 + i * 32));
  ctx.fillStyle = '#8ecbff';
  ctx.font = 'bold 20px "Segoe UI", sans-serif';
  ctx.fillText('Press ENTER or click to play  ·  R restarts', WORLD_W / 2, 290 + lines.length * 32 + 24);
}

export function render(ctx, world, state, time) {
  ctx.fillStyle = '#0a0f1c';
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);
  for (const s of world.stars) {
    ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(time + s.tw));
    ctx.fillStyle = '#cfe6ff';
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.29); ctx.fill();
  }
  ctx.globalAlpha = 1;
  // Cargo pods: gold crates.
  for (const p of world.pods) {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.spin + time * 0.4);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(-10, -10, 20, 20);
    ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 2;
    ctx.strokeRect(-10, -10, 20, 20);
    ctx.beginPath(); ctx.moveTo(-10, -10); ctx.lineTo(10, 10); ctx.moveTo(10, -10); ctx.lineTo(-10, 10); ctx.stroke();
    ctx.restore();
  }
  // Fuel cells: green canisters.
  for (const f of world.fuels) {
    ctx.fillStyle = '#7ee081';
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.29); ctx.fill();
    ctx.fillStyle = '#0a0f1c';
    ctx.font = 'bold 13px "Segoe UI", sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('F', f.x, f.y + 1);
  }
  for (const r of world.rocks) drawRock(ctx, r);
  drawShip(ctx, world.ship, time);

  if (state.phase === 'title') {
    overlay(ctx, 'ORBIT SALVAGE', [
      'You are a salvage pilot on a 300-point contract.',
      'Collect gold cargo (+10), grab green fuel cells,',
      'and dodge the grey asteroids — three hits ends the run.',
      'WASD or arrow keys to fly. Your fuel drains as you fly.',
    ], '#ffd166');
  } else if (state.phase === 'paused') {
    overlay(ctx, 'PAUSED', ['Take a breath. The asteroids wait for no one.', 'Press P to keep flying.'], '#8ecbff');
  } else if (state.phase === 'won') {
    overlay(ctx, 'CONTRACT COMPLETE!', [
      `You banked ${state.score} points in ${state.timeText}.`,
      'The station pays out in full. Fly again for a faster run.',
    ], '#7ee081');
  } else if (state.phase === 'over') {
    overlay(ctx, state.overReason === 'fuel' ? 'OUT OF FUEL' : 'HULL DESTROYED', [
      `You scored ${state.score} of ${TARGET_SCORE} points.`,
      'The salvage contract goes to another pilot.',
    ], '#ff6b6b');
  }
}
