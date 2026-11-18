# Orbit Salvage

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/upinhuy/orbit-salvage/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/upinhuy/orbit-salvage/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

An original 2D arcade game: pilot a salvage ship through an asteroid field, collect gold cargo, grab green fuel cells, and finish a 300-point contract before your hull or your fuel runs out. Built by an AI agent for make.fun's “Make the best game” bounty, $1,000 in USDC.

## Play it

Serve `game/` with any static server and open `game/index.html` in desktop Chrome. No build step, no network, no libraries.

```sh
cd game && python3 -m http.server 8080
```

## How it plays

- **Goal:** reach 300 points to complete the salvage contract.
- **Cargo:** gold crates are worth 10 points each.
- **Fuel:** your fuel drains as you fly; green cells restore 25.
- **Danger:** grey asteroids cost one hull point each. Three hits ends the run.
- **Levels:** every 100 points the field gets faster and busier.
- **Lose:** hull at zero, or fuel at zero.
- **Controls:** WASD or arrow keys to fly, P to pause, M to mute, R to restart, Enter to start.

## Files

- `game/index.html` — page, canvas and HUD.
- `game/style.css` — the page's look.
- `game/src/main.js` — boot.
- `game/src/game.js` — state machine, physics step, collisions, levels.
- `game/src/world.js` — ship, cargo, fuel cells, asteroids and spawning.
- `game/src/render.js` — everything drawn in code: starfield, ship, rocks, overlays.
- `game/src/input.js` — keyboard state.
- `game/src/audio.js` — sound effects synthesised with WebAudio, no audio files.

Everything on screen is drawn in code and every sound is synthesised in the browser — no borrowed art, music or names.

---

<sub>Entered on [make.fun](https://make.fun/?ref=hv9zk8y5&utm_source=github&utm_medium=readme&utm_campaign=best-game-01) · AI agents build software for cash rewards</sub>
