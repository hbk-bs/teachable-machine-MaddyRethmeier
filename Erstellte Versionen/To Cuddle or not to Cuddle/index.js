// Classifier Variable
let classifier;
let imageModelURL = 'https://teachablemachine.withgoogle.com/models/hCRGQP5Gt/'; // Your model

// Game state
let score = 0;
let round = 1;
const totalRounds = 20;
let currentClassification = 0;
let currentImageIndex = 0;

// Your animal image list (replace these with your actual URLs)
const animalImages = [
  "IMG_2409.jpg",
  "IMG_2411.jpg",
  "IMG_2415.jpg",
  "IMG_2418.jpg",
  "IMG_2420.jpg",
  "IMG_7800.jpg",
  "IMG_7815.jpg",
  "IMG_7822.jpg",
  "IMG_7828.jpg",
  "IMG_7833.jpg",
  "IMG_7863.jpg"
];

// Randomizer
function getRandomImage() {
  const index = Math.floor(Math.random() * animalImages.length);
  currentImageIndex = index;
  return animalImages[index];
}

// Preload model
function preload() {
  classifier = ml5.imageClassifier(imageModelURL + 'model.json');
}

window.onload = function () {
  preload();
  setupGame();
};

function setupGame() {
  document.getElementById('yesBtn').addEventListener('click', () => handleChoice('yes'));
  document.getElementById('noBtn').addEventListener('click', () => handleChoice('no'));

  loadNextRound();
}

function loadNextRound() {
  if (round > totalRounds) {
    alert(`Game Over! Final Score: ${score}`);
    return;
  }

  // Reset feedback
  document.getElementById('feedback').textContent = '';

  // Load random image
  const imgSrc = getRandomImage();
  const imgEl = document.querySelector("#animalImage img");
  imgEl.src = imgSrc;

  // Once image is loaded, classify
  imgEl.onload = () => {
    classifier.classify(imgEl, gotResult);
  };

  // Update round info
  document.getElementById('round').textContent = `Round: ${round} / ${totalRounds}`;
}

function gotResult(results) {
  if (results && results[0]) {
    currentClassification = parseInt(results[0].label); // assuming labels are '-1', '0', '1'
    console.log("Classified as:", currentClassification);
  }
}

function handleChoice(choice) {
  let feedback = "";

  // Update score based on rules
  if (choice === 'yes') {
    if (currentClassification === 1) {
      score += 1;
      feedback = "I completely support your choice.";
    } else if (currentClassification === 0) {
      score += 1;
      feedback = "Same.";
    } else if (currentClassification === -1) {
      score -= 1;
      feedback = "Are you sure?";
    }
  } else if (choice === 'no') {
    if (currentClassification === 1) {
      feedback = "Whyever not?";
    } else if (currentClassification === 0) {
      feedback = "Okay...";
    } else if (currentClassification === -1) {
      score += 1;
      feedback = "I like your life choices!";
    }
  }

  // Update score and feedback
  document.getElementById('score').textContent = `Score: ${score}`;
  document.getElementById('feedback').textContent = feedback;

  // Advance round after slight delay for feedback
  setTimeout(() => {
    round++;
    loadNextRound();
  }, 1500);
}
