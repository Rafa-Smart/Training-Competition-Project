const CFG = {
  levels: { easy: 30, medium: 20, hard: 15 },
  points: { target1: 10, target2: 20, target3: 30 },
  guns: ["gun1", "gun2"],
  missPenalty: 5,
  spawnMs: 3000,
  initTargets: 3,
  maxTargets: 8,
  storageKey: "shooter_history",
};

const S = {
  name: "",
  level: "easy",
  gunIdx: 0,
  target: "target1",
  score: 0,
  timeLeft: 0,
  running: false,
  paused: false,
  counting: false,
  timerID: null,
  spawnID: null,
  cdID: null,
  mx: 500,
  my: 300,
  shots: [],
  shotSort: "last",
};

const el = {};

document.addEventListener("DOMContentLoaded", init);

function init() {
  initEls();
  showOverlay("welcome");
  setGameUI(false);

  el.playerName.addEventListener("input", () => {
    el.btnPlay.disabled = !el.playerName.value.trim();
  });

  el.btnInst.addEventListener("click", () => showOverlay("instruction"));
  document
    .querySelector('[data-close="instruction"]')
    .addEventListener("click", () => showOverlay("welcome"));
  document
    .querySelector('[data-close="history"]')
    .addEventListener("click", () => showOverlay("gameover"));

  el.btnPlay.addEventListener("click", prepareGame);
  el.btnContinue.addEventListener("click", resumeGame);
  el.btnSave.addEventListener("click", saveScore);
  el.btnHistory.addEventListener("click", () => showHistory("last"));
  el.btnRestart.addEventListener("click", restart);

  el.sortScore.addEventListener("click", () => {
    S.shotSort = "score";
    renderShots();
  });

  el.sortLast.addEventListener("click", () => {
    S.shotSort = "last";
    renderShots();
  });

  el.histScore.addEventListener("click", () => showHistory("score"));
  el.histLast.addEventListener("click", () => showHistory("last"));

  document.addEventListener("mousemove", (e) => {
    const r = el.game.getBoundingClientRect();
    S.mx = e.clientX - r.left;
    S.my = e.clientY - r.top;
    if (S.running && !S.paused && !S.counting) movePointer();
  });

  el.board.addEventListener("click", (e) => {
    if (!S.running || S.paused || S.counting) return;
    if (e.target === el.board) miss();
  });

  document.addEventListener("keydown", (e) => {
    if (e.code === "Escape" && S.running && !S.counting) togglePause();
    if (e.code === "Space" && S.running && !S.paused && !S.counting) {
      e.preventDefault();
      switchGun();
    }
  });
}

function initEls() {
  [
    "game",
    "board",
    "hud",
    "sidebar",
    "pointer",
    "gun",
    "welcome",
    "instruction",
    "countdown",
    "pause",
    "gameover",
    "history",
    "playerName",
    "level",
    "btnPlay",
    "btnInst",
    "btnContinue",
    "btnSave",
    "btnHistory",
    "btnRestart",
    "hudName",
    "hudScore",
    "hudTime",
    "hudBar",
    "sideGun",
    "shotLog",
    "countNum",
    "goName",
    "goScore",
    "historyBody",
    "sortScore",
    "sortLast",
    "histScore",
    "histLast",
  ].forEach((id) => {
    el[id] = document.getElementById(id);
  });
}

function showOverlay(name) {
  ["welcome", "instruction", "countdown", "pause", "gameover", "history"].forEach(
    (id) => {
      el[id].classList.toggle("hidden", id !== name);
    },
  );
}

function hideOverlays() {
  ["welcome", "instruction", "countdown", "pause", "gameover", "history"].forEach(
    (id) => el[id].classList.add("hidden"),
  );
}

function setGameUI(on) {
  el.hud.classList.toggle("hidden", !on);
  el.board.classList.toggle("hidden", !on);
  el.sidebar.classList.toggle("hidden", !on);
  el.pointer.classList.toggle("hidden", !on);
  el.gun.classList.toggle("hidden", !on);
}

