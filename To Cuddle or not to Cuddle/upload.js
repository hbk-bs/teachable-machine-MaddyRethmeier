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
  resetUploadMode();
}

/**
 * Ensures the DOM is fully loaded before setting up event listeners.
 */
window.onload = function () {
  preload(); // Start preloading the model
  setupUploadModeListeners(); // Set up upload mode event listeners
};

/**
 * Initializes upload mode by setting up button event listeners.
 */
function setupUploadModeListeners() {
  document.getElementById('uploadInput').addEventListener('change', handleImageUpload);
  document.getElementById('classifyUploadBtn').addEventListener('click', classifyUploadedImage);
  document.getElementById('uploadNextImageBtn').addEventListener('click', uploadNextImage);
  document.getElementById('seeResultNowBtn').addEventListener('click', seeResultNow);
  document.getElementById('resetUploadBtn').addEventListener('click', resetUploadMode); // This button is now inside finalResultContainer
  document.getElementById('backToMainBtn').addEventListener('click', () => { // This button is now inside finalResultContainer
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
  const uploadedImagePreview = document.getElementById('uploadedImagePreview');
  const uploadPlaceholder = document.getElementById('uploadPlaceholder');
  const classifyUploadBtn = document.getElementById('classifyUploadBtn');
  const uploadResultText = document.getElementById('uploadResultText');
  const sessionStatusText = document.getElementById('sessionStatus');
  const uploadNextImageBtn = document.getElementById('uploadNextImageBtn');
  const seeResultNowBtn = document.getElementById('seeResultNowBtn');
  const resetUploadBtn = document.getElementById('resetUploadBtn');
  const backToMainBtn = document.getElementById('backToMainBtn');
  const finalResultContainer = document.getElementById('finalResultContainer');
  const mainCuddlePredictorHeader = document.getElementById('mainCuddlePredictorHeader');
  const mainDescription = document.getElementById('mainDescription');
  const uploadInput = document.getElementById('uploadInput');
  const uploadPreview = document.getElementById('uploadPreview');
  const gameButtons = document.getElementById('gameButtons');


  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      // Show upload elements
      mainCuddlePredictorHeader.style.display = 'block';
      mainDescription.style.display = 'block';
      uploadInput.style.display = 'block';
      uploadPreview.style.display = 'flex'; // Use flex for centering preview
      uploadedImagePreview.src = e.target.result;
      uploadedImagePreview.style.display = 'block';
      uploadPlaceholder.style.display = 'none';
      classifyUploadBtn.style.display = 'inline-block';
      gameButtons.style.display = 'flex'; // Show the game buttons wrapper

      // Hide result and irrelevant buttons
      finalResultContainer.style.display = 'none'; 
      resetUploadBtn.style.display = 'none'; // Hidden when not on final result page
      backToMainBtn.style.display = 'none'; // Hidden when not on final result page

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
    uploadPreview.style.display = 'flex';
    uploadedImagePreview.src = '';
    uploadedImagePreview.style.display = 'none';
    uploadPlaceholder.style.display = 'block';
    classifyUploadBtn.style.display = 'inline-block';
    gameButtons.style.display = 'flex'; // Show game buttons wrapper

    // Hide result and specific buttons
    finalResultContainer.style.display = 'none';
    uploadNextImageBtn.style.display = 'none';
    seeResultNowBtn.style.display = 'none';
    resetUploadBtn.style.display = 'none'; // Hidden when not on final result page
    backToMainBtn.style.display = 'inline-block'; // Only this one is visible on initial/cancelled state


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
  const uploadedImagePreview = document.getElementById('uploadedImagePreview');
  const classifyUploadBtn = document.getElementById('classifyUploadBtn');
  const uploadResultText = document.getElementById('uploadResultText');
  const uploadInput = document.getElementById('uploadInput');
  const uploadNextImageBtn = document.getElementById('uploadNextImageBtn');
  const seeResultNowBtn = document.getElementById('seeResultNowBtn');
  const resetUploadBtn = document.getElementById('resetUploadBtn');
  const backToMainBtn = document.getElementById('backToMainBtn');
  const sessionStatusText = document.getElementById('sessionStatus');
  const mainCuddlePredictorHeader = document.getElementById('mainCuddlePredictorHeader');
  const mainDescription = document.getElementById('mainDescription');
  const uploadPreview = document.getElementById('uploadPreview');
  const gameButtons = document.getElementById('gameButtons');

  if (!uploadedImagePreview.src || uploadedImagePreview.style.display === 'none') {
    uploadResultText.textContent = "Please upload an image first!";
    return;
  }

  // Hide upload input and classify button during classification
  classifyUploadBtn.disabled = true;
  uploadInput.disabled = true;
  uploadInput.style.display = 'none';
  classifyUploadBtn.style.display = 'none';
  
  // Hide game action buttons temporarily
  gameButtons.style.display = 'none'; // Hide the whole wrapper
  resetUploadBtn.style.display = 'none'; // Ensure these are hidden
  backToMainBtn.style.display = 'none'; // Ensure these are hidden


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
  const uploadResultText = document.getElementById('uploadResultText');
  const classifyUploadBtn = document.getElementById('classifyUploadBtn');
  const uploadInput = document.getElementById('uploadInput');
  const uploadNextImageBtn = document.getElementById('uploadNextImageBtn');
  const seeResultNowBtn = document.getElementById('seeResultNowBtn');
  const resetUploadBtn = document.getElementById('resetUploadBtn');
  const backToMainBtn = document.getElementById('backToMainBtn');
  const sessionStatusText = document.getElementById('sessionStatus');
  const finalResultContainer = document.getElementById('finalResultContainer');
  const mainCuddlePredictorHeader = document.getElementById('mainCuddlePredictorHeader');
  const mainDescription = document.getElementById('mainDescription');
  const gameButtons = document.getElementById('gameButtons');

  if (error) {
    console.error("UPLOAD CLASSIFICATION ERROR:", error);
    uploadResultText.textContent = "Error classifying image. Please try another.";
    // Re-enable elements for retry
    classifyUploadBtn.disabled = false;
    uploadInput.disabled = false;
    uploadInput.style.display = 'block';
    classifyUploadBtn.style.display = 'inline-block';

    // Show initial buttons or allow user to reset
    gameButtons.style.display = 'flex';
    uploadNextImageBtn.style.display = 'none'; // Not ready for next image yet
    seeResultNowBtn.style.display = 'none'; // Not ready for result yet
    resetUploadBtn.style.display = 'inline-block'; // Allow user to start over
    backToMainBtn.style.display = 'inline-block'; // Allow user to go back
    
    finalResultContainer.style.display = 'none'; // Ensure final result is hidden on error
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

    finalResultContainer.style.display = 'none'; 

    sessionStatusText.textContent = `Analyzed ${uploadedImageCount} of ${MAX_IMAGES_PER_SESSION} images.`;

    // Show relevant buttons based on progress
    if (uploadedImageCount < MAX_IMAGES_PER_SESSION) {
      gameButtons.style.display = 'flex'; // Show the wrapper
      uploadNextImageBtn.style.display = 'inline-block';
      if (uploadedImageCount > 0) { 
          seeResultNowBtn.style.display = 'inline-block'; 
      } else {
          seeResultNowBtn.style.display = 'none';
      }
      resetUploadBtn.style.display = 'none'; // These buttons are for the final result state
      backToMainBtn.style.display = 'none';
      mainCuddlePredictorHeader.style.display = 'block';
      mainDescription.style.display = 'block';
      uploadInput.style.display = 'block'; // Ensure input is visible for next upload
      classifyUploadBtn.style.display = 'inline-block'; // Ensure classify button is visible
      classifyUploadBtn.disabled = true; // Disabled until new file chosen
    } else {
      // Session complete (MAX_IMAGES_SESSION reached)
      gameButtons.style.display = 'none'; // Hide current session buttons
      uploadInput.style.display = 'none';
      classifyUploadBtn.style.display = 'none';
      seeResultNowBtn.style.display = 'none';
      
      sessionStatusText.textContent = `All ${MAX_IMAGES_PER_SESSION} images analyzed!`;
      calculateFinalFriendshipScore(); // Immediately show final score
    }

  } else {
    uploadResultText.textContent = "Could not classify the image. Please try another.";
    classifyUploadBtn.disabled = false;
    uploadInput.disabled = false;
    uploadInput.style.display = 'block';
    classifyUploadBtn.style.display = 'inline-block';
    
    gameButtons.style.display = 'flex'; // Show game buttons wrapper
    resetUploadBtn.style.display = 'inline-block'; // Allow user to start over
    backToMainBtn.style.display = 'inline-block'; // Allow user to go back
    seeResultNowBtn.style.display = 'none'; 
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
  const uploadedImagePreview = document.getElementById('uploadedImagePreview');
  const uploadPlaceholder = document.getElementById('uploadPlaceholder');
  const uploadInput = document.getElementById('uploadInput');
  const classifyUploadBtn = document.getElementById('classifyUploadBtn');
  const uploadResultText = document.getElementById('uploadResultText');
  const uploadNextImageBtn = document.getElementById('uploadNextImageBtn');
  const seeResultNowBtn = document.getElementById('seeResultNowBtn');
  const resetUploadBtn = document.getElementById('resetUploadBtn');
  const backToMainBtn = document.getElementById('backToMainBtn');
  const sessionStatusText = document.getElementById('sessionStatus');
  const finalResultContainer = document.getElementById('finalResultContainer');
  const mainCuddlePredictorHeader = document.getElementById('mainCuddlePredictorHeader');
  const mainDescription = document.getElementById('mainDescription');
  const uploadPreview = document.getElementById('uploadPreview');
  const gameButtons = document.getElementById('gameButtons');

  // Show upload elements for next image
  uploadedImagePreview.src = '';
  uploadedImagePreview.style.display = 'none';
  uploadPlaceholder.style.display = 'block';
  uploadInput.value = ''; 
  uploadInput.style.display = 'block'; 
  uploadInput.disabled = false;
  classifyUploadBtn.disabled = true; 
  classifyUploadBtn.style.display = 'inline-block'; 
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
  resetUploadBtn.style.display = 'none'; // Not for this state
  backToMainBtn.style.display = 'none'; // Not for this state

  finalResultContainer.style.display = 'none'; // Ensure final result is hidden
}

/**
 * Function called when the 'See Final Result Now' button is clicked.
 * It will calculate and display the final score and end the current session.
 */
function seeResultNow() {
  const uploadResultText = document.getElementById('uploadResultText');
  const mainCuddlePredictorHeader = document.getElementById('mainCuddlePredictorHeader');
  const mainDescription = document.getElementById('mainDescription');
  const uploadInput = document.getElementById('uploadInput');
  const uploadPreview = document.getElementById('uploadPreview');
  const classifyUploadBtn = document.getElementById('classifyUploadBtn');
  const gameButtons = document.getElementById('gameButtons');
  const sessionStatusText = document.getElementById('sessionStatus');

  // Check if any images have been classified yet
  if (friendshipScores.length === 0) {
      uploadResultText.textContent = "No images have been analyzed yet. Please upload at least one!";
      // Ensure initial upload elements are visible
      mainCuddlePredictorHeader.style.display = 'block';
      mainDescription.style.display = 'block';
      uploadInput.style.display = 'block';
      uploadPreview.style.display = 'flex';
      classifyUploadBtn.style.display = 'inline-block';
      classifyUploadBtn.disabled = true; 
      gameButtons.style.display = 'flex';
      document.getElementById('uploadNextImageBtn').style.display = 'none';
      document.getElementById('seeResultNowBtn').style.display = 'none';
      document.getElementById('resetUploadBtn').style.display = 'none'; // For final result, not here
      document.getElementById('backToMainBtn').style.display = 'inline-block'; // Back to main is always an option
      document.getElementById('finalResultContainer').style.display = 'none'; 
      sessionStatusText.style.display = 'none';
      return;
  }

  // Hide all elements related to the active upload session
  mainCuddlePredictorHeader.style.display = 'none';
  mainDescription.style.display = 'none';
  uploadInput.style.display = 'none';
  uploadPreview.style.display = 'none'; // Hide the picture window
  classifyUploadBtn.style.display = 'none';
  gameButtons.style.display = 'none'; // Hide the current session buttons wrapper
  sessionStatusText.style.display = 'none';
  uploadResultText.textContent = '';

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

  // Get all relevant elements
  const uploadedImagePreview = document.getElementById('uploadedImagePreview');
  const uploadPlaceholder = document.getElementById('uploadPlaceholder');
  const uploadInput = document.getElementById('uploadInput');
  const classifyUploadBtn = document.getElementById('classifyUploadBtn');
  const uploadResultText = document.getElementById('uploadResultText');
  const uploadNextImageBtn = document.getElementById('uploadNextImageBtn');
  const seeResultNowBtn = document.getElementById('seeResultNowBtn');
  const resetUploadBtn = document.getElementById('resetUploadBtn');
  const backToMainBtn = document.getElementById('backToMainBtn');
  const sessionStatusText = document.getElementById('sessionStatus');
  const finalResultContainer = document.getElementById('finalResultContainer');
  const finalResultImage = document.getElementById('finalResultImage');
  const finalResultMessage = document.getElementById('finalResultMessage');
  const mainCuddlePredictorHeader = document.getElementById('mainCuddlePredictorHeader');
  const mainDescription = document.getElementById('mainDescription');
  const uploadPreview = document.getElementById('uploadPreview');
  const gameButtons = document.getElementById('gameButtons');

  // Show only elements relevant to the initial upload screen
  mainCuddlePredictorHeader.style.display = 'block';
  mainDescription.style.display = 'block';
  uploadInput.style.display = 'block';
  uploadPreview.style.display = 'flex'; // Show the picture window
  uploadedImagePreview.src = '';
  uploadedImagePreview.style.display = 'none';
  uploadPlaceholder.style.display = 'block';
  classifyUploadBtn.style.display = 'inline-block';
  classifyUploadBtn.disabled = true; 
  uploadResultText.textContent = '';
  sessionStatusText.textContent = '';
  sessionStatusText.style.display = 'none';

  // Hide the final result container and clear its content
  finalResultContainer.style.display = 'none'; 
  finalResultImage.src = ''; 
  finalResultImage.style.display = 'none'; 
  finalResultMessage.textContent = ''; 

  // Hide all buttons that are not 'Back to Main' in the initial state
  gameButtons.style.display = 'flex'; // Show the game buttons wrapper
  uploadNextImageBtn.style.display = 'none'; 
  seeResultNowBtn.style.display = 'none';
  // These two are now managed by the final result container's button-group, so they should be hidden here.
  resetUploadBtn.style.display = 'none'; 
  backToMainBtn.style.display = 'inline-block'; // Back to Main is always visible on reset/initial
}

/**
 * Calculates and displays the final friendship score based on all analyzed images.
 */
function calculateFinalFriendshipScore() {
  // Hide all elements related to the active upload session
  document.getElementById('uploadInput').style.display = 'none';
  document.getElementById('classifyUploadBtn').style.display = 'none';
  document.getElementById('uploadNextImageBtn').style.display = 'none';
  document.getElementById('seeResultNowBtn').style.display = 'none';
  document.getElementById('sessionStatus').style.display = 'none';
  document.getElementById('uploadedImagePreview').style.display = 'none';
  document.getElementById('uploadPlaceholder').style.display = 'none';
  document.getElementById('uploadResultText').textContent = '';
  document.getElementById('mainCuddlePredictorHeader').style.display = 'none'; // Hide main H1
  document.getElementById('mainDescription').style.display = 'none'; // Hide description
  document.getElementById('uploadPreview').style.display = 'none'; // Hide the picture window
  document.getElementById('gameButtons').style.display = 'none'; // Hide the general game buttons wrapper


  // Get references to the final result elements
  const finalResultContainer = document.getElementById('finalResultContainer');
  const finalResultImage = document.getElementById('finalResultImage');
  const finalResultMessage = document.getElementById('finalResultMessage');
  const resetUploadBtn = document.getElementById('resetUploadBtn');
  const backToMainBtn = document.getElementById('backToMainBtn');

  // Show the final result section
  finalResultContainer.style.display = 'block';
  finalResultImage.style.display = 'block'; 
  finalResultImage.src = 'assets/your_final_result_image.png'; // <--- IMPORTANT: REPLACE with your image path (e.g., 'images/final_score_good.png')

  // Ensure 'Start New Session' and 'Back to Main' are visible (they are now inside finalResultContainer)
  resetUploadBtn.style.display = 'inline-block';
  backToMainBtn.style.display = 'inline-block';

  let finalMessage = "";

  if (friendshipScores.length === 0) {
    finalMessage = "No images were classified in this session. Start a new one!";
    finalResultImage.style.display = 'none'; 
    finalResultMessage.textContent = finalMessage;
    return;
  }

  const totalScore = friendshipScores.reduce((sum, score) => sum + score, 0);
  const averageScore = totalScore / friendshipScores.length;

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