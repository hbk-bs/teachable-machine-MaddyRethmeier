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
let imageModelURL = 'https://teachablemachine.withgoogle.com/models/UVnwStPEv/'; // REMINDER: Update with your actual model URL

// Game State Variables for Multi-Image Upload
let uploadedImageCount = 0;
let friendshipScores = []; // Stores 1 (cuddly), 0 (neutral), or -1 (not cuddly) for each image
const MAX_IMAGES_PER_SESSION = 10; // User can upload 1 initial + 9 more = 10 total

// Generic feedback phrases for suspense
const genericFeedbackPhrases = [
    "Hmm... let me think...",
    "Interesting...",
    "Curious choice...",
    "How exotic...",
    "A unique selection!",
    "Analyzing this one carefully...",
    "Intriguing...",
    "Let's see what we have here...",
    "Fascinating specimen...",
    "Processing thoughts...",
    "My circuits are buzzing...",
    "A mystery unfolds...",
    "Contemplating deeply...",
    "A new perspective...",
    "Unusual...",
    "Gazing intently...",
    "Quite the character...",
    "Deep in concentration...",
    "I'm pondering...",
    "A distinct visual...",
    "One moment, please..."
];

// Cached DOM elements - declare them globally to avoid repeated lookups
let uploadedImagePreview;
let uploadPlaceholder;
let uploadInput;
let classifyUploadBtn;
let uploadResultText;
let sessionStatusText;
let uploadNextImageBtn;
let seeResultNowBtn;
let resetUploadBtn;
let backToMainBtn;
let initialBackToMainBtn;
let finalResultContainer;
let mainCuddlePredictorHeader;
let mainDescription;
let uploadPreview;
let gameButtons;
let finalNumericScore;
let finalResultImage; // Added for the final result image
let finalResultMessage; // Added for the final result message

/**
 * Preloads the ml5.js image classifier model.
 */
function preload() {
  console.log("Preloading classifier for upload mode...");
  // Initialize the image classifier with the model URL and a callback function
  classifier = ml5.imageClassifier(imageModelURL + 'model.json', modelLoaded);
}

/**
 * Callback function executed once the Teachable Machine model is successfully loaded.
 */
function modelLoaded() {
  console.log("Teachable Machine Model Loaded Successfully for upload mode!");
  // Once the model is loaded, we can reset the upload mode to prepare for user input
  resetUploadMode(); // This is called *after* model loads
}

/**
 * Ensures the DOM is fully loaded before setting up event listeners.
 * Also caches DOM elements here.
 */
window.onload = function () {
  // Cache DOM elements for efficiency
  uploadedImagePreview = document.getElementById('uploadedImagePreview');
  uploadPlaceholder = document.getElementById('uploadPlaceholder');
  uploadInput = document.getElementById('uploadInput');
  classifyUploadBtn = document.getElementById('classifyUploadBtn');
  uploadResultText = document.getElementById('uploadResultText');
  sessionStatusText = document.getElementById('sessionStatus');
  uploadNextImageBtn = document.getElementById('uploadNextImageBtn');
  seeResultNowBtn = document.getElementById('seeResultNowBtn');
  resetUploadBtn = document.getElementById('resetUploadBtn');
  backToMainBtn = document.getElementById('backToMainBtn');
  initialBackToMainBtn = document.getElementById('initialBackToMainBtn');
  finalResultContainer = document.getElementById('finalResultContainer');
  mainCuddlePredictorHeader = document.getElementById('mainCuddlePredictorHeader');
  mainDescription = document.getElementById('mainDescription');
  uploadPreview = document.getElementById('uploadPreview');
  gameButtons = document.getElementById('gameButtons');
  finalNumericScore = document.getElementById('finalNumericScore');
  finalResultImage = document.getElementById('finalResultImage'); // Cache final result image
  finalResultMessage = document.getElementById('finalResultMessage'); // Cache final result message

  preload(); // Start preloading the model
  setupUploadModeListeners(); // Set up upload mode event listeners
  // resetUploadMode() is called in modelLoaded, which sets the initial state correctly.
};

/**
 * Initializes upload mode by setting up button event listeners.
 */
function setupUploadModeListeners() {
  uploadInput.addEventListener('change', handleImageUpload);
  classifyUploadBtn.addEventListener('click', classifyUploadedImage);
  uploadNextImageBtn.addEventListener('click', uploadNextImage);
  seeResultNowBtn.addEventListener('click', seeResultNow);
  resetUploadBtn.addEventListener('click', resetUploadMode);
  backToMainBtn.addEventListener('click', () => {
    window.location.href = 'index.html'; // Navigate back to the main menu
  });
  initialBackToMainBtn.addEventListener('click', () => {
      window.location.href = 'index.html'; // Navigate back to the main menu
  });
}

