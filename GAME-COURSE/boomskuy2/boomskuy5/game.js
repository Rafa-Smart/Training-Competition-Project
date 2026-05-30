const COLS = 11;
const ROWS = 9;
const STORAGE_KEY = "leaderboard";

const BASE_MAP = [
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

const state = {
  map: cloneMap(BASE_MAP),
  objects: [],
  container: null,
  player: null,
  username: "",
  difficulty: "easy",
  time: 0,
  life: 3,
  walls: 0,
  tnt: 0,
  freeze: 0,
  paused: false,
  gameOver: false,
  scoreSaved: false,
  timerId: null,
  listenersReady: false,
};

const els = {
  mainScene: document.getElementById("mainScene"),
  gameScene: document.getElementById("gameScene"),
  gameMap: document.getElementById("gameMap"),
  usernameInput: document.getElementById("usernameInput"),
  difficultyInput: document.getElementById("difficultyInput"),
  playBtn: document.getElementById("playBtn"),
  instructionBtn: document.getElementById("instructionBtn"),
  closeInstructionBtn: document.getElementById("closeInstructionBtn"),
  instructionOkBtn: document.getElementById("instructionOkBtn"),
  pauseBackBtn: document.getElementById("pauseBackBtn"),
  resumeBtn: document.getElementById("resumeBtn"),
  saveScoreBtn: document.getElementById("saveScoreBtn"),
  leaderboardBtn: document.getElementById("leaderboardBtn"),
  leaderboardBackBtn: document.getElementById("leaderboardBackBtn"),
  guiUsername: document.getElementById("guiUsername"),
  guiTimer: document.getElementById("guiTimer"),
  guiBrick: document.getElementById("guiBrick"),
  guiTNT: document.getElementById("guiTNT"),
  guiIce: document.getElementById("guiIce"),
  guiHearts: document.getElementById("guiHearts"),
  goverUsername: document.getElementById("goverUsername"),
  goverTimer: document.getElementById("goverTimer"),
  goverBrick: document.getElementById("goverBrick"),
  goverTNT: document.getElementById("goverTNT"),
  goverIce: document.getElementById("goverIce"),
  countdownDialog: document.getElementById("countdownDialog"),
  countdownNumber: document.getElementById("countdownNumber"),
  leaderboardTableBody: document.querySelector("#leaderboardTable tbody"),
};

const imageMarks = {
  tnt: "mark-tnt",
  heart: "mark-heart",
  ice: "mark-ice",
};

function cloneMap(map) {
  return map.map((row) => row.slice());
}

function updateScene(name) {
  document.querySelectorAll(".scene").forEach((scene) => {
    scene.classList.toggle("active", scene.id === name);
  });
}

function showDialog(id) {
  document.querySelectorAll(".dialog").forEach((dialog) => {
    dialog.classList.toggle("show", dialog.id === id);
  });
}

function hideDialogs() {
  document.querySelectorAll(".dialog").forEach((dialog) => dialog.classList.remove("show"));
}

function formatTime(totalSeconds) {
  const mins = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const secs = String(totalSeconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

function renderHud() {
  els.guiUsername.textContent = state.username || "-";
  els.guiTimer.textContent = formatTime(state.time);
  els.guiBrick.textContent = state.walls;
  els.guiTNT.textContent = state.tnt;
  els.guiIce.textContent = state.freeze;

  Array.from(els.guiHearts.children).forEach((heart, index) => {
    heart.className = index < state.life ? "" : "break";
  });
}

function setStat(key, value) {
  state[key] = value;
  renderHud();
  checkGameOver();
}

function incStat(key, amount = 1) {
  state[key] += amount;
  renderHud();
}

function decStat(key, amount = 1) {
  state[key] -= amount;
  if (key === "life" && state[key] < 0) state[key] = 0;
  renderHud();
  checkGameOver();
}

function resetStats() {
  state.time = 0;
  state.life = 3;
  state.walls = 0;
  state.tnt = 0;
  state.freeze = 0;
  state.paused = false;
  state.gameOver = false;
  state.scoreSaved = false;
  renderHud();
}

function initGame(container) {
  state.container = container;
  window.addEventListener("resize", renderObjects);
}

function clearGameObjects() {
  for (const obj of state.objects) {
    if (!obj) continue;
    if (obj.element && obj.element.parentNode) obj.element.parentNode.removeChild(obj.element);
  }
  state.objects = [];
  state.map = cloneMap(BASE_MAP);
  state.player = null;
  if (state.container) state.container.innerHTML = "";
}

function addObject(obj) {
  if (!state.container) throw new Error("Game container is not ready.");
  const index = state.objects.findIndex((item) => item === null);
  const label = index === -1 ? state.objects.push(obj) : (state.objects[index] = obj, index + 1);
  state.container.appendChild(obj.element);
  return label;
}

function removeObject(label) {
  const obj = state.objects[label - 1];
  if (!obj) return;

  if (obj.solid && obj.position) {
    const [x, y] = obj.position;
    state.map[y][x] = 0;
  }

  if (obj.element && obj.element.parentNode) {
    obj.element.parentNode.removeChild(obj.element);
  }
  state.objects[label - 1] = null;
}

function getObject(label) {
  return state.objects[label - 1] || null;
}

function getObjectAt(x, y) {
  return state.objects.find((obj) => obj?.position && obj.position[0] === x && obj.position[1] === y) || null;
}

function isInside(x, y) {
  return y >= 0 && y < ROWS && x >= 0 && x < COLS;
}

function isFreeTile(x, y) {
  return isInside(x, y) && state.map[y][x] === 0;
}

function renderObjects() {
  if (!state.container) return;
  const stepX = state.container.clientWidth / COLS;
  const stepY = state.container.clientHeight / ROWS;

  for (const obj of state.objects) {
    if (!obj || !obj.position) continue;

    const el = obj.element;
    const w = el.clientWidth || el.width || 0;
    const h = el.clientHeight || el.height || 0;

    el.style.left = `${obj.position[0] * stepX + (stepX - w) / 2}px`;
    el.style.top = `${obj.position[1] * stepY + (stepY - h) / 2}px`;
  }
}

function animateEntity(element) {
  element.classList.add("walking");
  setTimeout(() => element.classList.remove("walking"), 180);
}

function pickRandomPosition() {
  return [Math.floor(Math.random() * (COLS - 2)) + 1, Math.floor(Math.random() * (ROWS - 2)) + 1];
}

function inRadius(a, b, radius = 1) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) <= radius;
}

function randomPositionUntilValid(player) {
  let pos = pickRandomPosition();
  while (!isFreeTile(pos[0], pos[1]) || inRadius(player.position, pos, 2)) {
    pos = pickRandomPosition();
  }
  return pos;
}

function updateObjectMark(player, type) {
  Object.values(imageMarks).forEach((cls) => player.element.classList.remove(cls));
  const mark = imageMarks[type];
  if (mark) player.element.classList.add(mark);
}

function damagePlayer(amount = 1) {
  if (state.gameOver) return;
  state.life = Math.max(0, state.life - amount);
  renderHud();
  checkGameOver();
}

function checkGameOver() {
  if (!state.gameOver && state.life <= 0) {
    state.gameOver = true;
    state.paused = true;
    stopTimer();
    showGameOver();
  }
}

function startTimer() {
  if (state.timerId) return;
  state.timerId = setInterval(() => {
    if (state.paused || state.gameOver) return;
    state.time += 1;
    renderHud();
  }, 1000);
}

function stopTimer() {
  if (!state.timerId) return;
  clearInterval(state.timerId);
  state.timerId = null;
}

function resetGame() {
  stopTimer();
  clearGameObjects();
  resetStats();
  hideDialogs();
  updateScene("mainScene");
  renderHud();
}

function currentScoreSnapshot() {
  return {
    player: state.username,
    time: state.time,
    walls: state.walls,
    tnt: state.tnt,
    freeze: state.freeze,
  };
}

function getSavedScores() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveScores(scores) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
}

