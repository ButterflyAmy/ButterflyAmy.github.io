import { characters } from "./data.js";

const homeView = document.getElementById("homeView");
const characterView = document.getElementById("characterView");
const cardsGrid = document.getElementById("cardsGrid");
const searchInput = document.getElementById("searchInput");
const filterChips = document.getElementById("filterChips");
const emptyState = document.getElementById("emptyState");
const favoritesList = document.getElementById("favoritesList");
const favoritesEmpty = document.getElementById("favoritesEmpty");
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const cursorGlow = document.getElementById("cursorGlow");
const sparkles = document.getElementById("sparkles");

/* =========================
   NEW CUSTOM CURSOR
   ========================= */
const themeCursor = document.createElement("div");
themeCursor.className = "theme-cursor";
document.body.appendChild(themeCursor);

const themeFxHearts = document.getElementById("themeFxHearts");
const themeFxStreaks = document.getElementById("themeFxStreaks");
const themeFxGrid = document.getElementById("themeFxGrid");
const themeFxBubbles = document.getElementById("themeFxBubbles");

const goHomeBtn = document.getElementById("goHomeBtn");
const showFavoritesBtn = document.getElementById("showFavoritesBtn");
const showRecentBtn = document.getElementById("showRecentBtn");
const surpriseSidebarBtn = document.getElementById("surpriseSidebarBtn");
const browseArchiveBtn = document.getElementById("browseArchiveBtn");
const surpriseMeBtn = document.getElementById("surpriseMeBtn");
const shuffleAllMusicBtn = document.getElementById("shuffleAllMusicBtn");
const changeThemeBtn = document.getElementById("changeThemeBtn");
const themeCycleCard = document.getElementById("themeCycleCard");
const themeName = document.getElementById("themeName");
const themePalette = document.getElementById("themePalette");
const homeHero = document.getElementById("homeHero");
const profilesSection = document.getElementById("profilesSection");
const sortSelect = document.getElementById("sortSelect");
const profileCount = document.getElementById("profileCount");

const mainMusic = document.getElementById("mainMusic");
const toggleMainMusicBtn = document.getElementById("toggleMainMusicBtn");