/**
 * Handles the user selecting an image file.
 * Displays a preview and enables the classify button.
 * @param {Event} event - The change event from the file input.
 */
function handleImageUpload(event) {
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      // Show upload elements
      mainCuddlePredictorHeader.style.display = 'block';
      mainDescription.style.display = 'block';
      uploadInput.style.display = 'block';
      uploadInput.disabled = false; // Ensure input is enabled when a file is selected
      uploadPreview.style.display = 'flex'; // Use flex for centering preview
      uploadedImagePreview.src = e.target.result;
      uploadedImagePreview.style.display = 'block';
      uploadPlaceholder.style.display = 'none';

      classifyUploadBtn.style.display = 'inline-block'; // SHOW Classify button
      gameButtons.style.display = 'flex'; // Show the game buttons wrapper

      // Hide final result section and its buttons
      finalResultContainer.style.display = 'none';
      resetUploadBtn.style.display = 'none';
      backToMainBtn.style.display = 'none';
      initialBackToMainBtn.style.display = 'none'; // Hide the initial back button once a file is selected
      finalNumericScore.style.display = 'none'; // Hide score display

      // Reset specific element states
      classifyUploadBtn.disabled = false;
      uploadResultText.textContent = '';
      uploadNextImageBtn.style.display = 'none';
      seeResultNowBtn.style.display = 'none';
      sessionStatusText.style.display = 'block';
    };
    reader.readAsDataURL(file);
  } else {
    // If no file is selected (e.g., user opens dialog and cancels)
    // Show main elements
    mainCuddlePredictorHeader.style.display = 'block';
    mainDescription.style.display = 'block';
    uploadInput.style.display = 'block';
    uploadInput.disabled = false; // Ensure input is enabled even if no file is selected (e.g., user cancels dialog)
    uploadPreview.style.display = 'flex';
    uploadedImagePreview.src = '';
    uploadedImagePreview.style.display = 'none';
    uploadPlaceholder.style.display = 'block';

    classifyUploadBtn.style.display = 'none'; // HIDE Classify button if no file selected
    gameButtons.style.display = 'flex'; // Show game buttons wrapper

    // Hide result and specific buttons
    finalResultContainer.style.display = 'none';
    uploadNextImageBtn.style.display = 'none';
    seeResultNowBtn.style.display = 'none';
    resetUploadBtn.style.display = 'none';
    backToMainBtn.style.display = 'none';
    finalNumericScore.style.display = 'none'; // Hide score display

    // Show the initial back button if no file is selected (initial state)
    initialBackToMainBtn.style.display = 'inline-block';

    // Reset specific element states
    classifyUploadBtn.disabled = true;
    uploadResultText.textContent = 'Please select an image.';
    sessionStatusText.style.display = 'none';
  }
}

/**
 * Classifies the uploaded image using the Teachable Machine model.
 */
function classifyUploadedImage() {
  if (!uploadedImagePreview.src || uploadedImagePreview.style.display === 'none') {
    uploadResultText.textContent = "Please upload an image first!";
    classifyUploadBtn.style.display = 'none'; // Make sure classify button is hidden if error occurs without an image
    return;
  }

  // Hide upload input and classify button during classification
  classifyUploadBtn.disabled = true;
  uploadInput.disabled = true; // Disable the file input during classification
  uploadInput.style.display = 'none';
  classifyUploadBtn.style.display = 'none'; // HIDE Classify button once clicked

  // Hide game action buttons temporarily
  gameButtons.style.display = 'none'; // Hide the gameButtons wrapper
  finalResultContainer.style.display = 'none'; // Ensure final result is hidden
  resetUploadBtn.style.display = 'none';
  backToMainBtn.style.display = 'none';
  initialBackToMainBtn.style.display = 'none'; // Hide initial back button during classification
  finalNumericScore.style.display = 'none'; // Hide score display

  uploadResultText.textContent = "Classifying...";
  sessionStatusText.textContent = `Analyzing image ${uploadedImageCount + 1} of ${MAX_IMAGES_PER_SESSION}...`;

  // Keep main header and description visible during classification
  mainCuddlePredictorHeader.style.display = 'block';
  mainDescription.style.display = 'block';

  classifier.classify(uploadedImagePreview, gotUploadResult);
}

/**
 * Callback function for classifying the uploaded image.
 * @param {Array} results - The classification results array from ml5.js.
 * @param {Error} [error] - An error object if classification failed.
 */
