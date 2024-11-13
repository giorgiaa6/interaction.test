let font;
let tSize = 250; // size of text
let tposX = 250; // X position of text
let tposY = 500; // Y position of text
let pointCount = 0.3; // 0-1 number of particles

let speed = 40;
let comebackSpeed = 150;
let dia = 100;
let randomPos = true;
let pointsDirection = "left";
let interactionDirection = 1;

let words = ["hello", "bye"]; // Array of words to loop through
let currentWordIndex = 0;
let textPoints = [];
let clicked = false;
let particleReady = false; // Tracks if particles should fall

function preload() {
  font = loadFont("AvenirNextLTPro-Demi.otf");
}

function setup() {
  createCanvas(1000, 1000);
  textFont(font);
  loadWordParticles(); // Initialize particles for the first word
}

function draw() {
  background(255, 20);

  // Update and display particles
  for (let i = 0; i < textPoints.length; i++) {
    let v = textPoints[i];
    v.update();
    v.show();
    v.behaviors();
  }

  // If all particles have settled, load the next word's particles
  if (particleReady && allParticlesSettled()) {
    loadNextWordParticles();
  }
}

function mousePressed() {
  clicked = true;
  particleReady = true; // Allow particles to fall after explosion
  for (let i = 0; i < textPoints.length; i++) {
    textPoints[i].explode();
  }
}

// Function to load particles for the current word
function loadWordParticles() {
  textPoints = []; // Reset particle array

  let points = font.textToPoints(words[currentWordIndex], tposX, tposY, tSize, {
    sampleFactor: pointCount,
  });

  for (let pt of points) {
    let textPoint = new Interact(
      pt.x,
      pt.y,
      speed,
      dia,
      randomPos,
      comebackSpeed,
      pointsDirection,
      interactionDirection
    );
    textPoints.push(textPoint);
  }
}

function loadNextWordParticles() {
  currentWordIndex = (currentWordIndex + 1) % words.length;
  loadWordParticles();
  clicked = false;
  particleReady = false; // Reset for the next word
}

function allParticlesSettled() {
  return textPoints.every(p => p.isSettled); // Check if all particles are settled
}

// Particle class with interaction, explosion, and piling behavior
function Interact(x, y, m, d, t, s, di, p) {
  this.home = createVector(x, y);
  this.pos = t ? createVector(random(width), random(height)) : this.home.copy();
  this.target = createVector(x, y);
  this.vel = createVector();
  this.acc = createVector();
  this.r = 8;
  this.maxSpeed = m;
  this.maxforce = 1;
  this.dia = d;
  this.come = s;
  this.dir = p;
  this.gravity = createVector(0, 0.2);
  this.isFalling = false;
  this.isExploded = false;
  this.isSettled = false; // Tracks if particle is settled at the bottom
  this.color = color(255);
  this.shape = 'circle';
  this.randomizeShapeAndColor();
}

Interact.prototype.randomizeShapeAndColor = function() {
  let shapes = ['circle', 'square', 'triangle'];
  this.shape = random(shapes);
  this.color = color(random(255), random(255), random(255), 200);
};

Interact.prototype.explode = function() {
  if (!this.isExploded) {
    this.vel = p5.Vector.random2D();
    this.vel.mult(random(5, 10));
    this.isExploded = true;
    this.isFalling = true;
  }
};

Interact.prototype.behaviors = function() {
  if (!clicked) {
    let arrive = this.arrive(this.target);
    let mouse = createVector(mouseX, mouseY);
    let flee = this.flee(mouse);
    this.applyForce(arrive);
    this.applyForce(flee);
  }
};

Interact.prototype.applyForce = function(f) {
  this.acc.add(f);
};

Interact.prototype.arrive = function(target) {
  let desired = p5.Vector.sub(target, this.pos);
  let d = desired.mag();
  let speed = this.maxSpeed;
  if (d < this.come) {
    speed = map(d, 0, this.come, 0, this.maxSpeed);
  }
  desired.setMag(speed);
  let steer = p5.Vector.sub(desired, this.vel);
  return steer;
};

Interact.prototype.flee = function(target) {
  let desired = p5.Vector.sub(target, this.pos);
  let d = desired.mag();

  if (d < this.dia) {
    desired.setMag(this.maxSpeed);
    desired.mult(this.dir);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    return steer;
  } else {
    return createVector(0, 0);
  }
};

Interact.prototype.update = function() {
  if (this.isFalling) {
    this.applyForce(this.gravity);
  }
  this.vel.add(this.acc);
  this.pos.add(this.vel);
  this.acc.mult(0);

  // Check if particle reached the bottom and should settle
  if (this.pos.y > height - this.r) {
    this.pos.y = height - this.r;
    this.vel.y = 0;
    this.isSettled = true;
    this.isFalling = false;
  }
};

Interact.prototype.show = function() {
  noStroke();
  fill(this.color);

  if (this.shape === 'circle') {
    ellipse(this.pos.x, this.pos.y, this.r, this.r);
  } else if (this.shape === 'square') {
    rect(this.pos.x - this.r / 2, this.pos.y - this.r / 2, this.r, this.r);
  } else if (this.shape === 'triangle') {
    triangle(
      this.pos.x, this.pos.y - this.r / 2,
      this.pos.x - this.r / 2, this.pos.y + this.r / 2,
      this.pos.x + this.r / 2, this.pos.y + this.r / 2
    );
  }
};