const audioPlayer = document.getElementById("audioPlayer");
const playerTrackTitle = document.getElementById("playerTrackTitle");
const playerTrackMeta = document.getElementById("playerTrackMeta");
const playPauseBtn = document.getElementById("playPauseBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const stopBtn = document.getElementById("stopBtn");
const progressBar = document.getElementById("progressBar");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");
const volumeBar = document.getElementById("volumeBar");

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxClose = document.getElementById("lightboxClose");

let currentFilter = "all";
let favoritesOnly = false;
let currentCharacterSlug = null;
let currentTrackIndex = null;
let currentPlaylist = [];
let mainMusicPlaying = false;
let currentSort = "default";

const favoriteKey = "dreamArchiveFavorites";
const recentKey = "dreamArchiveRecent";
const themeKey = "dreamArchiveTheme";

let favorites = JSON.parse(localStorage.getItem(favoriteKey) || "[]");
let recentViewed = JSON.parse(localStorage.getItem(recentKey) || "[]");
let currentTheme =
  localStorage.getItem(themeKey) || "pink-glitter-dream";

const themes = [
  {
    id: "pink-glitter-dream",
    name: "Pink Dream",
    palette: "soft glam / hearts / dreamy glow",
    sparkles: 36
  },
  {
    id: "neon-pink-night",
    name: "Neon Pink Night",
    palette: "night city / light streaks / glossy neon",
    sparkles: 18
  },
  {
    id: "cyber-cold-neon",
    name: "Cyber Cold Neon",
    palette: "hologrid / scanlines / sharp future",
    sparkles: 12
  },
  {
    id: "deep-siren",
    name: "Deep Siren",
    palette: "water glow / bubbles / sea glass dream",
    sparkles: 22
  },
  {
  id: "dreamcore",
  name: "Dreamcore",
  palette: "liminal glow / soft nostalgia / blurry memory",
  sparkles: 14
  }
];

function saveFavorites() {
  localStorage.setItem(favoriteKey, JSON.stringify(favorites));
}

function saveRecent() {
  localStorage.setItem(recentKey, JSON.stringify(recentViewed));
}

function saveTheme() {
  localStorage.setItem(themeKey, currentTheme);
}

function getCharacterBySlug(slug) {
  return characters.find(c => c.slug === slug);
}

function isFavorite(slug) {
  return favorites.includes(slug);
}

function addRecent(slug) {
  recentViewed = [slug, ...recentViewed.filter(x => x !== slug)].slice(
    0,
    8
  );
  saveRecent();
}

function toggleFavorite(slug) {
  if (isFavorite(slug)) {
    favorites = favorites.filter(x => x !== slug);
  } else {
    favorites.push(slug);
  }

  saveFavorites();
  renderFavorites();
  renderCards();

  if (currentCharacterSlug === slug) {
    renderCharacterPage(slug);
  }
}

function formatTime(seconds) {
  if (!isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function renderFavorites() {
  favoritesList.innerHTML = "";

  const items = favorites
    .map(slug => getCharacterBySlug(slug))
    .filter(Boolean);

  favoritesEmpty.style.display = items.length ? "none" : "block";

  items.forEach(character => {
    const btn = document.createElement("button");
    btn.className = "fav-item";
    btn.type = "button";
    btn.textContent = `♡ ${character.name}`;

    btn.addEventListener("click", () => {
      openCharacter(character.slug);
    });

    favoritesList.appendChild(btn);
  });
}

function getFilteredCharacters() {
  const query = searchInput.value.toLowerCase().trim();

  let filtered = characters.filter(character => {
    const filterPass =
      currentFilter === "all" ||
      character.category.toLowerCase() ===
        currentFilter.toLowerCase();

    const favPass =
      !favoritesOnly || isFavorite(character.slug);

    const text = `
      ${character.name}
      ${character.category}
      ${character.fandom}
      ${character.role}
      ${character.vibe}
      ${character.quote}
      ${character.tags.join(" ")}
    `.toLowerCase();

    return filterPass && favPass && text.includes(query);
  });

  if (currentSort === "name-asc") {
    filtered.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  if (currentSort === "name-desc") {
    filtered.sort((a, b) =>
      b.name.localeCompare(a.name)
    );
  }

  return filtered;
}

function createCard(character) {
  const article = document.createElement("article");
  article.className = "card";

  article.innerHTML = `
    <div class="card-cover">
      <img src="${character.cover}" alt="${character.name}">
      <div class="card-overlay">
        <span class="card-type">${character.category}</span>
        <h3>${character.name}</h3>
        <p>${character.quote}</p>
      </div>
    </div>
    <div class="card-body">
      <div class="small">
        <strong>${character.role}</strong> • ${character.fandom}
      </div>
    </div>
  `;

  article.addEventListener("click", () => {
    openCharacter(character.slug);
  });

  return article;
}

function renderCards() {
  cardsGrid.innerHTML = "";

  const filtered = getFilteredCharacters();

  filtered.forEach(character => {
    cardsGrid.appendChild(createCard(character));
  });

  emptyState.style.display =
    filtered.length ? "none" : "block";
}

function showView(name) {
  homeView.classList.remove("active");
  characterView.classList.remove("active");

  if (name === "character") {
    characterView.classList.add("active");
  } else {
    homeView.classList.add("active");
  }
}

function renderCharacterPage(slug) {
  const character = getCharacterBySlug(slug);
  if (!character) return;

  currentCharacterSlug = slug;

  characterView.innerHTML = `
    <div class="character-page">
      <div class="character-hero">
        <div class="character-cover">
          <img src="${character.cover}" alt="${character.name}">
        </div>

        <div class="character-summary">
          <div class="crumbs">
            <a href="#home">Home</a> /
            <span>${character.category}</span> /
            <span>${character.name}</span>
          </div>

          <h2>${character.name}</h2>

          <div class="character-meta">
            <strong>${character.role}</strong> • ${character.fandom}<br>
            ${character.vibe}
          </div>

          <div class="character-quote">
            “${character.quote}”
          </div>

          <div class="summary-actions">
            <button class="favorite-btn ${
              isFavorite(character.slug)
                ? "active"
                : ""
            }" id="favoriteBtn">
              ${
                isFavorite(character.slug)
                  ? "♥ Favorited"
                  : "♡ Add to Favorites"
              }
            </button>

            <button class="soft-btn" id="playDefaultBtn">
              Play Character Theme
            </button>

            <a class="soft-btn" href="#home">
              Back to Archive
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  document
    .getElementById("favoriteBtn")
    ?.addEventListener("click", () =>
      toggleFavorite(character.slug)
    );

  document
    .getElementById("playDefaultBtn")
    ?.addEventListener("click", () =>
      playCharacterTrack(
        character.slug,
        character.defaultTrack || 0
      )
    );
}

function route() {
  const hash = window.location.hash || "#home";

  if (hash.startsWith("#character/")) {
    const slug = hash.replace("#character/", "");
    showView("character");
    renderCharacterPage(slug);
  } else {
    showView("home");
  }
}

function openCharacter(slug) {
  addRecent(slug);
  window.location.hash = `#character/${slug}`;
}

function updatePlayerInfo(title, meta) {
  playerTrackTitle.textContent = title;
  playerTrackMeta.textContent = meta;
}

function buildCharacterPlaylist(character) {
  return character.music.map(track => ({
    ...track,
    ownerName: character.name,
    slug: character.slug
  }));
}

async function playFromPlaylist(index) {
  if (!currentPlaylist[index]) return;

  const track = currentPlaylist[index];
  currentTrackIndex = index;

  audioPlayer.src = track.url;
  audioPlayer.volume = Number(volumeBar.value);

  try {
    await audioPlayer.play();
  } catch {}

  updatePlayerInfo(
    track.title,
    `${track.ownerName} • ${track.artist}`
  );

  playPauseBtn.textContent = "❚❚";
}

function playCharacterTrack(slug, index = 0) {
  const character = getCharacterBySlug(slug);
  if (!character) return;

  currentPlaylist = buildCharacterPlaylist(character);
  playFromPlaylist(index);
}

function applyTheme(themeId) {
  const theme =
    themes.find(t => t.id === themeId) || themes[0];

  currentTheme = theme.id;

  document.body.setAttribute(
    "data-theme",
    currentTheme
  );

  saveTheme();

  themeName.textContent = theme.name;
  themePalette.textContent = theme.palette;
}

function cycleTheme() {
  const currentIndex = themes.findIndex(
    t => t.id === currentTheme
  );

  const nextIndex =
    (currentIndex + 1) % themes.length;

  applyTheme(themes[nextIndex].id);
}

/* =========================
   CUSTOM CURSOR MOVEMENT
   ========================= */
document.addEventListener("mousemove", e => {
  if (cursorGlow) {
    cursorGlow.style.left = `${e.clientX}px`;
    cursorGlow.style.top = `${e.clientY}px`;
  }

  if (themeCursor) {
    themeCursor.style.left = `${e.clientX}px`;
    themeCursor.style.top = `${e.clientY}px`;
  }
});

document.addEventListener("mousedown", () => {
  themeCursor.classList.add("cursor-click");
});

document.addEventListener("mouseup", () => {
  themeCursor.classList.remove("cursor-click");
});

document.addEventListener("mouseover", e => {
  const hoverTarget = e.target.closest(
    "a, button, input, select, textarea, .card, .gallery-item, .chip, .tab-btn, .track-btn, .favorite-btn, .side-link, .fav-item, .soft-btn, .circle-btn, .mini-btn, .theme-card-btn"
  );

  themeCursor.classList.toggle(
    "cursor-hover",
    Boolean(hoverTarget)
  );
});

/* events */
searchInput.addEventListener("input", renderCards);

filterChips.addEventListener("click", e => {
  const btn = e.target.closest(".chip");
  if (!btn) return;

  document
    .querySelectorAll(".chip")
    .forEach(x =>
      x.classList.remove("active")
    );

  btn.classList.add("active");

  currentFilter = btn.dataset.filter;
  favoritesOnly = false;

  renderCards();
});

sortSelect?.addEventListener("change", () => {
  currentSort = sortSelect.value;
  renderCards();
});

showFavoritesBtn?.addEventListener("click", () => {
  favoritesOnly = true;
  renderCards();
});

goHomeBtn?.addEventListener("click", () => {
  window.location.hash = "#home";
});

changeThemeBtn?.addEventListener(
  "click",
  cycleTheme
);

themeCycleCard?.addEventListener(
  "click",
  cycleTheme
);

playPauseBtn.addEventListener(
  "click",
  async () => {
    if (!audioPlayer.src) return;

    if (audioPlayer.paused) {
      await audioPlayer.play();
      playPauseBtn.textContent = "❚❚";
    } else {
      audioPlayer.pause();
      playPauseBtn.textContent = "▶";
    }
  }
);

audioPlayer.addEventListener(
  "timeupdate",
  () => {
    if (!isFinite(audioPlayer.duration))
      return;

    currentTime.textContent = formatTime(
      audioPlayer.currentTime
    );

    duration.textContent = formatTime(
      audioPlayer.duration
    );

    progressBar.value =
      (audioPlayer.currentTime /
        audioPlayer.duration) *
      100;
  }
);

progressBar.addEventListener(
  "input",
  () => {
    if (!isFinite(audioPlayer.duration))
      return;

    audioPlayer.currentTime =
      (progressBar.value / 100) *
      audioPlayer.duration;
  }
);

volumeBar.addEventListener(
  "input",
  () => {
    audioPlayer.volume =
      Number(volumeBar.value);
  }
);

lightboxClose?.addEventListener(
  "click",
  () => {
    lightbox.classList.remove("open");
  }
);

window.addEventListener(
  "hashchange",
  route
);

function init() {
  applyTheme(currentTheme);
  renderCards();
  renderFavorites();
  route();

  profileCount.textContent =
    characters.length;
}

init();
