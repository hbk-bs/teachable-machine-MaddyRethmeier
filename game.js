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
// IMPORTANT: Use your Teachable Machine model URL here
let imageModelURL = 'https://teachablemachine.withgoogle.com/models/UVnwStPEv/';

// Game state variables
let score = 0;
let round = 1;
const totalRounds = 20; // Total number of rounds in the game
let currentClassification = 0; // Stores the classification result (1, 0, or -1)
let classificationReady = false; // Flag to indicate if classification for current image is complete

// Array of animal image paths, dynamically generated for "picturesNew/1.jpg" to "picturesNew/50.jpg"
const animalImages = [];
for (let i = 1; i <= 50; i++) {
  animalImages.push(`picturesNew/${i}.jpg`);
}

// Array to hold shuffled image paths for random, non-repeating order
let shuffledImages = [];

/**
 * Shuffles an array randomly to ensure unique image order each game.
 * @param {Array} images - The array of image paths to shuffle.
 * @returns {Array} - A new array with elements in random order.
 */
function shuffleImages(images) {
  let array = [...images]; // Create a shallow copy to avoid modifying the original array
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // ES6 destructuring swap
  }
  return array;
}

/**
 * Preloads the ml5.js image classifier model.
 */
function preload() {
  console.log("Preloading classifier for game mode...");
  // Initialize the image classifier with the model URL and a callback function
  classifier = ml5.imageClassifier(imageModelURL + 'model.json', modelLoaded);
}

/**
 * Callback function executed once the Teachable Machine model is successfully loaded.
 */
function modelLoaded() {
  console.log("Teachable Machine Model Loaded Successfully for game mode!");
  // Once the model is loaded, we can start the game directly
  resetGame();
}

/**
 * Ensures the DOM is fully loaded before setting up game event listeners.
 */
window.onload = function () {
  preload(); // Start preloading the model
  setupGameListeners(); // Set up game elements and event listeners
};

/**
 * Initializes the game by setting up button event listeners.
 */
function setupGameListeners() {
  // Attach event listeners to all interactive buttons
  document.getElementById('yesBtn').addEventListener('click', () => handleChoice('yes'));
  document.getElementById('noBtn').addEventListener('click', () => handleChoice('no'));
  document.getElementById('getResultBtn').addEventListener('click', showFinalScore);
  document.getElementById('tryAgainBtn').addEventListener('click', resetGame);
  // Event listener for the always-present "Back to Main" button
  document.getElementById('backToMainBtn').addEventListener('click', () => {
    window.location.href = 'index.html'; // Navigate back to the main menu
  });

  // Initially hide elements that are not part of the current game state
  document.getElementById('score').style.display = 'none';
  document.getElementById('resultImage').style.display = 'none';
  // The 'backToMainBtn' will be visible by default now in HTML
}

/**
 * Loads the next animal image and triggers its classification.
 */
function loadNextRound() {
  // Check if all rounds are completed
  if (round > totalRounds) {
    document.getElementById('yesBtn').disabled = true;
    document.getElementById('noBtn').disabled = true;
    document.getElementById('roundProgressText').textContent = `All done!`;
    document.getElementById('getResultBtn').style.display = 'inline-block'; // Show result button
    return;
  }

  classificationReady = false; // Reset classification status for the new round

  document.getElementById('yesBtn').disabled = true; // Disable choice buttons
  document.getElementById('noBtn').disabled = true;
  document.getElementById('feedback').textContent = ''; // Clear previous feedback

  const imgSrc = shuffledImages[round - 1]; // Get the image path for the current round
  const imgEl = document.querySelector("#animalImage img");
  imgEl.src = imgSrc; // Set the image source

  // Once the image is loaded, classify it using the Teachable Machine model
  imgEl.onload = () => {
    console.log(`Image loaded: ${imgSrc}`); // Debugging: Confirm image has loaded
    classifier.classify(imgEl, gotResult); // Pass the image element and callback to classifier
  };

  // Handle errors if an image fails to load
  imgEl.onerror = () => {
    console.error(`Failed to load image: ${imgSrc}. Please check the path.`);
    document.getElementById('feedback').textContent = "Error loading image. Skipping round.";
    // Automatically advance to the next round after a short delay
    setTimeout(() => {
      round++;
      loadNextRound();
    }, 2000);
  };

  // Update the progress bar and text
  const progressFill = document.getElementById('roundProgressFill');
  const progressText = document.getElementById('roundProgressText');
  progressText.textContent = `Round: ${round} / ${totalRounds}`;
  progressFill.style.width = `${(round / totalRounds) * 100}%`;
}

/**
 * Callback function after image classification is attempted.
 * IMPORTANT: Parameters are (results, error) for this ml5.js version's behavior.
 * @param {Array} results - The classification results array from ml5.js.
 * @param {Error} [error] - An error object if classification failed.
 */
function gotResult(results, error) { // Corrected parameter order: results first, then error
  if (error) {
    console.error("CLASSIFICATION ERROR DETAILS:", error); // Log the full error object for debugging
    document.getElementById('feedback').textContent = "Error classifying image. Please check your model.";
    // Buttons remain disabled if there's a classification error, preventing incorrect choices.
    return;
  }

  if (results && results[0]) {
    // Parse the label to an integer (assuming your TM classes are named "1", "0", "-1")
    currentClassification = parseInt(results[0].label);
    classificationReady = true; // Set flag to true, enabling choice buttons
    document.getElementById('yesBtn').disabled = false; // Enable "Cuddle" button
    document.getElementById('noBtn').disabled = false;   // Enable "No Cuddle" button
    console.log("Classification successful! Buttons enabled. Current classification:", currentClassification, "Label:", results[0].label);
  } else {
    // This block handles cases where classification was attempted but yielded no valid results
    console.warn("No classification results found, or unexpected results format.");
    document.getElementById('feedback').textContent = "Could not classify image. Trying next one.";
    // Auto-advance if no results are found to keep the game moving
    setTimeout(() => {
        round++;
        loadNextRound();
    }, 1500);
  }
}

