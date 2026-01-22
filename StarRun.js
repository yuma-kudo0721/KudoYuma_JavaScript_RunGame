var canvas, g;
var player, enemy, particles, moon, castle;
var score;
var scene;
var frameCount;
var bound;
var next;

// シーンの定義
const Scenes = {
  GameMain: "GameMain",
  GameOver: "GameOver",
};

onload = function () {
  // 描画コンテキストの取得
  canvas = document.getElementById("gamecanvas");
  g = canvas.getContext("2d");
  // 初期化
  init();
  // 入力処理の指定
  document.onkeydown = keydown;
  document.onkeyup = keyup;
  document.onmousedown = keydown;
  document.onmouseup = keyup;
  // ゲームループの設定 60FPS
  setInterval("gameloop()", 16);
};

var stars = [];
var items = [];

function init() {
  // 自キャラ初期化
  player = new Player(100, 400, 16, "./player.png", 0, 0);

  // 敵キャラ初期化
  enemy = [];
  next = 10;

  // 月
  moon = new Sprite();
  moon.posx = 100;
  moon.posy = 100;
  moon.image = new Image();
  moon.image.src = "./moon.png";

  // 城
  castle = new Sprite();
  castle.posx = 400;
  castle.posy = 296;
  castle.image = new Image();
  castle.image.src = "./supereye.png";

  // パーティクル初期化
  particles = [];


  score = 0;
  frameCount = 0;
  bound = false;
  scene = Scenes.GameMain;

  stars = [];
  for (var i = 0; i < 100; i++) { // 100個の星を生成
    var star = new Star(Math.random() * 480, Math.random() * 120);
    stars.push(star);
  }

  items = [];
}



var isKeyDown = false;
function keydown(e) {
  // ゲームプレイ中
  if (scene == Scenes.GameMain) {
    if (player.speed == 0 && !isKeyDown) {
      player.speed = -18;
      player.acceleration = 1.0;
    }
    // ゲームオーバー中
  } else if (scene == Scenes.GameOver) {
    if (frameCount > 60) {
      init();
    }
  }
  isKeyDown = true;
}
function keyup(e) {
  if (player.speed < 0) {
    player.acceleration = 2.5;
  }
  isKeyDown = false;
}

function gameloop() {
  update();
  draw();
}

function update() {
  // ゲームプレイ中
  if (scene == Scenes.GameMain) {
    // 自キャラの状態更新
    player.update();

    // 敵キャラの状態更新
    enemy.forEach((e) => {
      e.update();
      // 端に到達でスコア増加
      if (e.posx < -100) {
        score += 100;
      }
    });

    // アイテムの状態更新
    items.forEach((item) => {
      item.update();
    });


    // 端に到達した敵キャラを除外
    enemy = enemy.filter((e) => e.posx >= -100);
    // 画面外のアイテムを削除
    items = items.filter((item) => item.posx >= -100);

    // ランダムにアイテムを生成（1%の確率）
    if (Math.random() < 0.005) {
      generateItem();
    }



    // 敵キャラ生成
    if (frameCount == next) {
      generateNextEnemy();
    }

    // 当たり判定
    hitCheck();

    // ゲームオーバー中
  } else if (scene == Scenes.GameOver) {
    // パーティクルの状態更新
    particles.forEach((p) => {
      p.update();
    });

    // 敵キャラの状態更新
    enemy.forEach((e) => {
      e.update();
    });
  }

  // 背景の城の位置を動かす
  castle.posx -= 0.25;
  if (castle.posx < -100) castle.posx = 560;

  // 現在何フレーム目かをカウント
  frameCount++;
}

function draw() {
  g.imageSmoothingEnabled = false;

  // ゲームプレイ中
  if (scene == Scenes.GameMain) {
    // 画面を黒く塗りつぶして初期化する
    g.fillStyle = "rgb(0,0,0)";
    g.fillRect(0, 0, 480, 480);

    // 星の描画
    stars.forEach((star) => {
      star.draw(g);
    });

    // 背景描画
    drawBack(g);

    //キャラクタ描画;
    player.draw(g);

    // 敵キャラクタ描画
    enemy.forEach((e) => {
      e.draw(g);
    });

    // アイテムの描画
    items.forEach((item) => {
      item.draw(g);
    });


    // スコア描画
    drawScore(g);

    // ゲームオーバー中
  } else if (scene == Scenes.GameOver) {
    g.fillStyle = "rgb(0,0,0)";
    g.fillRect(0, 0, 480, 480);

    // 星の描画
    stars.forEach((star) => {
      star.draw(g);
    });

    // 背景描画
    drawBack(g);

    //パーティクル描画
    particles.forEach((p) => {
      p.draw(g);
    });

    // 敵キャラクタ描画
    enemy.forEach((e) => {
      e.draw(g);
    });

    // スコア描画
    drawScore(g);

    // ゲームオーバー表示
    drawGameOver(g);
  }
}

// 当たり判定
function hitCheck() {
  enemy.forEach((e) => {
    var diffX = player.posx - e.posx;
    var diffY = player.posy - e.posy;
    var distance = Math.sqrt(diffX * diffX + diffY * diffY);
    if (distance < player.r + e.r) {
      // 当たったときの処理
      scene = Scenes.GameOver;
      frameCount = 0;

      castle.image.src = "./supereyesmile.png";

      // パーティクル生成
      for (var i = 0; i < 300; i++) {
        particles.push(new Particle(player.posx, player.posy));
      }
    }
  });

  items.forEach((item, index) => {
    var diffX = player.posx - item.posx;
    var diffY = player.posy - item.posy;
    var distance = Math.sqrt(diffX * diffX + diffY * diffY);
    if (distance < player.r + item.r) {
      // アイテムを取得
      score += 100;
      items.splice(index, 1);
    }
  });

}

