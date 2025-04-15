// Classifier Variable
let classifier;
let imageModelURL = 'https://teachablemachine.withgoogle.com/models/AhU4RtWbu/'; // Your model

// Game state
let score = 0;
let round = 1;
const totalRounds = 20;
let currentClassification = 0;
let currentImageIndex = 0;
let classificationReady = false;

const animalImages = [
  "images/IMG_2409.jpg",
  "images/IMG_2411.jpg",
  "images/IMG_2415.jpg",
  "images/IMG_2418.jpg",
  "images/IMG_2420.jpg",
  "images/IMG_7800.jpg",
  "images/IMG_7815.jpg",
  "images/IMG_7822.jpg",
  "images/IMG_7828.jpg",
  "images/IMG_7833.jpg",
  "images/IMG_7863.jpg"
];

function getRandomImage() {
  const index = Math.floor(Math.random() * animalImages.length);
  currentImageIndex = index;
  return animalImages[index];
}

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
  document.getElementById('getResultBtn').addEventListener('click', showFinalScore);
  document.getElementById('tryAgainBtn').addEventListener('click', resetGame);

  document.getElementById('score').style.display = 'none';
  document.getElementById('resultImage').style.display = 'none';

  loadNextRound();
}

function loadNextRound() {
  if (round > totalRounds) return;

  classificationReady = false;

  document.getElementById('yesBtn').disabled = true;
  document.getElementById('noBtn').disabled = true;
  document.getElementById('feedback').textContent = '';

  const imgSrc = getRandomImage();
  const imgEl = document.querySelector("#animalImage img");
  imgEl.src = imgSrc;

  imgEl.onload = () => {
    classifier.classify(imgEl, gotResult);
  };

  // ✅ Update progress bar
  const progressFill = document.getElementById('roundProgressFill');
  const progressText = document.getElementById('roundProgressText');
  progressText.textContent = `Round: ${round} / ${totalRounds}`;
  progressFill.style.width = `${(round / totalRounds) * 100}%`;
}

function gotResult(results) {
  if (results && results[0]) {
    currentClassification = parseInt(results[0].label);
    classificationReady = true;

    document.getElementById('yesBtn').disabled = false;
    document.getElementById('noBtn').disabled = false;
  }
}

function handleChoice(choice) {
  if (!classificationReady) return;

  let feedback = "";

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

  classificationReady = false;
  document.getElementById('feedback').textContent = feedback;

  if (round === totalRounds) {
    document.getElementById('yesBtn').disabled = true;
    document.getElementById('noBtn').disabled = true;

    setTimeout(() => {
      document.getElementById('roundProgressText').textContent = `All done!`;
      document.getElementById('getResultBtn').style.display = 'inline-block';
    }, 1500);
  } else {
    setTimeout(() => {
      round++;
      loadNextRound();
    }, 1500);
  }
}

function showFinalScore() {
  document.getElementById('yesBtn').style.display = 'none';
  document.getElementById('noBtn').style.display = 'none';
  document.getElementById('animalImage').style.display = 'none';
  document.getElementById('getResultBtn').style.display = 'none';

  document.getElementById('score').style.display = 'block';
  document.getElementById('score').textContent = `Final Score: ${score}`;

  let finalMessage = "";
  let resultImage = "";

  if (score <= 5) {
    finalMessage = "You hate animals and they hate you.";
    resultImage = "images/angry_animal.jpg";
  } else if (score <= 10) {
    finalMessage = "Maybe avoid animals in the wild... stick to pets.";
    resultImage = "images/surprised_animal.jpg";
  } else if (score <= 15) {
    finalMessage = "Wow you are an animal fanatic aren't you?";
    resultImage = "images/fanatic_animal.jpg";
  } else {
    finalMessage = "A Disney princess would be jealous of all your animal friends!";
    resultImage = "images/happy_animal.jpg";
  }

  document.getElementById('feedback').textContent = finalMessage;
  document.getElementById('resultImage').style.display = 'block';
  document.getElementById('resultImg').src = resultImage;
  document.getElementById('tryAgainBtn').style.display = 'inline-block';
}

function resetGame() {
  score = 0;
  round = 1;
  currentClassification = 0;
  classificationReady = false;

  document.getElementById('resultImage').style.display = 'none';
  document.getElementById('score').style.display = 'none';
  document.getElementById('tryAgainBtn').style.display = 'none';
  document.getElementById('getResultBtn').style.display = 'none';
  document.getElementById('animalImage').style.display = 'block';
  document.getElementById('score').textContent = "Score: 0";
  document.getElementById('feedback').textContent = "";
  document.getElementById('yesBtn').style.display = 'inline-block';
  document.getElementById('noBtn').style.display = 'inline-block';

  // Reset progress bar
  document.getElementById('roundProgressFill').style.width = '5%';
  document.getElementById('roundProgressText').textContent = `Round: 1 / ${totalRounds}`;

  loadNextRound();
}
