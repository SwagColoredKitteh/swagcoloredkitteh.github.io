/*globals
  stroke, fill, rect, createCanvas, windowWidth, windowHeight, background, line, noFill, text,
  noStroke, textAlign, LEFT, CENTER, RIGHT, random, createSlider, createDiv, ellipse,
  createSpan, createDiv,

  BOX_SEPARATION, BOX_VEL, BOX_LENGTH, BOX_RESTITUTION, BOX1_START_MASS, BOX2_START_MASS,
  USE_CIRCLES, VERTICAL_SPEED
*/

var box1, box2;

var massSlider1, massSlider2;

var velSlider1, velSlider2;

var collided, collidedTimer;

var y;

var restitutionSlider;

var controls;

function Box(pos, vel, length, mass) {
  this.pos = pos;
  this.vel = vel;
  this.length = length;
  this.mass = mass;
}

Box.prototype.draw = function() {
  var textY = 55;
  if(USE_CIRCLES) {
    textY = 65 + this.length;
    stroke(0, 0, 255);
    line(this.pos, 25, this.pos, 65 + y);
  }
  stroke(0);
  fill(255, 0, 0);
  if(USE_CIRCLES) {
    ellipse(this.pos, 65 + y, this.length, this.length);
  }
  rect(this.pos - this.length / 2, 10, this.length, 30);
  noStroke();
  fill(193, 0, 255);
  textAlign(CENTER);
  text("m=" + this.mass, this.pos, textY + y);
  text("p=" + Math.floor(this.mass * this.vel * 10) / 10, this.pos, textY + 15 + y);
  text("Ek=" + Math.floor(this.mass * this.vel * this.vel * 0.5 * 10) / 10, this.pos, textY + 30 + y);
};

function reset() {
  var canvasWidth = windowWidth - 200;
  collided = false;
  collidedTimer = 0;
  y = 0;
  box1 = new Box(canvasWidth / 2 - BOX_SEPARATION / 2, velSlider1.value(), BOX_LENGTH, massSlider1.value());
  box2 = new Box(canvasWidth / 2 + BOX_SEPARATION / 2, -velSlider2.value(), BOX_LENGTH, massSlider2.value());
}

function createSliderControl(lbl, min, max, def, step) {
  var slider = createSlider(min, max, def, step);
  var label = createSpan(lbl);
  var minLabel = createSpan(min);
  var maxLabel = createSpan(max);
  label.addClass("label");
  minLabel.addClass("min-label");
  maxLabel.addClass("max-label");
  var div = createDiv("");
  div.addClass("control");
  label.parent(div);
  minLabel.parent(div);
  slider.parent(div);
  maxLabel.parent(div);
  div.parent(controls);
  return slider;
}

function setup() {
  createCanvas(windowWidth - 200, windowHeight);
  controls = createDiv("");
  controls.addClass("controls");
  massSlider1 = createSliderControl("m1", 1, 100, BOX1_START_MASS);
  massSlider2 = createSliderControl("m2", 1, 100, BOX2_START_MASS);
  velSlider1 = createSliderControl("v1", 0.5, 5, BOX_VEL, 0.25);
  velSlider2 = createSliderControl("v2", 0.5, 5, BOX_VEL, 0.25);
  if(USE_CIRCLES) {
    restitutionSlider = createSliderControl("e", 0, 1, BOX_RESTITUTION, 0.05);
  }
  reset();
}

function draw() {
  var canvasWidth = windowWidth - 200;
  var e = BOX_RESTITUTION;
  if(USE_CIRCLES) {
    e = restitutionSlider.value();
  }
  y += VERTICAL_SPEED;
  background(255);
  stroke(0, 255, 0);
  noFill();
  line(canvasWidth / 2 - BOX_SEPARATION / 2, 25, canvasWidth / 2 + BOX_SEPARATION / 2, 25);
  box1.mass = massSlider1.value();
  box2.mass = massSlider2.value();
  box1.draw();
  box2.draw();
  textAlign(CENTER);
  var textY = 100;
  if(USE_CIRCLES) {
    textY = 65 + Math.max(box1.length, box2.length) + 45;
  }
  text("Ek1 + Ek2 = " + Math.floor((box1.mass * box1.vel * box1.vel * 0.5 + box2.mass * box2.vel * box2.vel * 0.5) * 10) / 10, canvasWidth / 2, textY + y);
  if(!collided && box2.pos + box2.vel - box1.pos - box1.vel < (box1.length + box2.length) / 2) {
    var dp = box2.pos - box1.pos - (box1.length + box2.length) / 2;
    var dv = box1.vel - box2.vel;
    var col_t = dp / dv;
    box1.pos += col_t * box1.vel;
    box2.pos += col_t * box2.vel;
    var j = (e + 1) * box1.mass * box2.mass * ( box2.vel - box1.vel ) / ( box1.mass + box2.mass );
    box1.vel += j / box1.mass;
    box2.vel -= j / box2.mass;
    box1.pos += (1 - col_t) * box1.vel;
    box2.pos += (1 - col_t) * box2.vel;
    collided = true;
  }
  else {
    box1.pos += box1.vel;
    box2.pos += box2.vel;
  }
  if(collided) {
    collidedTimer += 1;
    if(collidedTimer > 100) {
      reset();
    }
  }
}
