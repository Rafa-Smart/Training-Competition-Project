const Config = {
  levels: { easy: 30, medium: 20, hard: 15 },
  points: { target1: 10, target2: 20, target3: 30 },
  guns: ["gun1", "gun2"],
  missPenalty: 5,
  spawnMs: 3000,
  initTargets: 3,
  maxLiveTargets: 8,
  storageKey: "shooter_match_history",
};

const State = {
  name: "",
  level: "easy",
  gunIndex: 0,
  target: "target1",
  score: 0,
  timeLeft: 0,
  running: false,
  paused: false,
  countingDown: false,
  timerId: null,
  spawnId: null,
  cdId: null,
  x: 500,
  y: 300,
  shots: [],
  shotSort: "last",
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const Game = {
  init() {
    this.game = $("#game");
    this.board = $("#board");
    this.hud = $("#hud");
    this.sidebar = $("#sidebar");
    this.pointer = $("#pointer");
    this.gun = $("#gun");

    this.welcome = $("#welcome");
    this.instruction = $("#instruction");
    this.countdown = $("#countdown");
    this.pause = $("#pause");
    this.gameover = $("#gameover");
    this.history = $("#history");

    this.nameInput = $("#playerName");
    this.levelInput = $("#level");
    this.playBtn = $("#btnPlay");

    this.hudName = $("#hudName");
    this.hudScore = $("#hudScore");
    this.hudTime = $("#hudTime");
    this.hudBar = $("#hudBar");

    this.sideGun = $("#sideGun");
    this.shotLog = $("#shotLog");

    this.countNum = $("#countNum");
    this.goName = $("#goName");
    this.goScore = $("#goScore");
    this.historyBody = $("#historyBody");

    this.bind();
    this.setOverlay("welcome");
    this.setPlaying(false);
    this.updatePointer(true);
    this.renderShots();
  },
  bind() {
    this.nameInput.addEventListener("input", () => {
      this.playBtn.disabled = !this.nameInput.value.trim();
    });

    this.playBtn.addEventListener("click", () => this.prepareGame());
    $("#btnInst").addEventListener("click", () =>
      this.setOverlay("instruction"),
    );
    $("#btnContinue").addEventListener("click", () => this.resumeGame());
    $("#btnSave").addEventListener("click", () => this.saveScore());
    $("#btnHistory").addEventListener("click", () => this.showHistory("last"));
    $("#btnRestart").addEventListener("click", () => this.restart());

    $("#sortScore").addEventListener("click", () => {
      State.shotSort = "score";
      this.renderShots();
    });
    $("#sortLast").addEventListener("click", () => {
      State.shotSort = "last";
      this.renderShots();
    });

    $("#histScore").addEventListener("click", () => this.showHistory("score"));
    $("#histLast").addEventListener("click", () => this.showHistory("last"));

    $$("[data-close]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-close");
        if (target === "instruction") this.setOverlay("welcome");
        if (target === "history") this.setOverlay("gameover");
      });
    });

    document.addEventListener("mousemove", (e) => {
      const rect = this.game.getBoundingClientRect();
      State.x = e.clientX - rect.left;
      State.y = e.clientY - rect.top;

      if (State.running && !State.paused && !State.countingDown) {
        this.updatePointer();
      }
    });

    this.board.addEventListener("click", (e) => {
      if (!State.running || State.paused || State.countingDown) return;
      if (e.target === this.board) this.miss();
    });

    document.addEventListener("keydown", (e) => {
      if (e.code === "Escape") {
        if (State.running && !State.countingDown) this.togglePause();
      }
      if (e.code === "Space") {
        if (State.running && !State.paused && !State.countingDown) {
          e.preventDefault();
          this.switchGun();
        }
      }
    });
  },
  setOverlay(name) {
    const map = {
      welcome: this.welcome,
      instruction: this.instruction,
      countdown: this.countdown,
      pause: this.pause,
      gameover: this.gameover,
      history: this.history,
    };

    Object.values(map).forEach((el) => el.classList.add("hidden"));
    if (name && map[name]) map[name].classList.remove("hidden");
  },

  hideAllOverlays() {
    [
      "welcome",
      "instruction",
      "countdown",
      "pause",
      "gameover",
      "history",
    ].forEach((k) => {
      const el = this[k];
      if (el) el.classList.add("hidden");
    });
  },
  setPlaying(on) {
    this.hud.style.display = on ? "flex" : "none";
    this.sidebar.style.display = on ? "block" : "none";
    this.pointer.style.display = on ? "block" : "none";
    this.gun.style.display = on ? "block" : "none";
    this.game.classList.toggle("playing", on);
    this.game.classList.toggle("paused", State.paused && on);
  },
  clearTimers() {
    clearInterval(State.timerId);
    clearInterval(State.spawnId);
    clearInterval(State.cdId);
    State.timerId = null;
    State.spawnId = null;
    State.cdId = null;
  },
  updatePointer() {
    this.pointer.style.left = `${State.x}px`;
    this.pointer.style.top = `${State.y}px`;
    this.gun.style.left = `${State.x}px`;
    this.gun.style.top = `${State.y + 42}px`;
  },
  getSelectedValues() {
    const gun =
      document.querySelector('input[name="gun"]:checked')?.value || "gun1";
    const target =
      document.querySelector('input[name="target"]:checked')?.value ||
      "target1";
    return {
      name: this.nameInput.value.trim(),
      level: this.levelInput.value,
      gun,
      target,
    };
  },

  prepareGame() {
    const data = this.getSelectedValues();
    if (!data.name) return;

    State.name = data.name;
    State.level = data.level;
    State.gunIndex = Config.guns.indexOf(data.gun);
    State.target = data.target;
    State.score = 0;
    State.timeLeft = Config.levels[State.level];
    State.shots = [];
    State.running = false;
    State.paused = false;
    State.countingDown = true;

    this.clearTimers();
    this.clearTargets();
    this.renderShots();
    this.updateHUD();
    this.setGunImage();
    this.setOverlay("countdown");

    this.runCountdown(() => this.startGame());
  },

  runCountdown(done) {
    let n = 3;
    this.countNum.textContent = n;

    State.cdId = setInterval(() => {
      n -= 1;
      if (n === 0) {
        this.countNum.textContent = "GO!";
      } else if (n < 0) {
        this.clearTimers();
        State.countingDown = false;
        done?.();
      } else {
        this.countNum.textContent = n;
      }
    }, 1000);
  },
  startGame() {
    this.hideAllOverlays();
    State.running = true;
    State.paused = false;
    this.setPlaying(true);
    this.updatePointer();
    this.spawnInitialTargets();
    this.startLoops();
    this.updateHUD();
    this.renderShots();
  },

  startLoops() {
    this.clearTimers();

    State.timerId = setInterval(() => {
      if (!State.running || State.paused) return;
      State.timeLeft -= 1;
      this.updateHUD();
      if (State.timeLeft <= 0) this.endGame();
    }, 1000);

    State.spawnId = setInterval(() => {
      if (State.running && !State.paused) this.spawnTarget();
    }, Config.spawnMs);
  },
  spawnInitialTargets() {
    for (let i = 0; i < Config.initTargets; i++) this.spawnTarget();
  },

  spawnTarget() {
    if (this.board.querySelectorAll(".tgt").length >= Config.maxLiveTargets)
      return;

    const el = document.createElement("img");
    el.className = "tgt";
    el.alt = "";
    el.src = `Sprites/${State.target}.png`;

    const size = 68;
    const maxX = Math.max(0, this.board.clientWidth - size);
    const maxY = Math.max(0, this.board.clientHeight - size);

    el.style.left = `${Math.random() * maxX}px`;
    el.style.top = `${Math.random() * maxY}px`;

    el.addEventListener("click", (e) => {
      e.stopPropagation();
      this.hitTarget(el);
    });

    this.board.appendChild(el);
  },

  clearTargets() {
    $$(".tgt", this.board).forEach((el) => el.remove());
  },

  removeTarget(el) {
    const boom = document.createElement("div");
    boom.className = "boomfx";
    boom.style.left = el.style.left;
    boom.style.top = el.style.top;
    this.board.appendChild(boom);
    setTimeout(() => boom.remove(), 350);

    el.classList.add("boom");
    setTimeout(() => el.remove(), 240);
  },

  hitTarget(el) {
    if (!State.running || State.paused || State.countingDown) return;

    const pts = Config.points[State.target] || 0;
    State.score += pts;
    State.shots.push({
      hit: true,
      pts,
      time: Date.now(),
    });

    this.removeTarget(el);
    this.updateHUD();
    this.renderShots();
  },

  miss() {
    State.timeLeft = Math.max(0, State.timeLeft - Config.missPenalty);
    State.shots.push({
      hit: false,
      pts: 0,
      time: Date.now(),
    });

    this.updateHUD();
    this.renderShots();

    if (State.timeLeft <= 0) this.endGame();
  },

  updateHUD() {
    this.hudName.textContent = State.name || "-";
    this.hudScore.textContent = State.score;
    this.hudTime.textContent = State.timeLeft;

    const total = Config.levels[State.level] || 1;
    const pct = Math.max(0, (State.timeLeft / total) * 100);
    this.hudBar.style.width = `${pct}%`;

    if (pct > 50) this.hudBar.style.background = "#22c55e";
    else if (pct > 25) this.hudBar.style.background = "#f59e0b";
    else this.hudBar.style.background = "#ef4444";
  },

  renderShots() {
    const list = [...State.shots];

    if (State.shotSort === "score") {
      list.sort((a, b) => b.hit - a.hit || b.pts - a.pts || b.time - a.time);
    } else {
      list.reverse();
    }

    this.shotLog.innerHTML = list.length
      ? list
          .map(
            (s, i) => `
        <div class="row ${s.hit ? "hit" : "miss"}">
          <span>#${i + 1} ${s.hit ? "Hit" : "Miss"}</span>
          <span>${s.hit ? `+${s.pts}` : `-${Config.missPenalty}s`}</span>
        </div>
      `,
          )
          .join("")
      : `<div class="row"><span>No shot yet</span><span>-</span></div>`;
  },
  setGunImage() {
    const src = `Sprites/${Config.guns[State.gunIndex]}.png`;
    this.sideGun.src = src;
    this.gun.src = src;
  },

  switchGun() {
    State.gunIndex = (State.gunIndex + 1) % Config.guns.length;
    this.setGunImage();

    this.gun.classList.remove("swap");
    void this.gun.offsetWidth;
    this.gun.classList.add("swap");
    setTimeout(() => this.gun.classList.remove("swap"), 220);
  },
  togglePause() {
    if (!State.running || State.countingDown) return;
    if (State.paused) this.resumeGame();
    else this.pauseGame();
  },

  pauseGame() {
    State.paused = true;
    this.clearTimers();
    this.game.classList.add("paused");
    this.setOverlay("pause");
  },
  resumeGame() {
    this.setOverlay("countdown");
    State.countingDown = true;
    this.game.classList.add("paused");
    this.runCountdown(() => {
      State.paused = false;
      State.countingDown = false;
      this.hideAllOverlays();
      this.setPlaying(true);
      this.startLoops();
    });
  },

  endGame() {
    if (!State.running) return;

    State.running = false;
    State.paused = false;
    State.countingDown = false;
    this.clearTimers();
    this.clearTargets();
    this.setPlaying(false);

    this.goName.textContent = State.name;
    this.goScore.textContent = State.score;
    this.setOverlay("gameover");
  },

  saveScore() {
    const data = JSON.parse(localStorage.getItem(Config.storageKey) || "[]");
    data.push({
      name: State.name,
      score: State.score,
      level: State.level,
      gun: Config.guns[State.gunIndex],
      target: State.target,
      date: new Date().toLocaleString(),
    });
    localStorage.setItem(Config.storageKey, JSON.stringify(data));
    alert("Saved");
  },

  showHistory(mode = "last") {
    const list = JSON.parse(localStorage.getItem(Config.storageKey) || "[]");

    const sorted =
      mode === "score"
        ? [...list].sort((a, b) => b.score - a.score)
        : [...list].reverse();

    this.historyBody.innerHTML = sorted.length
      ? sorted
          .map(
            (r, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${r.name}</td>
          <td>${r.score}</td>
          <td>${r.level}</td>
          <td>${r.gun}</td>
          <td>${r.target}</td>
          <td>${r.date}</td>
        </tr>
      `,
          )
          .join("")
      : `<tr><td colspan="7">No history</td></tr>`;

    this.setOverlay("history");
  },
  restart() {
    this.clearTimers();
    State.name = "";
    State.level = "easy";
    State.gunIndex = 0;
    State.target = "target1";
    State.score = 0;
    State.timeLeft = 0;
    State.running = false;
    State.paused = false;
    State.countingDown = false;
    State.shots = [];
    State.shotSort = "last";

    this.nameInput.value = "";
    this.levelInput.value = "easy";
    document.querySelector('input[name="gun"][value="gun1"]').checked = true;
    document.querySelector('input[name="target"][value="target1"]').checked =
      true;
    this.playBtn.disabled = true;

    this.clearTargets();
    this.renderShots();
    this.updateHUD();
    this.setPlaying(false);
    this.setOverlay("welcome");
  },
};

document.addEventListener("DOMContentLoaded", () => Game.init());
