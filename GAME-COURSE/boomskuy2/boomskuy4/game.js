// ===== STATE =====
var gameStats = { player: null, time: 0, life: 3, walls: 0, tnt: 0, freeze: 0 };
var isPaused = false;
var statsListener = null;
var gameContainer = null;
var gameObjects = [];

var gameMap = [
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

// ===== GAME CONTROL =====
function initGame(container) {
  gameContainer = container;
  window.addEventListener("resize", render);
}

function setStats(key, val) {
  gameStats[key] = val;
  if (statsListener) statsListener();
}

function incStats(key) {
  gameStats[key]++;
  if (statsListener) statsListener();
}
function decStats(key) {
  gameStats[key]--;
  if (statsListener) statsListener();
}

function attach(obj) {
  if (!gameContainer) throw new Error("gameContainer not set!");
  for (var i = 0; i < gameObjects.length; i++) {
    if (gameObjects[i] === null) {
      gameObjects[i] = obj;
      gameContainer.appendChild(obj.element);
      return i + 1;
    }
  }
  gameObjects.push(obj);
  gameContainer.appendChild(obj.element);
  return gameObjects.length;
}

function detach(label) {
  var obj = gameObjects[label - 1];
  if (!obj) return;
  if (obj.solid && obj.position) gameMap[obj.position[1]][obj.position[0]] = 0;
  if (obj.element && gameContainer.contains(obj.element))
    gameContainer.removeChild(obj.element);
  gameObjects[label - 1] = null;
}

function getObject(label) {
  return gameObjects[label - 1];
}

function getObjectAt(x, y) {
  var label = gameMap[y][x];
  return label > 0 ? getObject(label) : null;
}

function render() {
  if (!gameContainer) return;
  var stepX = gameContainer.clientWidth / 11;
  var stepY = gameContainer.clientHeight / 9;
  for (var i = 0; i < gameObjects.length; i++) {
    var obj = gameObjects[i];
    if (!obj || !obj.position) continue;
    var el = obj.element;
    el.style.left =
      obj.position[0] * stepX + (stepX - el.clientWidth) / 2 + "px";
    el.style.top =
      obj.position[1] * stepY + (stepY - el.clientHeight) / 2 + "px";
  }
}

// ===== GAME OBJECTS =====
function GameObject() {
  this.element = document.createElement("img");
  this.element.onload = render;
  this.label = attach(this);
  this.position = null;
  this.solid = false;
}

GameObject.prototype.setPosition = function (x, y) {
  if (this.solid) {
    if (gameMap[y][x] !== 0) return;
    if (this.position) gameMap[this.position[1]][this.position[0]] = 0;
    gameMap[y][x] = this.label;
  }
  this.position = [x, y];
  render();
};

GameObject.prototype.getPosition = function () {
  if (!this.position) throw new Error("Position not set!");
  return this.position;
};

GameObject.prototype.destroy = function () {
  detach(this.label);
};

// ---- Player ----
function Player() {
  GameObject.call(this);
  this.solid = true;
  this.dir = "down";
  this.canMove = true;
  this.canPlace = true;
  this.element.src = "assets/char_down.png";

  var self = this;
  document.addEventListener("keydown", function (e) {
    if (isPaused || !self.canMove) return;
    var k = e.key.toLowerCase();
    if (k === "w" || e.key === "ArrowUp") self._move(0, -1);
    if (k === "s" || e.key === "ArrowDown") self._move(0, 1);
    if (k === "a" || e.key === "ArrowLeft") self._move(-1, 0);
    if (k === "d" || e.key === "ArrowRight") self._move(1, 0);
  });

  document.addEventListener("keydown", function (e) {
    if (isPaused) return;
    if (e.key === " ") self.placeBomb();
  });
}

Player.prototype = Object.create(GameObject.prototype);
Player.prototype.constructor = Player;

Player.prototype._move = function (dx, dy) {
  var dirs = { "-1,0": "left", "1,0": "right", "0,1": "down", "0,-1": "up" };
  var key = dx + "," + dy;
  var newDir = dirs[key];
  if (this.dir !== newDir) {
    this.dir = newDir;
    this.element.src = "assets/char_" + newDir + ".png";
  } else {
    this.setPosition(this.position[0] + dx, this.position[1] + dy);
  }
};

Player.prototype.placeBomb = function () {
  if (!this.canPlace) return;
  var x = this.position[0],
    y = this.position[1];
  var offsets = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] };
  var off = offsets[this.dir];
  x += off[0];
  y += off[1];
  if (gameMap[y][x] !== 0) return;
  new Bomb(x, y);
  this.canPlace = false;
  var self = this;
  setTimeout(function () {
    self.canPlace = true;
  }, 2000);
};

