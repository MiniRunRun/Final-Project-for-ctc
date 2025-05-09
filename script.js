let wordPool = [];
let fallingWords = [];
let stackedWords = [];
let floorLevel;
let minGap = 5; // Minimum gap between stacked words

function setup() {
  createCanvas(windowWidth, windowHeight);
  textSize(20);
  textAlign(LEFT, TOP);
  floorLevel = height - 20;
  
  document.getElementById('submit-btn').addEventListener('click', function() {
    const inputText = document.getElementById('user-text').value.trim();
    if (inputText) {
      // Add new words to pool (split by spaces and filter empty strings)
      wordPool = wordPool.concat(inputText.split(/\s+/).filter(word => word.length > 0));
      document.getElementById('user-text').value = '';
    }
  });
}

function draw() {
  background(0, 0, 0, 15); // Semi-transparent for trail effect
  
  // Draw floor
  fill(50);
  noStroke();
  rect(0, floorLevel, width, height - floorLevel);
  
  // Randomly add new words from pool
  if (wordPool.length > 0 && frameCount % 10 === 0 && random() < 0.3) {
    const randomIndex = floor(random(wordPool.length));
    const newWord = wordPool[randomIndex];
    const wordWidth = textWidth(newWord) + 20;
    
    // Start from random x position (within canvas bounds)
    let x = random(20, width - wordWidth - 20);
    fallingWords.push(new FallingWord(newWord, x));
  }
  
  // Update and display falling words
  for (let i = fallingWords.length - 1; i >= 0; i--) {
    fallingWords[i].update();
    fallingWords[i].display();
    
    // Check if word should stack
    const collision = checkCollision(fallingWords[i]);
    if (collision || fallingWords[i].y + fallingWords[i].height >= floorLevel) {
      // Determine final y position
      let finalY = collision ? collision.y - fallingWords[i].height : floorLevel - fallingWords[i].height;
      
      // Add to stacked words
      stackedWords.push({
        text: fallingWords[i].text,
        x: fallingWords[i].x,
        y: finalY,
        color: fallingWords[i].color,
        width: fallingWords[i].width,
        height: fallingWords[i].height
      });
      
      // Remove from falling words
      fallingWords.splice(i, 1);
    }
  }
  
  // Display stacked words with borders
  for (let word of stackedWords) {
    fill(word.color);
    stroke(70);
    strokeWeight(1);
    rect(word.x, word.y, word.width, word.height, 3);
    fill(255);
    noStroke();
    text(word.text, word.x + 10, word.y + 10);
  }
}

function checkCollision(fallingWord) {
  // Check collision with all stacked words
  for (let word of stackedWords) {
    // Check if falling word is above and overlapping with any stacked word
    if (fallingWord.x + fallingWord.width > word.x + minGap && 
        fallingWord.x < word.x + word.width - minGap &&
        fallingWord.y + fallingWord.height >= word.y - minGap) {
      return word;
    }
  }
  return null;
}

class FallingWord {
  constructor(text, x) {
    this.text = text;
    this.x = x;
    this.y = -40;
    this.speed = random(1, 3);
    this.color = color(random(75, 225));
    this.width = textWidth(text) + 20;
    this.height = 40;
    this.rotation = random(-0.1, 0.1);
    this.rotSpeed = random(-0.02, 0.02);
  }
  
  update() {
    this.y += this.speed;
    this.rotation += this.rotSpeed;
  }
  
  display() {
    push();
    translate(this.x + this.width/2, this.y + this.height/2);
    rotate(this.rotation);
    translate(-this.width/2, -this.height/2);
    
    fill(this.color);
    stroke(70);
    strokeWeight(1);
    rect(0, 0, this.width, this.height, 3);
    fill(255);
    noStroke();
    text(this.text, 10, 10);
    
    pop();
  }
}

function keyPressed() {
  // Remove words starting with the pressed key
  for (let i = stackedWords.length - 1; i >= 0; i--) {
    if (stackedWords[i].text.toLowerCase().startsWith(key.toLowerCase())) {
      stackedWords.splice(i, 1);
    }
  }
  
  // Also remove falling words
  for (let i = fallingWords.length - 1; i >= 0; i--) {
    if (fallingWords[i].text.toLowerCase().startsWith(key.toLowerCase())) {
      fallingWords.splice(i, 1);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  floorLevel = height - 20;
}