class GameObject {
  constructor() {
    this.element = document.createElement("img");
    this.element.className = "game-entity";
    this.position = null;
    this.solid = false;
    this.label = addObject(this);
    this.element.onload = () => renderObjects();
  }

  setPosition(x, y) {
    if (this.solid) {
      if (!isFreeTile(x, y)) return;
      if (this.position) state.map[this.position[1]][this.position[0]] = 0;
      state.map[y][x] = this.label;
    }
    this.position = [x, y];
    renderObjects();
  }

  destroy() {
    removeObject(this.label);
  }
}

class Player extends GameObject {
  constructor() {
    super();
    this.solid = true;
    this.direction = "down";
    this.canPlace = true;
    this.element.src = "assets/char_down.png";
  }

  setFacing(direction) {
    if (this.direction === direction) return;
    this.direction = direction;
    this.element.src = `assets/char_${direction}.png`;
  }

  move(dx, dy, direction) {
    if (state.paused || state.gameOver) return;
    this.setFacing(direction);
    const [x, y] = this.position;
    const nx = x + dx;
    const ny = y + dy;

    if (!isInside(nx, ny)) return;
    if (state.map[ny][nx] !== 0) return;

    const item = getObjectAt(nx, ny);
    if (item instanceof Item) item.pick(this);

    this.setPosition(nx, ny);
    animateEntity(this.element);
  }