Player.prototype.setPosition = function (x, y) {
  for (var i = 0; i < gameObjects.length; i++) {
    var obj = gameObjects[i];
    if (obj && obj.position && obj.position[0] === x && obj.position[1] === y) {
      if (obj instanceof Item) {
        obj.pick(this);
        break;
      }
    }
  }
  GameObject.prototype.setPosition.call(this, x, y);
};

// ---- Bomb ----
function Bomb(x, y) {
  GameObject.call(this);
  this.solid = true;
  this.element.src = "assets/bomb.png";
  this.setPosition(x, y);

  var self = this;
  var explodeAt = Date.now() + 1500 + 200 * gameStats.tnt;
  var interval = setInterval(function () {
    if (isPaused) return;
    if (Date.now() >= explodeAt) {
      clearInterval(interval);
      self.explode();
    }
  }, 100);
}

Bomb.prototype = Object.create(GameObject.prototype);
Bomb.prototype.constructor = Bomb;

Bomb.prototype.explode = function () {
  var x = this.position[0],
    y = this.position[1];
  new Explosion().setPosition(x, y);
  var dirs = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  var range = gameStats.tnt + 1;
  for (var d = 0; d < dirs.length; d++) {
    for (var i = 1; i <= range; i++) {
      var tx = x + dirs[d][0] * i;
      var ty = y + dirs[d][1] * i;
      if (tx < 0 || tx >= gameMap[0].length || ty < 0 || ty >= gameMap.length)
        break;
      var cell = gameMap[ty][tx];
      if (cell === this.label) continue;
      if (cell >= 0) new Explosion().setPosition(tx, ty);
      if (cell !== 0) break;
    }
  }
};

// ---- Explosion ----
function Explosion() {
  GameObject.call(this);
  this.element.style.zIndex = "99";
  this.element.src = "assets/explosion.png";
}

Explosion.prototype = Object.create(GameObject.prototype);
Explosion.prototype.constructor = Explosion;

Explosion.prototype.setPosition = function (x, y) {
  for (var i = 0; i < gameObjects.length; i++) {
    var obj = gameObjects[i];
    if (obj && obj.position && obj.position[0] === x && obj.position[1] === y) {
      if (obj instanceof Player) decStats("life");
      else if (!(obj instanceof Dog)) obj.destroy();
    }
  }
  GameObject.prototype.setPosition.call(this, x, y);
  var self = this;
  setTimeout(function () {
    self.destroy();
  }, 1000);
};

// ---- Brick ----
function Brick() {
  GameObject.call(this);
  this.solid = true;
  this.element.src = "assets/wall.png";
}

Brick.prototype = Object.create(GameObject.prototype);
Brick.prototype.constructor = Brick;

Brick.prototype.destroy = function () {
  var px = this.position[0],
    py = this.position[1];
  GameObject.prototype.destroy.call(this);
  incStats("walls");
  var r = Math.floor(Math.random() * 3);
  var items = [TNT, BrokenHeart, IceCube];
  new items[r]().setPosition(px, py);
};

// ---- Dog ----
function Dog(player) {
  GameObject.call(this);
  this.solid = true;
  this.element.src = "assets/dog_down.png";
  this.player = player;
  this.chaseInterval = null;
}

