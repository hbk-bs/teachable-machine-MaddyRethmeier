/*
  MIT License

  Copyright (c) 2025 [MaddyRethmeier]

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/


// Classifier Variable
let classifier;
let imageModelURL = 'https://teachablemachine.withgoogle.com/models/F4MjnKIyV/'; // Your model

// Game state
let score = 0;
let round = 1;
const totalRounds = 20;
let currentClassification = 0;
let classificationReady = false;

const animalImages = [
  "pictures/awd1.jpg", "pictures/b1.jpg", "pictures/b2.jpg", "pictures/b3.jpg", "pictures/bc.jpg",
  "pictures/bu.jpg", "pictures/c1.jpg", "pictures/c2.jpg", "pictures/cs.jpg", "pictures/dh.jpg",
  "pictures/e1.JPG", "pictures/e2.JPG", "pictures/eu1.jpg", "pictures/fle1.jpg", "pictures/g1.JPG",
  "pictures/g2.JPG", "pictures/gs1.jpg", "pictures/gs2.jpg", "pictures/gs3.jpg", "pictures/gsc1.jpg",
  "pictures/gsc2.jpg", "pictures/kk.JPG", "pictures/kro1.JPG", "pictures/kro2.JPG", "pictures/ks1.jpg",
  "pictures/l1.jpg", "pictures/lb1.jpg", "pictures/lp1.jpg", "pictures/lx1.jpg", "pictures/lx2.jpg",
  "pictures/npf1.JPG", "pictures/npf2.JPG", "pictures/ot1.jpg", "pictures/pa1.jpg", "pictures/pa2.jpg",
  "pictures/pin1.jpg", "pictures/pin2.jpg", "pictures/rat1.jpg", "pictures/rat2.jpg", "pictures/sc1.jpg",
  "pictures/sc2.jpg", "pictures/sh1.jpg", "pictures/sh2.jpg", "pictures/sl1.jpg", "pictures/t1.jpg",
  "pictures/tm.jpg", "pictures/tp1.jpg", "pictures/vs1.JPG", "pictures/vs2.JPG", "pictures/w1.jpg"
];

// Array für zufällige Reihenfolge ohne Dopplung
let shuffledImages = [];

function shuffleImages(images) {
  let array = [...images];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
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

  // Neue zufällige Reihenfolge erzeugen
  shuffledImages = shuffleImages(animalImages);

  loadNextRound();
}

function loadNextRound() {
  if (round > totalRounds) return;

  classificationReady = false;

  document.getElementById('yesBtn').disabled = true;
  document.getElementById('noBtn').disabled = true;
  const feedbackEl = document.getElementById('feedback');
feedbackEl.textContent = '';
feedbackEl.style.opacity = '0';


  const imgSrc = shuffledImages[round - 1]; // Bild aus gemischter Liste nehmen
  const imgEl = document.querySelector("#animalImage img");
  imgEl.src = imgSrc;

  imgEl.onload = () => {
    classifier.classify(imgEl, gotResult);
  };

  // Fortschrittsanzeige aktualisieren
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
  const feedbackEl = document.getElementById('feedback');
feedbackEl.textContent = feedback;
feedbackEl.style.opacity = '1';


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
    resultImage = "pictures/angry.JPG";
  } else if (score <= 10) {
    finalMessage = "Maybe avoid animals in the wild... stick to pets.";
    resultImage = "pictures/pets.JPG";
  } else if (score <= 15) {
    finalMessage = "Wow you are an animal fanatic aren't you?";
    resultImage = "pictures/happy.JPG";
  } else {
    finalMessage = "A Disney princess would be jealous of all your animal friends!";
    resultImage = "pictures/princes.JPG";
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

  shuffledImages = shuffleImages(animalImages);

  document.getElementById('resultImage').style.display = 'none';
  document.getElementById('score').style.display = 'none';
  document.getElementById('tryAgainBtn').style.display = 'none';
  document.getElementById('getResultBtn').style.display = 'none';
  document.getElementById('animalImage').style.display = 'block';
  document.getElementById('score').textContent = "Score: 0";
  document.getElementById('feedback').textContent = "";
  document.getElementById('yesBtn').style.display = 'inline-block';
  document.getElementById('noBtn').style.display = 'inline-block';

  document.getElementById('roundProgressFill').style.width = '5%';
  document.getElementById('roundProgressText').textContent = `Round: 1 / ${totalRounds}`;

  loadNextRound();
}
