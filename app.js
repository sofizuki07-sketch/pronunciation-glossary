const player = new Audio();
player.preload = "none";

const glossary = document.querySelector(".glossary");
const status = document.querySelector("#status");

let currentButton = null;

function finish(button, message) {
  if (button && button !== currentButton) return;

  currentButton?.removeAttribute("aria-busy");
  currentButton = null;
  status.textContent = message;
}

function speakWithBrowser(button) {
  if (!("speechSynthesis" in window)) {
    finish(button, "В этом браузере синтез речи недоступен.");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(button.dataset.word);
  utterance.lang = button.dataset.lang || "en-US";
  utterance.rate = 0.85;

  utterance.onend = () => {
    finish(button, `Завершено: ${button.dataset.word}`);
  };

  utterance.onerror = (event) => {
    if (event.error === "canceled" || event.error === "interrupted") return;
    finish(button, `Не удалось озвучить: ${button.dataset.word}`);
  };

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

async function playPronunciation(button) {
  player.pause();
  if (player.currentSrc) {
    player.currentTime = 0;
  }

  window.speechSynthesis?.cancel();

  if (currentButton && currentButton !== button) {
    currentButton.removeAttribute("aria-busy");
  }

  currentButton = button;
  button.setAttribute("aria-busy", "true");

  const word = button.dataset.word;
  const audioPath = button.dataset.audio?.trim();

  status.textContent = `Подготовка: ${word}`;

  if (!audioPath) {
    status.textContent = `Синтез речи: ${word}`;
    speakWithBrowser(button);
    return;
  }

  player.src = audioPath;

  try {
    await player.play();
    status.textContent = `Воспроизводится: ${word}`;
  } catch (error) {
    console.warn("Аудиофайл недоступен, используется TTS", error);
    status.textContent = `Файл недоступен. Синтез речи: ${word}`;
    speakWithBrowser(button);
  }
}

glossary.addEventListener("click", (event) => {
  const button = event.target.closest(".term-button");
  if (button) {
    playPronunciation(button);
  }
});

player.addEventListener("ended", () => {
  const word = currentButton?.dataset.word || "аудио";
  finish(currentButton, `Завершено: ${word}`);
});