  placeBomb() {
    if (state.paused || state.gameOver || !this.canPlace) return;
    let [x, y] = this.position;

    switch (this.direction) {
      case "left":
        x -= 1;
        break;
      case "right":
        x += 1;
        break;
      case "up":
        y -= 1;
        break;
      default:
        y += 1;
        break;
    }

    if (!isFreeTile(x, y)) return;

    new Bomb(x, y);
    this.canPlace = false;
    setTimeout(() => {
      this.canPlace = true;
    }, 2000);
  }

  showMark(type) {
    updateObjectMark(this, type);
  }
}

class Bomb extends GameObject {
  constructor(x, y) {
    super();
    this.solid = true;
    this.element.src = "assets/bomb.png";
    this.setPosition(x, y);

    this.timer = setTimeout(() => this.explode(), 5000);
  }

  explode() {
    clearTimeout(this.timer);
    const [x, y] = this.position;
    new Explosion().setPosition(x, y);

    const range = state.tnt + 1;
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    for (const [dx, dy] of directions) {
      for (let step = 1; step <= range; step++) {
        const tx = x + dx * step;
        const ty = y + dy * step;

        if (!isInside(tx, ty)) break;

        const cell = state.map[ty][tx];
        if (cell < 0) break;

        new Explosion().setPosition(tx, ty);

        if (cell > 0) break;
      }
    }

    this.destroy();
  }
}

class Explosion extends GameObject {
  constructor() {
    super();
    this.element.src = "assets/explosion.png";
    this.element.style.zIndex = "99";
  }

  setPosition(x, y) {
    const target = getObjectAt(x, y);

    if (target instanceof Player) {
      damagePlayer(1);
    } else if (target instanceof Dog) {
      target.destroy();
    } else if (target && target.solid) {
      target.destroy();
    }

    super.setPosition(x, y);
    setTimeout(() => this.destroy(), 700);
  }
}

class Brick extends GameObject {
  constructor() {
    super();
    this.solid = true;
    this.element.src = "assets/wall.png";
  }

  destroy() {
    if (!this.position) return;
    const [x, y] = this.position;
    super.destroy();
    incStat("walls", 1);

    const drop = Math.floor(Math.random() * 4);
    if (drop === 0) new TNT().setPosition(x, y);
    else if (drop === 1) new BrokenHeart().setPosition(x, y);
    else if (drop === 2) new IceCube().setPosition(x, y);
  }
}

class Dog extends GameObject {
  constructor(player) {
    super();
    this.solid = true;
    this.player = player;
    this.element.src = "assets/dog_down.png";
    this.path = [];
    this.step = 0;
    this.chaseTimer = null;
  }

  startChasing() {
    if (this.chaseTimer) return;
    const interval = Math.max(250, 1000 - state.walls * 35);
    this.chaseTimer = setInterval(() => {
      if (state.paused || state.gameOver) return;
      this.recalculatePath();
      this.moveOneStep();
    }, interval);
  }

  stopChasing() {
    if (this.chaseTimer) clearInterval(this.chaseTimer);
    this.chaseTimer = null;
  }

  recalculatePath() {
    const mapCopy = cloneMap(state.map);
    mapCopy[this.position[1]][this.position[0]] = 0;
    mapCopy[this.player.position[1]][this.player.position[0]] = 0;
    const path = astar(this.position, this.player.position, mapCopy);
    this.path = path && path.length > 1 ? path.slice(1) : [];
    this.step = 0;
  }