/**
 * Handles the user's choice ("yes" for cuddle, "no" for no cuddle) and updates score.
 * @param {string} choice - The user's choice, "yes" or "no".
 */
function handleChoice(choice) {
  if (!classificationReady) return; // Prevent choices if classification isn't ready

  let feedback = "";

  // Logic for updating score based on user's choice and model's classification
  if (choice === 'yes') {
    if (currentClassification === 1) { // Model classified as "cuddly"
      score += 1;
      feedback = "I completely support your choice.";
    } else if (currentClassification === 0) { // Model classified as "neutral"
      score += 1; // Still give a point for matching a neutral choice with "yes"
      feedback = "Same.";
    } else if (currentClassification === -1) { // Model classified as "not cuddly"
      score -= 1;
      feedback = "Are you sure?";
    }
  } else if (choice === 'no') {
    if (currentClassification === 1) { // Model classified as "cuddly"
      feedback = "Whyever not?";
    } else if (currentClassification === 0) { // Model classified as "neutral"
      feedback = "Okay...";
    } else if (currentClassification === -1) { // Model classified as "not cuddly"
      score += 1;
      feedback = "I like your life choices!";
    }
  }

  classificationReady = false; // Disable choices until next image is classified
  document.getElementById('feedback').textContent = feedback; // Display feedback

  // Determine if the game should end or proceed to the next round
  if (round === totalRounds) {
    document.getElementById('yesBtn').disabled = true;
    document.getElementById('noBtn').disabled = true;

    // After a short delay, indicate game is done and show result button
    setTimeout(() => {
      document.getElementById('roundProgressText').textContent = `All done!`;
      document.getElementById('getResultBtn').style.display = 'inline-block';   
    }, 1500);
  } else {
    // Proceed to the next round after a short delay
    setTimeout(() => {
      round++;
      loadNextRound();
    }, 1500);
  }
}

/**
 * Displays the final score and a corresponding message/image based on performance.
 */
function showFinalScore() {
  // Hide game elements and show final score elements
  document.getElementById('yesBtn').style.display = 'none';
  document.getElementById('noBtn').style.display = 'none';
  document.getElementById('animalImage').style.display = 'none';
  document.getElementById('getResultBtn').style.display = 'none';
 

  document.getElementById('score').style.display = 'block';
  document.getElementById('score').textContent = `Final Score: ${score}`;

  let finalMessage = "";
  let resultImage = "";

  // Determine final message and image based on score ranges (tuned for 20 rounds)
  if (score <= 5) {
    finalMessage = "You hate animals and they hate you.";
    resultImage = "picturesNew/54.jpg";
  } else if (score <= 10) {
    finalMessage = "Maybe avoid animals in the wild... stick to pets.";
    resultImage = "picturesNew/52.jpg";
  } else if (score <= 15) {
    finalMessage = "Wow you are an animal fanatic aren't you?";
    resultImage = "picturesNew/53.jpg";
  } else { // Scores above 15 (up to 20)
    finalMessage = "A Disney princess would be jealous of all your animal friends!";
    resultImage = "picturesNew/51.jpg";
  }

  document.getElementById('feedback').textContent = finalMessage;
  document.getElementById('resultImage').style.display = 'block';
  document.getElementById('resultImg').src = resultImage; // Set the result image source
  document.getElementById('tryAgainBtn').style.display = 'inline-block'; // Show "Try Again" button
  // Re-add a "Back to Main" button here for the result screen if desired, or rely on the previous one.
  // For this scenario, we assume you want the *original* button to stay hidden
  // and the player will click 'Try Again' or manually navigate back if they choose.
  // If you want a *new* 'Back to Main' button on the results screen, you'd add one to HTML here and show it.
  // Given the prompt, it seems you want it to disappear when results are shown.
}

/**
 * Resets the game state and starts a new game.
 */
function resetGame() {
  // Reset all game-related variables
  score = 0;
  round = 1;
  currentClassification = 0;
  classificationReady = false;

  shuffledImages = shuffleImages(animalImages); // Generate a new random order of images

  // Reset display elements to initial game state
  document.getElementById('resultImage').style.display = 'none';
  document.getElementById('score').style.display = 'none';
  document.getElementById('tryAgainBtn').style.display = 'none';
  document.getElementById('getResultBtn').style.display = 'none';
  document.getElementById('gameControls').style.display = 'flex'; // Ensure 'Back to Main' is visible again
  document.getElementById('animalImage').style.display = 'block';
  document.getElementById('score').textContent = "Score: 0"; // Reset score display
  document.getElementById('feedback').textContent = ""; // Clear feedback
  document.getElementById('yesBtn').style.display = 'inline-block'; // Show choice buttons
  document.getElementById('noBtn').style.display = 'inline-block';
  document.getElementById('yesBtn').disabled = true; // Disable until classification is ready
  document.getElementById('noBtn').disabled = true; // Disable until classification is ready

  // Reset progress bar
  document.getElementById('roundProgressFill').style.width = '0%';
  document.getElementById('roundProgressText').textContent = `Round: 1 / ${totalRounds}`;

  loadNextRound(); // Start the first round of the new game
}