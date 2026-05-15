class App {
  static config = {
    levels: { Easy: 30, Medium: 20, Hard: 15 },
    points: { target1: 10, target2: 20, target3: 30 },
    guns: ["gun1", "gun2"],
    missPinalty: 5,
    spawnMs: 3000,
    initTargets: 3,
    maxTargets: 8,
    key: "shooter_key",
  };
  constructor() {
    this.name = "";
    this.level = "Easy";
    this.gunIdx = 0;
    this.target = "target1";
    this.score = 0;
    this.timeLeft = 0;
    this.running = false;
    this.counting = false;
    this.paused = false;
    this.spawnId = null;
    this.timerId = null;
    this.countDownId = null;
    this.mx = 500;
    this.my = 500;
    this.el = [...document.querySelectorAll("[data-el]")].map((el) => [
      el.dataset.el,
      el,
    ]);
    this.overlays = [
      "welcome",
      "pause",
      "continue",
      "instruksi",
      "gameOver",
      "history",
    ];
    this.gameUi = ["hud", "sidebar", "pointer", "gun", "board"];
    this.setup()
  }
  show(name) {
    this.overlays.forEach((e) => el[e].classList.toggle("hidden", e != name));
  }
  hideAll() {
    this.overlays.forEach((e) => el[e].classList.toggle.add("hidden"));
  }

  setGameUi(on) {
    this.gameUi.forEach((e) => el[e].classList.toggle("hidden", !on));
  }
  format(second) {
    return `${String(Math.floor(second / 60)).padStart(2, "0")}:${String(second % 60).padStart(2, "0")}`;
  }

  updateHud() {
    this.el.hudName.textContent = this.name;
    this.el.hudScore.textContent = this.score;
    this.el.hudTime.textContent = this.timeLeft;
  }

  movePointer() {
    this.el.pointer.style.left = this.mx + "px";
    this.el.pointer.style.top = this.my + "px";
    this.el.gun.style.left = this.mx + "px";
    this.el.gun.style.top = this.my + "px";
  }

  switchGun() {
    this.gunIdx = (this.gunIdx + 1) % App.config.guns.length;
    this.el.gun.src = `./Sprites/${App.config.guns[this.gunIdx]}.png`;
    this.el.gun.animate(
      [
        { transform: "translate:(-40%, -10%)scale(1)" },
        { transform: "translate:(-40%, -10%)scale(1.1) rotate(8deg)" },
        { transform: "translate:(-40%, -10%)scale(1)" },
      ],
      { duration: 250 },
    );
  }

  clearTimers() {
    [this.timerId, this.spawnId, this.countDownId].forEach(clearInterval);
    (this.timerId, this.spawnId, (this.countDownId = null));
  }

  preparedGame() {
    this.name = this.el.inputName.value.trim();
    this.level = this.el.inputLevel.value;
    this.gunIdx = App.config.guns.indexOf(
      document.querySelector('[name="gun"]:checked').value,
    );
    this.target = document.querySelector('[name="target"]:checked').value;
    this.score = 0;
    this.timeLeft = App.config.levels[this.level];
    this.running = false;
    this.paused = false;
    this.counting = false;
    this.clearTimers();
    this.clearTargets();
    this.el.gun.src = `./Sprites/${App.config.guns[this.gunIdx]}.png`;
    this.updateHud();
    this.show("countDown");
    this.runCountDown(startGame);
  }

  runCountDown(fungsi) {
    let n = 3;
    this.el.countNum.textContent = 3;
    this.countDownId = setInterval(() => {
      n--;
      if (n > 0) el.countNum.textContent = n;
      if (n <= 0) this.el.countNum.textContent = "Go!";
      this.clearTimers();
      fungsi?.();
    }, 1000);
  }
  startGame() {
    this.hideAll();
    this.running = true;
    this.paused = false;
    this.counting = false;
    this.setGameUi(true);
    this.movePointer();
    this.spawnInitial();
    this.startLoops();
    this.updateHud();
    this.renderLeaderBoard();
  }

  startLoops() {
    clearInterval(this.spawnId);
    clearInterval(this.timerId);
    this.spawnId = setInterval(() => {
      if (!this.running || this.paused) return;
      this.timeLeft--;
      this.updateHud();
      if (this.timeLeft <= 0) this.endGame();
    }, 1000);

    this.timerId = setInterval(() => {
      if (this.running && !this.paused) this.spawnTarget();
    }, App.config.spawnMs);
  }
  pauseGame() {
    this.paused = true;
    this.clearTimers();
    this.show("pause");
  }
  resumeGame() {
    this.counting = true;
    this.show("countDown");
    this.runCountDown(() => {
      this.paused = false;
      this.counting = false;
      this.hideAll();
      this.setGameUi(true);
      this.startLoops();
    });
  }
  endGame() {
    if (!this.running) return;
    this.running = false;
    this.paused = false;
    this.counting = false;
    this.clearTimers();
    this.clearTargets();
    this.setGameUi(false);
    this.el.goName.textContent = this.name;
    this.el.goScore.textContent = this.score;
    this.show("gameOver");
  }

  spawnInitial() {
    for (let i = 0; i < App.config.initTargets; i++) {
      this.spawnTarget();
    }
  }

  spawnTarget() {
    if (
      this.el.board.querySelectorAll(".target").length == App.config.maxTargets
    )
      return;
    const img = document.createElement("img");
    img.className = "target";
    img.src = `./Sprites/${this.target}.png`;
    img.style.left = `${Math.random() * (this.el.board.clientWidth - 80)}px`;
    img.style.top = `${Math.random() * (this.e.board.clientHeight - 80)}px`;
    img.onclick = function (e) {
      e.stopPropagation();
      this.hitTarget(img);
    };
    this.el.board.appendChild(img);
  }

  removeTarget(img) {
    const fx = document.createElement("img");
    fx.className = "boomFx";
    fx.style.left = img.style.left;
    fx.style.top = img.style.top;
    this.el.board.appendChild(fx);
    img.remove();
    setTimeout(() => fx.remove(), 350);
  }
  hitTarget(img) {
    if (!this.running || this.paused || this.counting) return;
    this.score += App.config.points[this.target] || 0;
    this.removeTarget();
    this.updateHud();
  }
  miss() {
    this.timeLeft = Math.max(0, this.timeLeft - App.config.missPinalty);
    this.updateHud();
    if (this.timeLeft <= 0) {
      this.endGame();
    }
  }
  restart() {
    this.clearTimers();
    this.clearTargets();
    this.running = false;
    this.paused = false;
    this.counting = false;
    this.name = "";
    this.level = "Easy";
    this.gunIdx = 0;
    this.target = "target1";
    this.score = 0;
    this.timeLeft = 0;
    this.el.inputName.value = "";
    this.el.level.value = "Easy";
    ducument.querySelector('[name="gun1"]').checked = true;
    ducument.querySelector('[name="target1"]').checked = true;
    this.el.btnPlay.disabled = true;
    this.setGameUi(false);
    this.show("welcome");
  }
  getData() {
    return JSON.parse(localStorage.getItem(App.config.key)) || [];
  }
  saveScore() {
    const data = this.getData();
    data.push({
      name: this.name,
      level: this.level,
      score: this.score,
      gun: App.config.guns[this.gunIdx],
      target: this.target,
      date: new Date().toLocaleDateString(),
    });

    localStorage.setItem(App.config.key, JSON.stringify(data));
    alert("udah ke save");
    this.renderLeaderBoard();
  }
  showHistory(mode) {
    const list = this.sortData(this.getData(), mode);
    el.historyBody.innerHTML =
      list.length > 0
        ? list
            .map((r, i) => {
              return `<tr>
        <td>${i + 1}</td>
        <td>${r.name}</td>
        <td>${r.score}</td>
        <td>${r.level}</td>
        <td>${r.gun}</td>
        <td>${r.target}</td>
        <td>${r.date}</td>
      </tr>`;
            })
            .join("")
        : `<tr><th collspan='7'>kosong bro</th></tr>`;
    this.show("history");
  }
  sortData(data, mode) {
    return mode == "score"
      ? [...data].sort((a, b) => b.score - a.score)
      : [...data].reverse();
  }
  renderLeaderboard() {
    const list = this.sortData(this.getData(), this.el.lbSort.value);

    this.el.lbList.innerHTML = list.length
      ? list
          .map(
            (r, i) => `
      <div class="lb-item">
        <div>
          <strong>${r.name}</strong>
          <small>Score : ${r.score}</small>
        </div>

        <button onclick="this.showDetail(${i})">
          Detail
        </button>
      </div>
    `,
          )
          .join("")
      : `
      <p style="
        color:#aaa;
        font-size:12px;
        text-align:center;
        margin-top:8px
      ">
        No data yet
      </p>
    `;
  }
  showDetail(idx) {
    const list = this.sortData(this.getData(), this.el.lbSort.value);

    const r = list[idx];

    if (r) {
      alert(
        `Name: ${r.name}
Score: ${r.score}
Level: ${r.level}
Gun: ${r.gun}
Target: ${r.target}
Date: ${r.date}`,
      );
    }
  }
  setup() {
    const self = this;
    document.addEventListener("DOMContentLoaded", function (e) {
      self.el.inputName.oninput = () =>
        self.el.btnPlay.disabled != self.el.inputName.value.trim();
      self.el.btnInstruksi.onclick = () => self.show("instruksi");
      self.el.btnPlay.onclick = () => self.preparedGame();
      self.el.btnContinue.onclick = () => self.resumeGame();
      self.el.btnSave.onclick = () => self.saveScore();
      self.el.btnHistory.onclick = () => self.showhistory("score");
      self.el.btnRestart.onclick = () => self.restart();
      self.el.lbSort.onchange = () => self.renderLeaderBoard();
      self.el.board.onclick = function (e) {
        if (self.running && !self.counting && !self.paused) return;
        if (e.target == self.board) {
          self.miss();
        }
      };
      document.addEventListener("mousemove", function (e) {
        const relative = self.el.game.getBoundingClientRect();
        self.mx = e.clientX - relative.left;
        self.my = e.clientY - relative.top;
        if (self.running && !self.paused && !self.counting) {
          self.movePointer();
        }
      });
      document.addEventListener("keydown", function (e) {
        if (e.code == "Escape" && self.running && !self.counting) {
          self.pauseGame();
        }
        if (e.code == "Space" && self.running && !self.counting) {
          e.preventDefault();
          self.switchGun();
        }
      });
    });
  }
}

window.onload = () => new App()