function gotUploadResult(results, error) {
  if (error) {
    console.error("UPLOAD CLASSIFICATION ERROR:", error);
    uploadResultText.textContent = "Error classifying image. Please try another.";
    // Re-enable elements for retry
    classifyUploadBtn.disabled = false;
    uploadInput.disabled = false; // Re-enable file input on error
    uploadInput.style.display = 'block';
    classifyUploadBtn.style.display = 'inline-block'; // SHOW Classify button on error for retry

    // Show initial buttons or allow user to reset
    gameButtons.style.display = 'flex';
    uploadNextImageBtn.style.display = 'none';
    seeResultNowBtn.style.display = 'none';
    finalResultContainer.style.display = 'none'; // Ensure final result is hidden on error
    resetUploadBtn.style.display = 'none';
    backToMainBtn.style.display = 'none';
    initialBackToMainBtn.style.display = 'none'; // Keep initial back button hidden on error during session
    finalNumericScore.style.display = 'none'; // Hide score display

    mainCuddlePredictorHeader.style.display = 'block'; // Keep main H1 visible
    mainDescription.style.display = 'block'; // Keep description visible
    return;
  }

  if (results && results[0]) {
    const prediction = parseInt(results[0].label);

    friendshipScores.push(prediction);
    uploadedImageCount++;

    const randomIndex = Math.floor(Math.random() * genericFeedbackPhrases.length);
    uploadResultText.textContent = genericFeedbackPhrases[randomIndex];

    finalResultContainer.style.display = 'none'; // Ensure final result is hidden after a new classification

    sessionStatusText.textContent = `Analyzed ${uploadedImageCount} of ${MAX_IMAGES_PER_SESSION} images.`;

    // Show relevant buttons based on progress
    if (uploadedImageCount < MAX_IMAGES_PER_SESSION) {
      gameButtons.style.display = 'flex'; // Show the wrapper for current session buttons
      uploadNextImageBtn.style.display = 'inline-block';
      if (uploadedImageCount > 0) {
          seeResultNowBtn.style.display = 'inline-block';
      } else {
          seeResultNowBtn.style.display = 'none';
      }
      resetUploadBtn.style.display = 'none';
      backToMainBtn.style.display = 'none';
      initialBackToMainBtn.style.display = 'none'; // Keep initial back button hidden during session
      finalNumericScore.style.display = 'none'; // Hide score display

      mainCuddlePredictorHeader.style.display = 'block';
      mainDescription.style.display = 'block';
      uploadInput.style.display = 'block'; // Ensure input is visible for next upload
      uploadInput.disabled = false; // Re-enable upload input for the next image
      classifyUploadBtn.style.display = 'inline-block'; // Re-show classify button, disabled until new file chosen
      classifyUploadBtn.disabled = true; // Disabled until new file chosen
    } else {
      // Session complete (MAX_IMAGES_SESSION reached)
      gameButtons.style.display = 'none'; // Hide current session buttons wrapper
      uploadInput.style.display = 'none';
      uploadInput.disabled = true; // Keep upload input disabled when session is over
      classifyUploadBtn.style.display = 'none'; // HIDE Classify button when session is over
      seeResultNowBtn.style.display = 'none';
      uploadNextImageBtn.style.display = 'none';
      initialBackToMainBtn.style.display = 'none'; // Hide initial back button when session is complete
      finalNumericScore.style.display = 'block'; // Show score display when session complete

      sessionStatusText.textContent = `All ${MAX_IMAGES_PER_SESSION} images analyzed!`;
      calculateFinalFriendshipScore(); // Immediately show final score
    }

  } else {
    uploadResultText.textContent = "Could not classify the image. Please try another.";
    classifyUploadBtn.disabled = false;
    uploadInput.disabled = false; // Re-enable file input on no result
    uploadInput.style.display = 'block';
    classifyUploadBtn.style.display = 'inline-block'; // SHOW Classify button on no result for retry

    gameButtons.style.display = 'flex'; // Show game buttons wrapper
    resetUploadBtn.style.display = 'none';
    backToMainBtn.style.display = 'none';
    seeResultNowBtn.style.display = 'none';
    uploadNextImageBtn.style.display = 'none';
    initialBackToMainBtn.style.display = 'none'; // Keep initial back button hidden
    finalNumericScore.style.display = 'none'; // Hide score display

    finalResultContainer.style.display = 'none';
    mainCuddlePredictorHeader.style.display = 'block';
    mainDescription.style.display = 'block';
  }
}

/**
 * Resets the display to allow uploading the next image in the session.
 * Does NOT reset session count or scores.
 */
