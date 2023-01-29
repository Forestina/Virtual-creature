// create our creature class
class Creature {
  // this constructor is called when we define new Creature(...)
  constructor(_x, _y) {
    this.location = new createVector(_x, _y);  // Location of shape
    this.velocity = new createVector(random(-2,2),random(-2,2));  // Velocity of shape
    this.friction = new createVector(0, 0); 
    this.desired = new createVector(0, 0); 
    this.diameter = random(10,40);
    this.speedLimit = random(1,this.diameter/10);
    this.full = 0;
  }

  moveToFood(x, y){

    if(this.full>0){
      return false;
    }

    this.desired.x = x;
    this.desired.y = y;
    let direction = p5.Vector.sub(this.desired, this.location);

    if (direction.mag() < this.diameter/2){
      this.full = 1000;
      return true;
    } 
  
    if(direction.mag() < 200){
      direction.normalize();
      this.velocity.add(direction);
    }

    return false;
  } 

 
  update() {

    if(this.full<50){
      this.friction.x = this.velocity.x * -1;
      this.friction.y = this.velocity.y * -1;
      this.friction.normalize();
      this.friction.mult(0.01);
      this.velocity.add(this.friction);
    }

    this.velocity.limit(this.speedLimit);
    // Add velocity to the location.
    this.location.add(this.velocity);

  
    // Bounce off edges
    if (this.location.x > width){
      this.location.x = width;
      this.velocity.x = this.velocity.x * -1;
    }
    if (this.location.x < 0) {
      this.location.x = 0;
      this.velocity.x = this.velocity.x * -1;
    }
    if (this.location.y < 0) {
      this.location.y = 0;
      this.velocity.y = this.velocity.y * -1;
    }
    if (this.location.y > height) {
      this.location.y = height;
      this.velocity.y = this.velocity.y * -1; 
    }

    if(this.full > 0){
      this.full--;
    }
  
    // Display circle at location vector
    noStroke();
    fill(map(this.full,0,100,0,255),0,255);
    circle(this.location.x,this.location.y,this.diameter);
  }
}

//Main sketch below
// an array to store the creatures
let creatures = [];
let food = [];

//TAMA
let canvas;
let button;

let food_tama = [];
let foodLimit = 2;

let hungry = 0;
let full = 1;
let tamaState = hungry;

let tamaX;
let tamaY;
let tamaDiam;

function setup() {
  // createCanvas(400, 400);

  canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("sketch-container"); //move our canvas inside this HTML element

//TAMA
tamaX = width/2;
tamaY = height/2;
tamaDiam = width/6;

  addGUI();

  for(let i = 0; i < 50; i++){
    let c = new Creature(random(width), random(height));
    creatures.push(c);
  }
}

function draw() {
  background(200);

  //TAMA
  tamaDraw();

  // loop through all the creatrure and animate them each frame by accessing their update function
  for (let c of creatures) {
    c.update();
    if(food.length > 0){

      if(c.moveToFood(food[food.length-1].x,food[food.length-1].y)){
        food.pop();
      }
    } 
  }

  updateFood();

  if(button.hasClass("inactive") && food.length == 0){
    button.html("FEED");
    button.removeClass("inactive");
  }

}
function tamaDraw(){
  noStroke();

  if(tamaState == hungry){
    fill(255);
    if(tamaDiam > width/4){
      tamaState = full;
    }
  }else if(tamaState == full){
    fill(0,255,0);
    if(tamaDiam > width/6){
      if(frameCount % 2 == 0) tamaDiam--; // reduce every second frame
    }else{
      tamaState = hungry;
    }
  }

  circle(tamaX,tamaY,tamaDiam);
  fill(0);
  let mouthOffset = tamaDiam/2;
  rect(tamaX-mouthOffset/2,tamaY,mouthOffset,3);

  updateFood_tama();//update and draw food

  if(food_tama.length > 0 && tamaState == hungry){
    eatFood();
  } 
  
  if(food_tama.length <= foodLimit-1){
    button.html("FEED");
    button.removeClass("inactive");
  }
}
function updateFood(){
  for(let i = food.length-1; i >= 0 ; i--){
    fill(100);
    circle(food[i].x,food[i].y,food[i].d);
    food[i].y += 1;
    if(food[i].y > height){
      food.splice(i,1);//remove one from array at index i
    }
  }
}
function updateFood_tama(){
  for(let i = food_tama.length-1; i >= 0 ; i--){
    fill(100);
    circle(food_tama[i].x,food_tama[i].y,food_tama[i].d);
    food_tama[i].y -= 1;
    if(food_tama[i].y < 0){
      food_tama.splice(i,1);//remove one from array at index i
    }
  }
}
function addGUI()
{

  //add a button
  button = createButton("FEED");

  button.addClass("button");

  //Add the play button to the parent gui HTML element
  button.parent("gui-container");
  
  //Adding a mouse pressed event listener to the button 
  button.mousePressed(handleButtonPress); 

}

function handleButtonPress()
{
    if(food.length == 0 && !button.hasClass("inactive")){
      food.push({
          x:random(width),
          y:random(height/2),
          d:random(5,20)
        });
    }
    
    if(food.length > 0){
      button.html("FEEDING");
      button.addClass("inactive");
    }

    //TAMA
    if(food_tama.length <= foodLimit-1){
      food_tama.push({
          x:width/2,
          y:height,
          d:random(10,40)
        });
    }
    
    if(food_tama.length > foodLimit-1){
      button.html("FEEDING");
      button.addClass("inactive");
    }
  
}

function windowResized() {

  resizeCanvas(windowWidth, windowHeight);

}

//TAMA
function eatFood(){

  //Eats all the food
  for(let i = food_tama.length-1; i >= 0 ; i--){
    let distanceY =  tamaY - food_tama[i].y;

    if(food_tama[i].y > tamaX){
      fill(0);
      circle(tamaX,tamaY,tamaDiam/2);
    }

    if(abs(distanceY) < 10){
      tamaDiam += food_tama[food_tama.length-1].d;
      food_tama.splice(i,1);
    }
  }

}