  moveOneStep() {
    if (this.step >= this.path.length) return;
    const [nx, ny] = this.path[this.step];
    this.setDirectionSprite(this.position, [nx, ny]);
    this.setPosition(nx, ny);
    animateEntity(this.element);
    this.step += 1;

    if (this.player.position[0] === nx && this.player.position[1] === ny) {
      damagePlayer(1);
      this.path = [];
      this.step = 0;
    }
  }

  setDirectionSprite(from, to) {
    const [fx, fy] = from;
    const [tx, ty] = to;
    if (tx > fx) this.element.src = "assets/dog_right.png";
    else if (tx < fx) this.element.src = "assets/dog_left.png";
    else if (ty > fy) this.element.src = "assets/dog_down.png";
    else if (ty < fy) this.element.src = "assets/dog_up.png";
  }

  destroy() {
    this.stopChasing();
    super.destroy();
  }
}

class Item extends GameObject {
  constructor() {
    super();
    this.solid = false;
    this.element.classList.add("item");
  }

  pick(player) {
    this.element.classList.add("taken");
    setTimeout(() => this.destroy(), 350);
    player.showMark("ice");
  }
}

class TNT extends Item {
  constructor() {
    super();
    this.element.src = "assets/tnt.png";
  }

  pick(player) {
    super.pick(player);
    player.showMark("tnt");
    incStat("tnt", 1);
  }
}

class BrokenHeart extends Item {
  constructor() {
    super();
    this.element.src = "assets/heart.png";
  }

  pick(player) {
    super.pick(player);
    player.showMark("heart");
    damagePlayer(1);
  }
}

class IceCube extends Item {
  constructor() {
    super();
    this.element.src = "assets/ice.png";
  }

  pick(player) {
    super.pick(player);
    player.showMark("ice");
    incStat("freeze", 1);
    player.element.style.filter = "sepia(1) hue-rotate(180deg) saturate(4) brightness(0.95) contrast(1.1)";
    player.canMove = false;
    setTimeout(() => {
      player.element.style.filter = "";
      player.canMove = true;
    }, 5000);
  }
}

function astar(start, goal, grid) {
  const heuristic = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);

  const heap = [];
  const push = (node) => {
    heap.push(node);
    heap.sort((a, b) => a.f - b.f);
  };
  const pop = () => heap.shift() || null;

  const neighbors = ([x, y]) => [
    [x, y - 1],
    [x, y + 1],
    [x - 1, y],
    [x + 1, y],
  ].filter(([nx, ny]) => ny >= 0 && ny < grid.length && nx >= 0 && nx < grid[0].length && grid[ny][nx] === 0);

  const startNode = { position: start, parent: null, g: 0, f: heuristic(start, goal) };
  const gScore = new Map([[start.toString(), 0]]);
  const closed = new Set();
  push(startNode);

  while (heap.length) {
    const current = pop();
    if (!current) break;

    if (current.position[0] === goal[0] && current.position[1] === goal[1]) {
      const path = [];
      let node = current;
      while (node) {
        path.push(node.position);
        node = node.parent;
      }
      return path.reverse();
    }

    closed.add(current.position.toString());

    for (const next of neighbors(current.position)) {
      const key = next.toString();
      if (closed.has(key)) continue;

      const tentative = current.g + 1;
      const previous = gScore.get(key);

      if (previous === undefined || tentative < previous) {
        gScore.set(key, tentative);
        push({
          position: next,
          parent: current,
          g: tentative,
          f: tentative + heuristic(next, goal),
        });
      }
    }
  }

  return null;
}

function getDifficultyDogCount() {
  switch (state.difficulty) {
    case "easy":
      return 1;
    case "medium":
      return 2;
    case "hard":
      return 3;
    default:
      return 1;
  }
}

function spawnBricks(count) {
  while (count > 0) {
    const [x, y] = randomPositionUntilValid(state.player);
    const brick = new Brick();
    brick.setPosition(x, y);
    count -= 1;
  }
}

function spawnDogs(count) {
  while (count > 0) {
    const [x, y] = randomPositionUntilValid(state.player);
    const dog = new Dog(state.player);
    dog.setPosition(x, y);
    dog.startChasing();
    count -= 1;
  }
}

function startGame() {
  resetGame();
  updateScene("gameScene");
  initGame(els.gameMap);

  state.player = new Player();
  state.player.setPosition(1, 1);

  spawnBricks(20);
  spawnDogs(getDifficultyDogCount());

  state.username = els.usernameInput.value.trim();
  state.difficulty = els.difficultyInput.value;
  renderHud();
  startTimer();
}