function uploadNextImage() {
  // Show upload elements for next image
  uploadedImagePreview.src = '';
  uploadedImagePreview.style.display = 'none';
  uploadPlaceholder.style.display = 'block';
  uploadInput.value = ''; // Clear file input
  uploadInput.style.display = 'block';
  uploadInput.disabled = false; // Re-enable upload input for next image
  classifyUploadBtn.disabled = true;
  classifyUploadBtn.style.display = 'none'; // HIDE Classify button until new image is selected
  uploadResultText.textContent = '';
  uploadPreview.style.display = 'flex';

  // Ensure main elements are visible during upload process
  mainCuddlePredictorHeader.style.display = 'block';
  mainDescription.style.display = 'block';
  sessionStatusText.style.display = 'block';

  // Manage buttons for the current session state
  gameButtons.style.display = 'flex'; // Show wrapper
  uploadNextImageBtn.style.display = 'none';
  seeResultNowBtn.style.display = 'inline-block'; // Keep "See Result Now" visible
  finalResultContainer.style.display = 'none'; // Ensure final result is hidden
  resetUploadBtn.style.display = 'none';
  backToMainBtn.style.display = 'none';
  initialBackToMainBtn.style.display = 'none'; // Keep initial back button hidden
  finalNumericScore.style.display = 'none'; // Hide score display
}

/**
 * Function called when the 'See Final Result Now' button is clicked.
 * It will calculate and display the final score and end the current session.
 */
function seeResultNow() {
  // Check if any images have been classified yet
  if (friendshipScores.length === 0) {
      uploadResultText.textContent = "No images have been analyzed yet. Please upload at least one!";
      // Ensure initial upload elements are visible
      mainCuddlePredictorHeader.style.display = 'block';
      mainDescription.style.display = 'block';
      uploadInput.style.display = 'block';
      uploadInput.disabled = false; // Ensure input is enabled if no images classified yet
      uploadPreview.style.display = 'flex';
      classifyUploadBtn.style.display = 'none'; // HIDE Classify button as no image is loaded
      gameButtons.style.display = 'flex'; // Show gameButtons wrapper
      uploadNextImageBtn.style.display = 'none';
      seeResultNowBtn.style.display = 'none';
      // If no images, backToMainBtn (final result) should be hidden, initial one visible.
      finalResultContainer.style.display = 'none';
      resetUploadBtn.style.display = 'none';
      backToMainBtn.style.display = 'none';
      finalNumericScore.style.display = 'none'; // Hide score display

      initialBackToMainBtn.style.display = 'inline-block'; // Visible if no session started (still initial state)
      sessionStatusText.style.display = 'none';
      return;
  }

  // Hide all elements related to the active upload session
  uploadInput.style.display = 'none';
  uploadInput.disabled = true; // Disable input when going to final result
  classifyUploadBtn.style.display = 'none'; // HIDE Classify button permanently on result
  uploadNextImageBtn.style.display = 'none';
  seeResultNowBtn.style.display = 'none';
  sessionStatusText.style.display = 'none';
  uploadedImagePreview.style.display = 'none';
  uploadPlaceholder.style.display = 'none';
  uploadResultText.textContent = '';
  mainCuddlePredictorHeader.style.display = 'none';
  mainDescription.style.display = 'none';
  uploadPreview.style.display = 'none';
  gameButtons.style.display = 'none'; // Hide the general game buttons wrapper
  initialBackToMainBtn.style.display = 'none'; // Ensure initial back button is hidden
  finalNumericScore.style.display = 'block'; // Show score display when going to final result

  // Calculate and display the final score (which will show the final result container)
  calculateFinalFriendshipScore();
}


/**
 * Resets the entire upload mode screen for a fresh start, including session count and scores.
 */
function resetUploadMode() {
  // Reset game state variables
  uploadedImageCount = 0;
  friendshipScores = [];

  // Show only elements relevant to the initial upload screen
  mainCuddlePredictorHeader.style.display = 'block';
  mainDescription.style.display = 'block';
  uploadInput.style.display = 'block';
  uploadInput.disabled = false; // FIX: Explicitly re-enable the file input
  uploadPreview.style.display = 'flex'; // Show the picture window
  uploadedImagePreview.src = '';
  uploadedImagePreview.style.display = 'none';
  uploadPlaceholder.style.display = 'block';
  classifyUploadBtn.style.display = 'none'; // HIDE Classify button on reset/initial state
  classifyUploadBtn.disabled = true;
  uploadResultText.textContent = '';
  sessionStatusText.textContent = '';
  sessionStatusText.style.display = 'none';

  // Hide the final result container and clear its content
  finalResultContainer.style.display = 'none';
  finalResultImage.src = ''; // Clear final result image
  finalResultImage.style.display = 'none';
  finalResultMessage.textContent = '';
  resetUploadBtn.style.display = 'none'; // Hide reset button
  backToMainBtn.style.display = 'none'; // Hide final result back to main button
  finalNumericScore.textContent = ''; // Clear score text
  finalNumericScore.style.display = 'none'; // Hide score display

  // Hide game-specific buttons and show the NEW initial 'Back to Main Menu'
  gameButtons.style.display = 'flex'; // Ensure gameButtons wrapper is visible to display initial buttons
  uploadNextImageBtn.style.display = 'none';
  seeResultNowBtn.style.display = 'none';
  initialBackToMainBtn.style.display = 'inline-block'; // Make initial back button visible
}