function movePointer() {
  el.pointer.style.left = `${S.mx}px`;
  el.pointer.style.top = `${S.my}px`;
  el.gun.style.left = `${S.mx}px`;
  el.gun.style.top = `${S.my + 42}px`;
}


function updateHUD() {
  el.hudName.textContent = S.name;
  el.hudScore.textContent = S.score;
  el.hudTime.textContent = S.timeLeft;

  const maxTime = CFG.levels[S.level];
  const pct = Math.max(0, (S.timeLeft / maxTime) * 100);

  el.hudBar.style.width = `${pct}%`;
  el.hudBar.style.background =
    pct > 50 ? "#22c55e" : pct > 25 ? "#f59e0b" : "#ef4444";
}

function clearTimers() {
  clearInterval(S.timerID);
  clearInterval(S.spawnID);
  clearInterval(S.cdID);
  S.timerID = S.spawnID = S.cdID = null;
}

function clearTargets() {
  el.board.querySelectorAll(".tgt").forEach((t) => t.remove());
}

function prepareGame() {
  const name = el.playerName.value.trim();
  if (!name) return;

  const gun = document.querySelector('input[name="gun"]:checked').value;
  const target = document.querySelector('input[name="target"]:checked').value;

  S.name = name;
  S.level = el.level.value;
  S.gunIdx = CFG.guns.indexOf(gun);
  S.target = target;
  S.score = 0;
  S.timeLeft = CFG.levels[S.level];
  S.shots = [];
  S.running = false;
  S.paused = false;
  S.counting = true;

  clearTimers();
  clearTargets();
  setGunImage();
  renderShots();
  updateHUD();

  showOverlay("countdown");
  runCountdown(startGame);
}

function runCountdown(done) {
  let n = 3;
  el.countNum.textContent = n;

  S.cdID = setInterval(() => {
    n -= 1;

    if (n > 0) {
      el.countNum.textContent = n;
      return;
    }

    if (n === 0) {
      el.countNum.textContent = "GO!";
      return;
    }

    clearTimers();
    done?.();
  }, 1000);
}

function startGame() {
  hideOverlays();
  S.running = true;
  S.paused = false;
  S.counting = false;

  setGameUI(true);
  movePointer();
  spawnInitial();
  startLoops();
  updateHUD();
}

function startLoops() {
  clearInterval(S.timerID);
  clearInterval(S.spawnID);

  S.timerID = setInterval(() => {
    if (!S.running || S.paused) return;
    S.timeLeft -= 1;
    updateHUD();
    if (S.timeLeft <= 0) endGame();
  }, 1000);

  S.spawnID = setInterval(() => {
    if (S.running && !S.paused) spawnTarget();
  }, CFG.spawnMs);
}

function spawnInitial() {
  for (let i = 0; i < CFG.initTargets; i++) spawnTarget();
}

function spawnTarget() {
  if (el.board.querySelectorAll(".tgt").length >= CFG.maxTargets) return;

  const img = document.createElement("img");
  img.className = "tgt";
  img.src = `Sprites/${S.target}.png`;
  img.alt = "";

  const maxX = el.board.clientWidth - 68;
  const maxY = el.board.clientHeight - 68;

  img.style.left = `${Math.random() * maxX}px`;
  img.style.top = `${Math.random() * maxY}px`;

  img.addEventListener("click", (e) => {
    e.stopPropagation();
    hitTarget(img);
  });

  el.board.appendChild(img);
}

function removeTarget(img) {
  const fx = document.createElement("div");
  fx.className = "boomfx";
  fx.style.left = img.style.left;
  fx.style.top = img.style.top;
  el.board.appendChild(fx);

  img.classList.add("boom");

  setTimeout(() => fx.remove(), 350);
  setTimeout(() => img.remove(), 240);
}

