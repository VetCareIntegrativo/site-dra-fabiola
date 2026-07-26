// Menu mobile
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const body = document.body;

function closeMenu() {
  menuToggle.classList.remove("is-active");
  navLinks.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  body.classList.remove("menu-open");
}

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("is-open");

  menuToggle.classList.toggle("is-active", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  body.classList.toggle("menu-open", isOpen);
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

// Rolagem suave
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const targetId = anchor.getAttribute("href");
    const target = document.querySelector(targetId);

    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// Player flutuante
const floatingExperience = document.querySelector(".floating-experience");
const experienceCard = document.querySelector(".experience-card");
const experienceControl = document.querySelector(".experience-control");
const experienceModal = document.querySelector(".experience-modal");
const experienceModalClose = document.querySelector(".experience-modal-close");
const experienceModalControl = document.querySelector(".experience-modal-control");
const experienceAudio = document.querySelector(".experience-audio");
const mobileExperienceQuery = window.matchMedia("(max-width: 620px)");
let audioContext;
let ambientOscillator;
let ambientGain;

function startAmbientPreview() {
  if (ambientOscillator) {
    return;
  }

  const BrowserAudioContext = window.AudioContext || window.webkitAudioContext;

  if (!BrowserAudioContext) {
    return;
  }

  audioContext = audioContext || new BrowserAudioContext();

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  ambientOscillator = audioContext.createOscillator();
  ambientGain = audioContext.createGain();

  ambientOscillator.type = "sine";
  ambientOscillator.frequency.value = 220;
  ambientGain.gain.value = 0.04;

  ambientOscillator.connect(ambientGain);
  ambientGain.connect(audioContext.destination);
  ambientOscillator.start();
}

function stopAmbientPreview() {
  if (!ambientOscillator) {
    return;
  }

  ambientOscillator.stop();
  ambientOscillator.disconnect();
  ambientGain.disconnect();
  ambientOscillator = null;
  ambientGain = null;
}

function updateExperienceState(isPlaying, statusText) {
  const status = experienceCard.querySelector(".experience-status");
  const controlIcon = experienceControl.querySelector(".control-icon");

  floatingExperience.classList.toggle("is-playing", isPlaying);
  status.textContent = statusText || (isPlaying ? "Musica tocando" : "Clique no botao para tocar");
  controlIcon.textContent = isPlaying ? "PAUSAR" : "PLAY";
  experienceControl.setAttribute("aria-label", isPlaying ? "Pausar audio" : "Tocar audio");
  experienceModalControl.textContent = isPlaying ? "Pausar audio" : "Tocar audio";
}

async function playExperienceAudio(allowFallback = true) {
  try {
    stopAmbientPreview();
    experienceAudio.volume = 0.65;
    experienceAudio.muted = false;
    await experienceAudio.play();
    updateExperienceState(true, "Musica tocando");
  } catch {
    if (allowFallback) {
      startAmbientPreview();
      updateExperienceState(true, "Executando previa");
      return;
    }

    updateExperienceState(false, "Clique no botao laranja");
  }
}

function pauseExperienceAudio() {
  experienceAudio.pause();
  stopAmbientPreview();
  updateExperienceState(false, "Audio pausado");
}

function toggleExperienceAudio() {
  if (floatingExperience.classList.contains("is-playing")) {
    pauseExperienceAudio();
    return;
  }

  playExperienceAudio(true);
}

function openExperienceModal() {
  experienceModal.classList.add("is-open");
  experienceModal.setAttribute("aria-hidden", "false");
  floatingExperience.classList.add("is-expanded");
}

function closeExperienceModal() {
  experienceModal.classList.remove("is-open");
  experienceModal.setAttribute("aria-hidden", "true");
  floatingExperience.classList.remove("is-expanded");
  pauseExperienceAudio();
}

if (experienceCard && floatingExperience && experienceControl && experienceModal && experienceModalClose && experienceModalControl && experienceAudio) {
  experienceAudio.load();
  updateExperienceState(false, "Tentando iniciar audio");
  playExperienceAudio(false);

  window.addEventListener("load", () => {
    playExperienceAudio(false);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pauseExperienceAudio();
    }
  });

  window.addEventListener("pagehide", pauseExperienceAudio);
  window.addEventListener("blur", pauseExperienceAudio);

  experienceCard.addEventListener("click", (event) => {
    if (event.target.closest(".experience-control")) {
      return;
    }

    openExperienceModal();
  });

  experienceCard.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openExperienceModal();
    }
  });

  experienceControl.addEventListener("click", (event) => {
    event.stopPropagation();
    const isPlaying = floatingExperience.classList.contains("is-playing");

    if (mobileExperienceQuery.matches && !isPlaying) {
      openExperienceModal();
    }

    toggleExperienceAudio();
  });

  experienceModalControl.addEventListener("click", toggleExperienceAudio);
  experienceModalClose.addEventListener("click", closeExperienceModal);

  experienceModal.addEventListener("click", (event) => {
    if (event.target === experienceModal) {
      closeExperienceModal();
    }
  });
}
