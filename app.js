const STREAM_URL = "https://embed.st/embed/admin/ppv-england-vs-argentina/3";

const playerFrame = document.querySelector("#playerFrame");
const playerOverlay = document.querySelector("#playerOverlay");
const startStreamBtn = document.querySelector("#startStream");
const btnFullscreen = document.querySelector("#btnFullscreen");
const btnRefresh = document.querySelector("#btnRefresh");
const btnShare = document.querySelector("#btnShare");
const toast = document.querySelector("#toast");
const themeToggle = document.querySelector("#themeToggle");

let streamStarted = false;

function showToast(msg, ms = 2200) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), ms);
}

function createPlayerIframe() {
  const iframe = document.createElement("iframe");
  iframe.title = "England vs Argentina Player";
  iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen";
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  iframe.setAttribute("scrolling", "no");
  return iframe;
}

function mountStream(url) {
  const old = playerFrame.querySelector("iframe");
  if (old) old.remove();

  const iframe = createPlayerIframe();
  playerFrame.insertBefore(iframe, playerOverlay);
  iframe.src = url;
  return iframe;
}

function startStream(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  if (streamStarted) return;
  streamStarted = true;

  mountStream(STREAM_URL);
  playerFrame.classList.add("playing");
  requestAnimationFrame(() => {
    setTimeout(() => playerOverlay.classList.add("hidden"), 80);
  });
}

function refreshStream(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  streamStarted = true;
  playerFrame.classList.add("playing");
  playerOverlay.classList.add("hidden");
  mountStream(STREAM_URL);
  showToast("Stream reloaded");
}

async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      await playerFrame.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch {
    showToast("Fullscreen not available");
  }
}

async function shareMatch() {
  const data = {
    title: "England vs Argentina Live",
    text: "England vs Argentina live stream",
    url: window.location.href,
  };
  try {
    if (navigator.share) {
      await navigator.share(data);
    } else {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Link copied");
    }
  } catch {
    /* cancelled */
  }
}

function initTheme() {
  if (localStorage.getItem("fifawatch-theme") === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  }
}

function toggleTheme() {
  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  if (isLight) {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("fifawatch-theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("fifawatch-theme", "light");
  }
}

startStreamBtn?.addEventListener("click", startStream);
startStreamBtn?.addEventListener("auxclick", (e) => e.preventDefault());
btnFullscreen?.addEventListener("click", toggleFullscreen);
btnRefresh?.addEventListener("click", refreshStream);
btnShare?.addEventListener("click", shareMatch);
themeToggle?.addEventListener("click", toggleTheme);
playerFrame?.addEventListener("dblclick", (e) => {
  if (!streamStarted) return;
  if (e.target.closest("button")) return;
  toggleFullscreen();
});

document.addEventListener("keydown", (e) => {
  if (e.target.matches("input, textarea")) return;
  if (e.key === "f" || e.key === "F") {
    e.preventDefault();
    toggleFullscreen();
  }
});

initTheme();

if (new URLSearchParams(location.search).get("autoplay") === "1") {
  startStream();
}