function hitTarget(img) {
  if (!S.running || S.paused || S.counting) return;

  const pts = CFG.points[S.target] || 0;
  S.score += pts;
  S.shots.push({ hit: true, pts, time: Date.now() });

  removeTarget(img);
  updateHUD();
  renderShots();
}

function miss() {
  S.timeLeft = Math.max(0, S.timeLeft - CFG.missPenalty);
  S.shots.push({ hit: false, pts: 0, time: Date.now() });

  updateHUD();
  renderShots();

  if (S.timeLeft <= 0) endGame();
}

function setGunImage() {
  const src = `Sprites/${CFG.guns[S.gunIdx]}.png`;
  el.gun.src = src;
  el.sideGun.src = src;
}

function switchGun() {
  S.gunIdx = (S.gunIdx + 1) % CFG.guns.length;
  setGunImage();

  el.gun.classList.remove("swap");
  void el.gun.offsetWidth;
  el.gun.classList.add("swap");

  setTimeout(() => el.gun.classList.remove("swap"), 220);
}

function togglePause() {
  if (S.paused) {
    resumeGame();
  } else {
    pauseGame();
  }
}

function pauseGame() {
  S.paused = true;
  clearTimers();
  showOverlay("pause");
}

function resumeGame() {
  S.counting = true;
  showOverlay("countdown");
  runCountdown(() => {
    S.paused = false;
    S.counting = false;
    hideOverlays();
    setGameUI(true);
    startLoops();
  });
}

function renderShots() {
  const list = [...S.shots];

  if (S.shotSort === "score") {
    list.sort((a, b) => b.hit - a.hit || b.pts - a.pts);
  } else {
    list.reverse();
  }

  el.shotLog.innerHTML = list.length
    ? list
        .map(
          (s, i) => `
          <div class="row ${s.hit ? "hit" : "miss"}">
            <span>#${i + 1} ${s.hit ? "Hit" : "Miss"}</span>
            <span>${s.hit ? "+" + s.pts : "-" + CFG.missPenalty + "s"}</span>
          </div>`,
        )
        .join("")
    : '<div class="row"><span>Belum ada tembakan</span><span>-</span></div>';
}

function endGame() {
  if (!S.running) return;

  S.running = false;
  S.paused = false;
  S.counting = false;

  clearTimers();
  clearTargets();
  setGameUI(false);

  el.goName.textContent = S.name;
  el.goScore.textContent = S.score;

  showOverlay("gameover");
}

function saveScore() {
  const data = JSON.parse(localStorage.getItem(CFG.storageKey) || "[]");

  data.push({
    name: S.name,
    score: S.score,
    level: S.level,
    gun: CFG.guns[S.gunIdx],
    target: S.target,
    date: new Date().toLocaleString(),
  });

  localStorage.setItem(CFG.storageKey, JSON.stringify(data));
  alert("Skor berhasil disimpan!");
}

function showHistory(mode = "last") {
  const data = JSON.parse(localStorage.getItem(CFG.storageKey) || "[]");

  const list =
    mode === "score" ? [...data].sort((a, b) => b.score - a.score) : [...data].reverse();

  el.historyBody.innerHTML = list.length
    ? list
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
          </tr>`,
        )
        .join("")
    : '<tr><td colspan="7">Belum ada riwayat</td></tr>';

  showOverlay("history");
}

function restart() {
  clearTimers();
  clearTargets();

  Object.assign(S, {
    name: "",
    level: "easy",
    gunIdx: 0,
    target: "target1",
    score: 0,
    timeLeft: 0,
    running: false,
    paused: false,
    counting: false,
    shots: [],
    shotSort: "last",
  });

  el.playerName.value = "";
  el.level.value = "easy";
  document.querySelector('input[name="gun"][value="gun1"]').checked = true;
  document.querySelector('input[name="target"][value="target1"]').checked = true;
  el.btnPlay.disabled = true;

  renderShots();
  updateHUD();
  setGameUI(false);
  showOverlay("welcome");
}