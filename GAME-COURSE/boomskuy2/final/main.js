// MAP: -1=stone, 0=empty, >0=object label
const MAP = [
  [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [-1, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1],
  [-1, 0, -1, 0, -1, 0, -1, 0, -1, 0, -1],
  [-1, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1],
  [-1, 0, -1, 0, -1, 0, -1, 0, -1, 0, -1],
  [-1, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1],
  [-1, 0, -1, 0, -1, 0, -1, 0, -1, 0, -1],
  [-1, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1],
  [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
];
const ROWS = MAP.length,
  COLS = MAP[0].length;
const objs = [];
let container,
  paused = false,
  timerId = null;

const S = { player: "", time: 0, life: 3, walls: 0, tnt: 0, ice: 0 };
function setStat(k, v) {
  S[k] = v;
  updateHUD();
}
function inc(k) {
  setStat(k, S[k] + 1);
}
function dec(k) {
  setStat(k, S[k] - 1);
  if (k === "life" && S.life <= 0) G.over();
}
function fmtT(s) {
  return `${String((s / 60) | 0).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function updateHUD() {
  document.getElementById("guiTime").textContent = fmtT(S.time);
  document.getElementById("guiBrick").textContent = S.walls;
  document.getElementById("guiTNT").textContent = S.tnt;
  document.getElementById("guiIce").textContent = S.ice;
  document
    .querySelectorAll("#guiHearts span")
    .forEach((h, i) => (h.className = i >= S.life ? "empty" : ""));
}

function attach(obj) {
  for (let i = 0; i < objs.length; i++)
    if (!objs[i]) {
      objs[i] = obj;
      container.append(obj.el);
      return i + 1;
    }
  objs.push(obj);
  container.append(obj.el);
  return objs.length;
}
function detach(lbl) {
  const o = objs[lbl - 1];
  if (!o) return;
  if (o.solid && o.pos) MAP[o.pos[1]][o.pos[0]] = 0;
  o.el.remove();
  objs[lbl - 1] = null;
}
function atPos(x, y) {
  const l = MAP[y]?.[x];
  return l > 0 ? objs[l - 1] : null;
}
function render() {
  if (!container) return;
  const sw = container.clientWidth / COLS,
    sh = container.clientHeight / ROWS;
  objs.forEach((o) => {
    if (!o?.pos) return;
    const w = o.el.clientWidth || sw,
      h = o.el.clientHeight || sh;
    o.el.style.left = `${o.pos[0] * sw + (sw - w) / 2}px`;
    o.el.style.top = `${o.pos[1] * sh + (sh - h) / 2}px`;
  });
}

class Obj {
  constructor(src) {
    this.el = document.createElement("img");
    this.el.src = `assets/${src}.png`;
    this.el.onload = render;
    this.lbl = attach(this);
    this.pos = null;
    this.solid = false;
  }
  place(x, y) {
    if (this.solid) {
      if (MAP[y][x] !== 0) return false;
      if (this.pos) MAP[this.pos[1]][this.pos[0]] = 0;
      MAP[y][x] = this.lbl;
    }
    this.pos = [x, y];
    render();
    return true;
  }
  destroy() {
    detach(this.lbl);
  }
}

class Player extends Obj {
  constructor() {
    super("char_down");
    this.solid = true;
    this.dir = "down";
    this.canMove = true;
    this.canBomb = true;
    document.addEventListener("keydown", (e) => {
      if (paused || !this.canMove) return;
      const mv = {
        ArrowUp: [0, -1, "up"],
        ArrowDown: [0, 1, "down"],
        ArrowLeft: [-1, 0, "left"],
        ArrowRight: [1, 0, "right"],
        w: [0, -1, "up"],
        s: [0, 1, "down"],
        a: [-1, 0, "left"],
        d: [1, 0, "right"],
      };
      const m = mv[e.key] || mv[e.key.toLowerCase()];
      if (m) {
        e.preventDefault();
        const [dx, dy, dir] = m;
        if (this.dir === dir) this.place(this.pos[0] + dx, this.pos[1] + dy);
        else {
          this.dir = dir;
          this.el.src = `assets/char_${dir}.png`;
        }
      }
      if (e.key === " " && this.canBomb) {
        e.preventDefault();
        this.placeBomb();
      }
    });
  }
  place(x, y) {
    const hit = atPos(x, y);
    if (hit instanceof Item) hit.pick(this);
    return super.place(x, y);
  }
  placeBomb() {
    const d = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[
      this.dir
    ];
    const bx = this.pos[0] + d[0],
      by = this.pos[1] + d[1];
    if (MAP[by]?.[bx] !== 0) return;
    new Bomb(bx, by);
    this.canBomb = false;
    setTimeout(() => (this.canBomb = true), 2000);
  }
}

class Bomb extends Obj {
  constructor(x, y) {
    super("bomb");
    this.solid = true;
    this.range = S.tnt + 1;
    this.place(x, y);
    // Fixed: bomb explodes after 5 seconds as per spec
    setTimeout(() => {
      if (!paused) this.explode();
      else {
        const iv = setInterval(() => {
          if (!paused) {
            clearInterval(iv);
            this.explode();
          }
        }, 200);
      }
    }, 5000);
  }
  explode() {
    if (!this.pos) return;
    const [x, y] = this.pos;
    this.destroy();
    [
      [0, 0],
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ].forEach(([dx, dy]) => {
      for (let i = 0; i < (dx || dy ? this.range : 1); i++) {
        const tx = x + dx * i,
          ty = y + dy * i;
        if (MAP[ty]?.[tx] === undefined || MAP[ty][tx] === -1) break;
        new Explosion(tx, ty);
        if (MAP[ty][tx] > 0) break;
      }
    });
  }
}

class Explosion extends Obj {
  constructor(x, y) {
    super("explosion");
    this.el.style.zIndex = 99;
    const hit = atPos(x, y);
    if (hit instanceof Player) dec("life");
    else if (hit instanceof Dog) hit.destroy();
    else if (hit instanceof Brick) hit.destroy();
    this.place(x, y);
    setTimeout(() => this.destroy(), 800);
  }
}

class Brick extends Obj {
  constructor() {
    super("wall");
    this.solid = true;
  }
  destroy() {
    const [x, y] = this.pos;
    super.destroy();
    inc("walls");
    const tp = [TNT, BrokenHeart, IceCube, null][(Math.random() * 4) | 0];
    if (tp) new tp().place(x, y);
  }
}

class Item extends Obj {
  constructor(src) {
    super(src);
    this.el.className = "item";
  }
  pick() {
    this.destroy();
  }
}
class TNT extends Item {
  constructor() {
    super("tnt");
  }
  pick() {
    super.pick();
    inc("tnt");
  }
}
class BrokenHeart extends Item {
  constructor() {
    super("heart");
  }
  pick() {
    super.pick();
    dec("life");
  }
}
class IceCube extends Item {
  constructor() {
    super("ice");
  }
  pick(p) {
    super.pick();
    inc("ice");
    p.canMove = false;
    p.el.style.filter = "sepia(1)hue-rotate(180deg)saturate(4)";
    setTimeout(() => {
      p.canMove = true;
      p.el.style.filter = "";
    }, 5000);
  }
}

class Dog extends Obj {
  constructor(player) {
    super("dog_down");
    this.solid = true;
    this.player = player;
    // Fixed: dog spawns then starts its interval after being placed
    this._player = player;
    this._startInterval();
  }
  _startInterval() {
    this.iv = setInterval(() => {
      if (paused || !this.pos) return;
      const path = bfs(this.pos, this._player.pos);
      if (!path || path.length < 2) return;
      const [nx, ny] = path[1];
      const [fx, fy] = this.pos;
      const dir =
        nx > fx ? "right" : nx < fx ? "left" : ny > fy ? "down" : "up";
      this.el.src = `assets/dog_${dir}.png`;
      if (nx === this._player.pos[0] && ny === this._player.pos[1]) {
        dec("life");
        return;
      }
      this.place(nx, ny);
    }, 800);
  }
  destroy() {
    clearInterval(this.iv);
    super.destroy();
  }
}

// BFS fix: allow traversal into the goal cell even if occupied by player
function bfs(start, goal) {
  const vis = new Set([`${start[0]},${start[1]}`]);
  const q = [[start, [start]]];
  while (q.length) {
    const [[cx, cy], path] = q.shift();
    if (cx === goal[0] && cy === goal[1]) return path;
    for (const [dx, dy] of [
      [0, -1],
      [0, 1],
      [-1, 0],
      [1, 0],
    ]) {
      const nx = cx + dx,
        ny = cy + dy,
        k = `${nx},${ny}`;
      if (vis.has(k)) continue;
      const cell = MAP[ny]?.[nx];
      if (cell === undefined || cell === -1) continue;
      // allow if empty OR if it's the goal (player cell)
      if (cell !== 0 && !(nx === goal[0] && ny === goal[1])) continue;
      vis.add(k);
      q.push([
        [nx, ny],
        [...path, [nx, ny]],
      ]);
    }
    if (path.length > 30) break;
  }
}

const G = {
  start(username, difficulty) {
    Object.assign(S, {
      player: username,
      time: 0,
      life: 3,
      walls: 0,
      tnt: 0,
      ice: 0,
    });
    container = document.getElementById("gameMap");
    container.innerHTML = "";
    objs.length = 0;
    for (let y = 0; y < ROWS; y++)
      for (let x = 0; x < COLS; x++) {
        const stone =
          y === 0 ||
          y === ROWS - 1 ||
          x === 0 ||
          x === COLS - 1 ||
          (y % 2 === 0 &&
            x % 2 === 0 &&
            y > 0 &&
            y < ROWS - 1 &&
            x > 0 &&
            x < COLS - 1);
        MAP[y][x] = stone ? -1 : 0;
      }
    document.getElementById("guiName").textContent = username;
    updateHUD();
    let n = 3;
    const el = document.getElementById("countNum");
    showDialog("countdownDialog");
    const cd = setInterval(() => {
      el.textContent = n--;
      if (n < 0) {
        clearInterval(cd);
        hideDialog();
        this.play(difficulty);
      }
    }, 1000);
  },
  play(difficulty) {
    const player = new Player();
    player.place(1, 1);
    for (let i = 0; i < 22; i++) {
      const [x, y] = rndPos(player);
      new Brick().place(x, y);
    }
    const dc = { easy: 1, medium: 2, hard: 3 }[difficulty] || 1;
    for (let i = 0; i < dc; i++) {
      const [x, y] = rndPos(player);
      new Dog(player).place(x, y);
    }
    timerId = setInterval(() => {
      if (!paused) inc("time");
    }, 1000);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        paused = !paused;
        if (paused) {
          showDialog("pauseDialog");
          clearInterval(timerId);
          timerId = null;
        } else hideDialog();
      }
    });
    window.addEventListener("resize", render);
  },
  resume() {
    paused = false;
    timerId = setInterval(() => {
      if (!paused) inc("time");
    }, 1000);
  },
  over() {
    clearInterval(timerId);
    paused = true;
    document.getElementById("goverMsg").textContent =
      `Well played ${S.player}! You survived ${fmtT(S.time)}.`;
    document.getElementById("goverStats").innerHTML =
      `<div class="stat"><img src="assets/wall_crack.png">=<b>${S.walls}</b></div>
       <div class="stat"><img src="assets/tnt.png">=<b>${S.tnt}</b></div>
       <div class="stat"><img src="assets/ice.png">=<b>${S.ice}</b></div>`;
    showDialog("goverDialog");
  },
  saveScore() {
    const lb = JSON.parse(localStorage.getItem("bomskuy") || "[]");
    lb.push({
      player: S.player,
      time: fmtT(S.time),
      walls: S.walls,
      tnt: S.tnt,
      ice: S.ice,
    });
    localStorage.setItem("bomskuy", JSON.stringify(lb));
    location.reload();
  },
};

function rndPos(player) {
  let x, y;
  do {
    x = (1 + Math.random() * (COLS - 2)) | 0;
    y = (1 + Math.random() * (ROWS - 2)) | 0;
  } while (
    MAP[y][x] !== 0 ||
    Math.abs(x - player.pos[0]) + Math.abs(y - player.pos[1]) <= 2
  );
  return [x, y];
}