/**
 * Calculates and displays the final friendship score based on all analyzed images.
 */
function calculateFinalFriendshipScore() {
  // Hide all elements related to the active upload session
  uploadInput.style.display = 'none';
  uploadInput.disabled = true; // Keep it disabled as session is over
  classifyUploadBtn.style.display = 'none';
  uploadNextImageBtn.style.display = 'none';
  seeResultNowBtn.style.display = 'none';
  sessionStatusText.style.display = 'none';
  uploadedImagePreview.style.display = 'none';
  uploadPlaceholder.style.display = 'none';
  uploadResultText.textContent = '';
  mainCuddlePredictorHeader.style.display = 'none';
  mainDescription.style.display = 'none';
  uploadPreview.style.display = 'none';
  gameButtons.style.display = 'none'; // Hide the general game buttons wrapper
  initialBackToMainBtn.style.display = 'none'; // Ensure initial back button is hidden


  // Show the final result section
  finalResultContainer.style.display = 'block';
  finalResultImage.style.display = 'block';
  // IMPORTANT: REPLACE with your image path (e.g., 'images/final_score_good.png')
  finalResultImage.src = 'assets/your_final_result_image.png';

  // Ensure 'Start New Session' and 'Back to Main' (final result version) are visible
  resetUploadBtn.style.display = 'inline-block';
  backToMainBtn.style.display = 'inline-block';

  let finalMessage = "";

  if (friendshipScores.length === 0) {
    finalMessage = "No images were classified in this session. Start a new one!";
    finalResultImage.style.display = 'none';
    finalResultMessage.textContent = finalMessage;
    finalNumericScore.style.display = 'none'; // Hide score if no images classified
    return;
  }

  const totalScore = friendshipScores.reduce((sum, score) => sum + score, 0);
  const averageScore = totalScore / friendshipScores.length;

  // Display the numeric score (as a percentage, rounded to nearest whole number)
  finalNumericScore.textContent = `${(averageScore * 100).toFixed(0)}% Friendliness Score`;
  finalNumericScore.style.display = 'block'; // Show the score display

  // --- Image Logic for Final Result ---
  // You should replace 'assets/your_final_result_image.png' with actual image paths
  // based on the averageScore for a more dynamic and engaging result.
  if (averageScore <= 0.25) {
      finalResultImage.src = 'assets/enemy_result.png'; // Example image for low score
  } else if (averageScore > 0.25 && averageScore <= 0.5) {
      finalResultImage.src = 'assets/okay_friend_result.png'; // Example image for medium-low score
  } else if (averageScore > 0.5 && averageScore <= 0.75) {
      finalResultImage.src = 'assets/new_friend_result.png'; // Example image for medium-high score
  } else if (averageScore > 0.75 && averageScore <= 1) {
      finalResultImage.src = 'assets/best_friends_result.png'; // Example image for high score
  } else {
      finalResultImage.src = 'assets/default_result.png'; // Fallback or unexpected (you might not need this if ranges cover all)
  }
  // --- End Image Logic ---

  if (uploadedImageCount === MAX_IMAGES_PER_SESSION && totalScore === MAX_IMAGES_PER_SESSION) {
      finalMessage = "We must be soulmates! Forget friends - we are destined for each other!";
  } else if (averageScore <= 0.25) {
      finalMessage = "No way we, are enemies! We could not be friends in a thousand years!";
  } else if (averageScore > 0.25 && averageScore <= 0.5) {
      finalMessage = "You seem to be okay but more than small talk will never be between us.";
  } else if (averageScore > 0.5 && averageScore <= 0.75) {
      finalMessage = "Hey I think. I found a new great friend.";
  } else if (averageScore > 0.75 && averageScore <= 1) {
      finalMessage = "We are best friends from now till the end of time! Love you!";
  } else {
      finalMessage = "An unexpected friendship outcome! Try more images?";
  }

  finalResultMessage.textContent = finalMessage;
}