// 敵キャラ生成
function generateNextEnemy() {
  let baseSpeed = 2;
  let speedIncrease = Math.floor(score / 500);
  let speedResult = baseSpeed + (speedIncrease * 0.5);

  let generateEnemy = 30;
  let generateIncrease = Math.floor(score / 250);
  let generateResult = generateEnemy + (generateIncrease * 0.5);

  var newEnemy = new Enemy(
    600,
    400 - (Math.random() < 0.5 ? 0 : 50),
    8,
    "./darkstar.png",
    speedResult + 10 * Math.random(),
    0
  );
  enemy.push(newEnemy);
  next = Math.floor(frameCount + generateResult + 100 * Math.random());
}

function generateItem() {
  var newItem = new Item(
    600,                    // x座標
    300 + Math.random() * 100,  // y座標（ランダム）
    12,                     // 半径
    "./item.png",           // アイテムの画像
    3                       // 速度
  );
  items.push(newItem);
}

// 背景の描画
function drawBack(g) {
  var interval = 16;
  var ratio = 5;
  var center = 240;
  var baseLine = 360;
  // 月と城を描画する
  moon.draw(g);
  castle.draw(g);
  // 地面のラインアート
  for (var i = 0; i < 480 / interval + 1; i++) {
    var x1 = i * interval - (frameCount % interval);
    var x2 = center + (x1 - center) * ratio;
    g.strokeStyle = "#98660b";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(x1, baseLine);
    g.lineTo(x2, 480);
    g.stroke();
  }
}

// スコア描画
function drawScore(g) {
  g.fillStyle = "rgb(255,255,255)";
  g.font = "16pt Arial";
  var scoreLabel = "SCORE : " + score;
  var scoreLabelWidth = g.measureText(scoreLabel).width;
  g.fillText(scoreLabel, 460 - scoreLabelWidth, 40);
}

// ゲームオーバー表示
function drawGameOver(g) {
  g.font = "bold 48pt Arial";
  var scoreLabel = "GAME OVER";
  var scoreLabelWidth = g.measureText(scoreLabel).width;
  g.fillStyle = "rgb(255,255,255)";
  g.fillText(scoreLabel, 240 - scoreLabelWidth / 2, 220);
}

// 親クラス
class Sprite {
  image = null;
  posx = 0;
  posy = 0;
  speed = 0;
  acceleration = 0;
  r = 0;

  constructor() { }

  update() { }

  draw(g) {
    g.drawImage(
      this.image,
      this.posx - this.image.width / 2,
      this.posy - this.image.height / 2
    );
  }
}

// 子クラス
class Player extends Sprite {
  baseLine = 400;

  constructor(posx, posy, r, imageUrl, speed, acceleration) {
    super();
    this.posx = posx;
    this.posy = posy;
    this.r = r;
    this.image = new Image();
    this.image.src = imageUrl;
    this.speed = speed;
    this.acceleration = acceleration;
  }

  update() {
    // 自キャラの状態更新
    this.speed = this.speed + this.acceleration;
    this.posy = this.posy + this.speed;
    if (this.posy > this.baseLine) {
      this.posy = this.baseLine;
      this.speed = 0;
      this.acceleration = 0;
    }
  }
}

// エネミークラス
class Enemy extends Sprite {
  constructor(posx, posy, r, imageUrl, speed, acceleration) {
    super();
    this.posx = posx;
    this.posy = posy;
    this.r = r;
    this.image = new Image();
    this.image.src = imageUrl;
    this.speed = speed;
    this.acceleration = acceleration;
  }

  update() {
    // 敵キャラの状態更新
    this.posx -= this.speed;
  }
}

class Item extends Sprite {
  constructor(posx, posy, r, imageUrl, speed) {
    super();
    this.posx = posx;
    this.posy = posy;
    this.r = r;
    this.image = new Image();
    this.image.src = imageUrl;
    this.speed = speed;
  }

  update() {
    // アイテムを左に移動
    this.posx -= this.speed;
  }
}




// パーティクルクラス
class Particle extends Sprite {
  baseLine = 0;
  speedy = 0;
  speedx = 0;

  constructor(x, y) {
    super();
    this.posx = x;
    this.posy = y;
    this.baseLine = 420;
    this.acceleration = 0.5;
    var angle = (Math.PI * 5) / 4 + (Math.PI / 2) * Math.random();
    this.speed = 5 + Math.random() * 20;
    this.speedx = this.speed * Math.cos(angle);
    this.speedy = this.speed * Math.sin(angle);
    this.r = 2;
  }

  update() {
    this.speedx *= 0.97;
    this.speedy += this.acceleration;
    this.posx += this.speedx - 2;
    this.posy += this.speedy;
    if (this.posy > this.baseLine) {
      this.posy = this.baseLine;
      this.speedy = this.speedy * -1 * (Math.random() * 0.5 + 0.3);
    }
  }

  draw(g) {
    g.fillStyle = "rgb(255,255,0)";
    g.fillRect(this.posx - this.r, this.posy - this.r, this.r * 2, this.r * 2);
  }
}

// 星クラス
class Star extends Sprite {
  constructor(posx, posy) {
    super();
    this.posx = posx;
    this.posy = posy;
    this.r = 1 + 2 * Math.random(); // ランダムなサイズ
  }

  draw(g) {
    g.fillStyle = "rgb(255,255,255)"; // 星の色を白に設定
    g.beginPath();
    g.arc(this.posx, this.posy, this.r, 0, Math.PI * 2);
    g.fill();
  }
}