Dog.prototype = Object.create(GameObject.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.startChasing = function () {
  if (this.chaseInterval) return;
  var self = this;
  var lastMove = 0;
  this.chaseInterval = setInterval(function () {
    if (isPaused) return;
    var now = Date.now();
    var speed = Math.max(200, 1000 - 35 * gameStats.walls);
    if (now - lastMove < speed) return;
    lastMove = now;

    var map = mapCopy();
    // Clear dog and player positions so A* can traverse them
    map[self.position[1]][self.position[0]] = 0;
    map[self.player.position[1]][self.player.position[0]] = 0;

    var path = astar(self.position, self.player.position, map);
    if (!path || path.length < 2) return;
    var next = path[1];
    self._setDir(self.position, next);
    self.setPosition(next[0], next[1]);
    if (
      next[0] === self.player.position[0] &&
      next[1] === self.player.position[1]
    ) {
      decStats("life");
    }
  }, 100);
};

Dog.prototype._setDir = function (from, to) {
  var dx = to[0] - from[0],
    dy = to[1] - from[1];
  var dir = dx > 0 ? "right" : dx < 0 ? "left" : dy > 0 ? "down" : "up";
  this.element.src = "assets/dog_" + dir + ".png";
};

Dog.prototype.destroy = function () {
  if (this.chaseInterval) clearInterval(this.chaseInterval);
  this.chaseInterval = null;
  GameObject.prototype.destroy.call(this);
};

function mapCopy() {
  return gameMap.map(function (row) {
    return row.slice();
  });
}

// ---- Items ----
function Item() {
  GameObject.call(this);
  this.element.className = "item";
  this.solid = false;
}
Item.prototype = Object.create(GameObject.prototype);
Item.prototype.constructor = Item;
Item.prototype.pick = function () {
  this.element.classList.add("taken");
  var self = this;
  setTimeout(function () {
    self.destroy();
  }, 500);
};

function TNT() {
  Item.call(this);
  this.element.src = "assets/tnt.png";
}
TNT.prototype = Object.create(Item.prototype);
TNT.prototype.constructor = TNT;
TNT.prototype.pick = function () {
  Item.prototype.pick.call(this);
  incStats("tnt");
};

function BrokenHeart() {
  Item.call(this);
  this.element.src = "assets/heart.png";
}
BrokenHeart.prototype = Object.create(Item.prototype);
BrokenHeart.prototype.constructor = BrokenHeart;
BrokenHeart.prototype.pick = function () {
  Item.prototype.pick.call(this);
  decStats("life");
};

function IceCube() {
  Item.call(this);
  this.element.src = "assets/ice.png";
}
IceCube.prototype = Object.create(Item.prototype);
IceCube.prototype.constructor = IceCube;
IceCube.prototype.pick = function (player) {
  Item.prototype.pick.call(this);
  incStats("freeze");
  player.element.style.filter =
    "sepia(1) hue-rotate(180deg) saturate(4) brightness(0.95) contrast(1.1)";
  player.canMove = false;
  setTimeout(function () {
    player.element.style.filter = "";
    player.canMove = true;
  }, 1000);
};

// ===== A* PATHFINDING =====
function astar(start, goal, grid) {
  function h(a, b) {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
  }

  function neighbors(pos) {
    var result = [],
      dirs = [
        [0, -1],
        [0, 1],
        [-1, 0],
        [1, 0],
      ];
    for (var i = 0; i < dirs.length; i++) {
      var nx = pos[0] + dirs[i][0],
        ny = pos[1] + dirs[i][1];
      if (
        ny >= 0 &&
        ny < grid.length &&
        nx >= 0 &&
        nx < grid[0].length &&
        grid[ny][nx] === 0
      )
        result.push([nx, ny]);
    }
    return result;
  }

  var open = [{ pos: start, g: 0, f: h(start, goal), parent: null }];
  var closed = {};
  var gMap = {};
  gMap[start.toString()] = 0;

  while (open.length) {
    open.sort(function (a, b) {
      return a.f - b.f;
    });
    var cur = open.shift();
    if (cur.pos[0] === goal[0] && cur.pos[1] === goal[1]) {
      var path = [];
      while (cur) {
        path.unshift(cur.pos);
        cur = cur.parent;
      }
      return path;
    }
    var ck = cur.pos.toString();
    if (closed[ck]) continue;
    closed[ck] = true;
    var nbs = neighbors(cur.pos);
    for (var i = 0; i < nbs.length; i++) {
      var nk = nbs[i].toString();
      if (closed[nk]) continue;
      var ng = cur.g + 1;
      if (gMap[nk] === undefined || ng < gMap[nk]) {
        gMap[nk] = ng;
        open.push({ pos: nbs[i], g: ng, f: ng + h(nbs[i], goal), parent: cur });
      }
    }
  }
  return null;
}

// ===== UTILS =====
function inRadius(a, b, r) {
  r = r === undefined ? 1 : r;
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) <= r;
}

function randomPos() {
  return [Math.round(Math.random() * 8) + 1, Math.round(Math.random() * 6) + 1];
}

function validPos(playerPos) {
  var pos;
  do {
    pos = randomPos();
  } while (gameMap[pos[1]][pos[0]] !== 0 || inRadius(playerPos, pos, 2));
  return pos;
}
