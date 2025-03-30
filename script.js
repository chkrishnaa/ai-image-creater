const themeToggle = document.querySelector(".theme-toggle");
const promptForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");
const promptBtn = document.querySelector(".prompt-btn");
const generateBtn = document.querySelector(".generate-btn");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const gridGallery = document.querySelector(".gallery-grid");

const examplePrompts = [
  "A magic forest with glowing plants and fairy homes among giant mushrooms",
  "An old steampunk airship floating through golden clouds at sunset",
  "A future Mars colony with glass domes and gardens against red mountains",
  "A dragon sleeping on gold coins in a crystal cave",
  "An underwater kingdom with people and glowing coral buildings",
  "A floating island with waterfalls pouring into clouds below",
  "A witch's cottage in fall with magic herbs in the garden",
  "A robot painting in a sunny studio with art supplies around it",
  "A magical library with floating glowing books and spiral staircases",
  "A Japanese shrine during cherry blossom season with lanterns and misty mountains",
  "A cozy treehouse hidden in an ancient enchanted forest",
  "A cyberpunk alley glowing with neon signs and holograms",
  "A medieval castle floating in the sky with waterfalls cascading down",
  "A ghostly ship sailing through a stormy sea at night",
  "A futuristic city built on top of giant walking robots",
  "A lighthouse on a tiny island surrounded by glowing jellyfish",
  "A tiny fairy market hidden inside a hollow tree",
  "A secret garden filled with giant colorful flowers and fireflies",
  "A Viking village covered in snow under the northern lights",
  "A candy land with chocolate rivers and candy cane trees",
  "A clock tower with massive gears and floating golden lights",
  "A crystal kingdom deep inside an icy mountain",
  "A samurai warrior standing on a cliff under a full moon",
  "A mermaid village built inside giant seashells",
  "A phoenix rising from flames in an ancient temple",
  "A flying whale carrying a city on its back",
  "A tiny mouse knight battling a fearsome cat dragon",
  "A glowing portal hidden inside an old abandoned library",
  "A hidden fairy village inside a giant pumpkin",
  "A pirate cove with glowing treasure chests and hidden caves",
  "A giant tortoise carrying an entire forest on its back",
  "A dark wizard’s tower crackling with purple lightning",
  "A post-apocalyptic city overgrown with plants and wildlife",
  "A space station orbiting a planet with rings made of ice",
  "A tiny planet covered in mushrooms and floating rocks",
  "A glowing blue wolf howling under a sky full of stars",
  "A time traveler’s workshop filled with strange gadgets",
  "A frozen waterfall leading to a secret ice cave",
  "A giant library inside a dragon’s cave with ancient scrolls",
  "A futuristic hover train speeding through a neon-lit city",
  "A peaceful Zen garden floating in the clouds",
  "A robot chef cooking a feast in a sci-fi kitchen",
  "A mystical moonlit lake with glowing lotus flowers",
  "A haunted mansion with floating candles and ghostly whispers",
  "A glowing alien jungle filled with strange plants and creatures",
  "A fairy sitting on a mushroom, playing a tiny violin",
  "A glowing magical sword stuck in a stone in a forgotten temple",
  "A lost civilization hidden deep in the jungle, covered in vines",
  "A massive jellyfish floating through the sky like a balloon",
  "A snowy owl soaring over a frozen landscape with a magical glow",
];

const API_KEY = "YOUR_API_KEY";
(() => {
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  const isDarkTheme =
    savedTheme === "dark" || (!savedTheme && systemPrefersDark);

  document.body.classList.toggle("dark-theme", isDarkTheme);

  themeToggle.querySelector("i").className = isDarkTheme
    ? "fa-solid fa-sun"
    : "fa-solid fa-moon";
})();

const toggleTheme = () => {
  const isDarkTheme = document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", isDarkTheme ? "dark" : "light");

  themeToggle.querySelector("i").className = isDarkTheme
    ? "fa-solid fa-sun"
    : "fa-solid fa-moon";
};

const handleFormSubmit = (e) => {
  e.preventDefault();

  if (!modelSelect || !countSelect || !ratioSelect || !promptInput) {
    console.error("One or more elements are missing!");
    return;
  }

  const selectModel = modelSelect.value;
  const imageCount = parseInt(countSelect.value) || 1;
  const aspectRatio = ratioSelect.value || "1/1";
  const promptText = promptInput.value.trim();

  createImageCards(selectModel, imageCount, aspectRatio, promptText);
};

const createImageCards = (selectModel, imageCount, aspectRatio, promptText) => {
  gridGallery.innerHTML = "";
  for (let i = 0; i < imageCount; i++) {
    gridGallery.innerHTML += `<div class="img-card loading" id="img-card-${i}" style="aspect-ratio: ${aspectRatio}">
      <div class="status-container">
        <div class="spinner"></div>
        <i class="fa-solid fa-triangle-exclamation"></i>
        <p class="status-text">Generating...</p>
      </div>
    </div>`;
  }
  generateImages(selectModel, imageCount, aspectRatio, promptText);
};

const getImageDimensions = (aspectRatio, baseSize = 512) => {
  const [width, height] = aspectRatio.split("/").map(Number);
  const scaleFactor = baseSize / Math.sqrt(width * height);

  let calculatedWidth = Math.round(width * scaleFactor);
  let calculatedHeight = Math.round(height * scaleFactor);

  calculatedWidth = Math.floor(calculatedWidth / 16) * 16;
  calculatedHeight = Math.floor(calculatedHeight / 16) * 16;

  return { width: calculatedWidth, height: calculatedHeight };
};

const generateImages = async (
  selectModel,
  imageCount,
  aspectRatio,
  promptText
) => {
  const MODEL_URL = `https://api-inference.huggingface.co/models/${selectModel}`;
  const { width, height } = getImageDimensions(aspectRatio);
  generateBtn.setAttribute("disabled", "true");

  const imagePromises = Array.from({ length: imageCount }, async (_, i) => {
    try {
      const response = await fetch(MODEL_URL, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "x-use-cache": "false",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: promptText,
          parameters: { width, height },
          // options:{wait_for_model: true, user_cache: false},
        }),
      });

      if (!response.ok) throw new Error((await response.json)?.error);

      const result = await response.blob();
      updateImageCard(i, URL.createObjectURL(result));
    } catch (error) {
      console.log(error);
      const imgCard = document.getElementById(`img-card-${i}`);
      imgCard.classList.replace("loading", "error");
      imgCard.querySelector(".status-text").textContent =
        "Oops!!! Generation failed!\nCheck console for more details.";
    }
  });

  await Promise.allSettled(imagePromises);
  generateBtn.removeAttribute("disabled");
};

const updateImageCard = (imgIndex, imgUrl) => {
  const imgCard = document.getElementById(`img-card-${imgIndex}`);

  if (!imgCard) return;

  imgCard.classList.remove("loading");
  imgCard.innerHTML = `              <img src="${imgUrl}" alt="boy image" class="result-img" />
              <div class="img-overlay">
                <a href="${imgUrl}" class="img-download-btn" download="${Date.now()}.png">
                  <i class="fa-solid fa-download"></i>
                </a>
              </div>`;
};

promptBtn.addEventListener("click", () => {
  const prompt =
    examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
  promptInput.value = prompt;
  promptInput.focus();
});

promptForm.addEventListener("submit", handleFormSubmit);
themeToggle.addEventListener("click", toggleTheme);
