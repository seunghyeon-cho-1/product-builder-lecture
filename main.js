class LottoBall extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const number = this.getAttribute('number');
    const color = this.getAttribute('color');

    const circle = document.createElement('div');
    circle.classList.add('lotto-number');
    circle.style.backgroundColor = color;
    circle.textContent = number;

    shadow.appendChild(circle);
  }
}

customElements.define('lotto-ball', LottoBall);


const generatorBtn = document.getElementById('generator-btn');
const lottoNumbersContainer = document.getElementById('lotto-numbers-container');
const themeToggleBtn = document.getElementById('theme-toggle');
const body = document.body;

// Check for saved user preference, if any, on load of the website
if (localStorage.getItem('theme') === 'dark') {
  body.classList.add('dark-mode');
  themeToggleBtn.textContent = 'Light Mode';
}

themeToggleBtn.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
  
  if (body.classList.contains('dark-mode')) {
    themeToggleBtn.textContent = 'Light Mode';
    localStorage.setItem('theme', 'dark');
  } else {
    themeToggleBtn.textContent = 'Dark Mode';
    localStorage.setItem('theme', 'light');
  }
});

generatorBtn.addEventListener('click', () => {
  lottoNumbersContainer.innerHTML = '';
  const numbers = new Set();
  while(numbers.size < 6) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }

  const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3'];

  Array.from(numbers).sort((a,b) => a-b).forEach((number, i) => {
    const lottoBall = document.createElement('lotto-ball');
    lottoBall.setAttribute('number', number);
    lottoBall.setAttribute('color', colors[i]);

    const ball = document.createElement("div");
    ball.classList.add("lotto-number");
    ball.style.backgroundColor = colors[i];
    ball.textContent = number;

    lottoNumbersContainer.appendChild(ball);
  });
});

// Dinner Menu Recommendation
const menuBtn = document.getElementById('menu-btn');
const menuResult = document.getElementById('menu-result');

const menus = [
    "Pizza", "Burger", "Sushi", "Pasta", "Salad", "Steak", 
    "Tacos", "Fried Chicken", "Ramen", "Curry", "Sandwich", "Bibimbap"
];

if (menuBtn && menuResult) {
    menuBtn.addEventListener('click', () => {
        const randomIndex = Math.floor(Math.random() * menus.length);
        menuResult.textContent = `How about ${menus[randomIndex]}?`;
        menuResult.style.animation = 'none';
        menuResult.offsetHeight; /* trigger reflow */
        menuResult.style.animation = 'fadeIn 0.5s ease-in-out';
    });
}


// Rock Paper Scissors - Teachable Machine
const URL = "https://teachablemachine.withgoogle.com/models/ZPK8R1W2J/";

let model, webcam, labelContainer, maxPredictions;

async function loadModel() {
    if (!model) {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
    }
}

async function initWebcam() {
    await loadModel();

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    setupLabelContainer();
}

function setupLabelContainer() {
    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = ""; // Clear existing labels
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }
}

async function loop() {
    webcam.update(); // update the webcam frame
    await predict(webcam.canvas);
    window.requestAnimationFrame(loop);
}

// run the image through the image model
async function predict(imageSource) {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(imageSource);
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + (prediction[i].probability * 100).toFixed(0) + "%";
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }
}

const rpsStartBtn = document.getElementById('rps-start-btn');
if (rpsStartBtn) {
    rpsStartBtn.addEventListener('click', () => {
        rpsStartBtn.disabled = true;
        rpsStartBtn.textContent = "Loading...";
        initWebcam().then(() => {
             rpsStartBtn.style.display = 'none';
             document.getElementById('rps-upload-btn').style.display = 'none';
             if (document.querySelector('.rps-controls span')) {
                 document.querySelector('.rps-controls span').style.display = 'none';
             }
        }).catch(err => {
            console.error(err);
            rpsStartBtn.disabled = false;
            rpsStartBtn.textContent = "Start Camera";
            alert("Failed to access camera or load model.");
        });
    });
}

// File Upload Logic
const rpsUploadBtn = document.getElementById('rps-upload-btn');
const rpsFileInput = document.getElementById('rps-file-input');
const rpsPreviewImg = document.getElementById('rps-preview-img');
const imagePreviewContainer = document.getElementById('image-preview-container');

if (rpsUploadBtn && rpsFileInput) {
    rpsUploadBtn.addEventListener('click', () => {
        rpsFileInput.click();
    });

    rpsFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            rpsPreviewImg.src = event.target.result;
            imagePreviewContainer.style.display = 'block';
            
            // If webcam is running, we might want to stop it, but for now let's just predict
            if (webcam) {
                // Not strictly necessary to stop webcam if we just want to show the file result
            }

            await loadModel();
            setupLabelContainer();
            
            // Wait for image to load to get dimensions correctly if needed, 
            // though tmImage handles image elements well.
            rpsPreviewImg.onload = async () => {
                await predict(rpsPreviewImg);
            };
        };
        reader.readAsDataURL(file);
    });
}

// SNS Share functionality
const shareTwitterBtn = document.getElementById('share-twitter');
const shareFacebookBtn = document.getElementById('share-facebook');
const copyLinkBtn = document.getElementById('copy-link-btn');

const pageUrl = window.location.href;
const pageTitle = document.title;

if (shareTwitterBtn) {
    shareTwitterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(pageTitle)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
    });
}

if (shareFacebookBtn) {
    shareFacebookBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;
        window.open(facebookUrl, '_blank', 'width=600,height=400');
    });
}

if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(pageUrl).then(() => {
            alert('Link copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy link: ', err);
            alert('Failed to copy link. Please copy it manually.');
        });
    });
}