function openGameoverDialog() {
  els.goverUsername.textContent = state.username || "(Unknown)";
  els.goverTimer.textContent = formatTime(state.time);
  els.goverBrick.textContent = state.walls;
  els.goverTNT.textContent = state.tnt;
  els.goverIce.textContent = state.freeze;
  showDialog("gameoverDialog");
}

function startCountdown() {
  showDialog("countdownDialog");
  const sequence = [3, 2, 1, "GO!"];
  let index = 0;

  const timer = setInterval(() => {
    els.countdownNumber.style.animation = "none";
    void els.countdownNumber.offsetWidth;
    els.countdownNumber.style.animation = "pop 0.5s ease";

    els.countdownNumber.textContent = sequence[index];
    index += 1;

    if (index >= sequence.length) {
      clearInterval(timer);
      setTimeout(() => {
        hideDialogs();
        startGame();
      }, 350);
    }
  }, 1000);
}

function showLeaderboard() {
  const rows = getSavedScores();
  if (!state.scoreSaved && state.username) rows.push(currentScoreSnapshot());

  rows.sort((a, b) => {
    if ((b.walls || 0) !== (a.walls || 0)) return (b.walls || 0) - (a.walls || 0);
    if ((b.tnt || 0) !== (a.tnt || 0)) return (b.tnt || 0) - (a.tnt || 0);
    return (b.freeze || 0) - (a.freeze || 0);
  });

  els.leaderboardTableBody.innerHTML = "";
  rows.forEach((entry) => {
    const tr = document.createElement("tr");

    const cells = [
      entry.player || "Unknown",
      formatTime(entry.time || 0),
      entry.walls || 0,
      entry.tnt || 0,
      entry.freeze || 0,
    ];

    cells.forEach((value) => {
      const td = document.createElement("td");
      td.textContent = value;
      tr.appendChild(td);
    });

    els.leaderboardTableBody.appendChild(tr);
  });

  showDialog("leaderboardDialog");
}

function saveScore() {
  const scores = getSavedScores();
  if (!state.scoreSaved) {
    scores.push(currentScoreSnapshot());
    saveScores(scores);
    state.scoreSaved = true;
  }
  resetGame();
}

function setupControls() {
  if (state.listenersReady) return;
  state.listenersReady = true;

  els.usernameInput.addEventListener("input", () => {
    els.playBtn.disabled = !els.usernameInput.value.trim();
  });

  els.mainScene.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!els.usernameInput.value.trim()) return;
    state.username = els.usernameInput.value.trim();
    state.difficulty = els.difficultyInput.value;
    state.scoreSaved = false;
    startCountdown();
  });

  els.instructionBtn.addEventListener("click", () => showDialog("instructionDialog"));
  els.closeInstructionBtn.addEventListener("click", hideDialogs);
  els.instructionOkBtn.addEventListener("click", hideDialogs);

  els.resumeBtn.addEventListener("click", () => {
    state.paused = false;
    hideDialogs();
    startTimer();
  });

  els.pauseBackBtn.addEventListener("click", () => {
    window.location.reload();
  });

  els.saveScoreBtn.addEventListener("click", saveScore);

  els.leaderboardBtn.addEventListener("click", showLeaderboard);

  els.leaderboardBackBtn.addEventListener("click", () => {
    hideDialogs();
    openGameoverDialog();
  });

  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();

    if (key === "escape") {
      if (state.gameOver) return;
      state.paused = !state.paused;
      if (state.paused) {
        stopTimer();
        showDialog("pauseDialog");
      } else {
        hideDialogs();
        startTimer();
      }
      return;
    }

    if (state.paused || state.gameOver || !state.player) return;

    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " ", "w", "a", "s", "d"].includes(key)) {
      event.preventDefault();
    }

    if (key === "arrowup" || key === "w") state.player.move(0, -1, "up");
    else if (key === "arrowdown" || key === "s") state.player.move(0, 1, "down");
    else if (key === "arrowleft" || key === "a") state.player.move(-1, 0, "left");
    else if (key === "arrowright" || key === "d") state.player.move(1, 0, "right");
    else if (key === " ") state.player.placeBomb();
  });
}

function initMenu() {
  updateScene("mainScene");
  renderHud();
  els.playBtn.disabled = !els.usernameInput.value.trim();
}

setupControls();
initMenu();
