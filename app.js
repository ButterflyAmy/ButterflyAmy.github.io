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
const featuredProfile = document.getElementById("featuredProfile");
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

const themes = [
  {
    id: "pink-glitter-dream",
    name: "Pink Glitter Dream",
    palette: "cutecore / glossy / glitter angel",
    sparkles: 34
  },
  {
    id: "neon-pink-night",
    name: "Neon Pink Night",
    palette: "city lights / blurry pink / nostalgic night",
    sparkles: 18
  },
  {
    id: "cyber-cold-neon",
    name: "Cyber Cold Neon",
    palette: "retro blue / cold neon / future street",
    sparkles: 12
  },
  {
    id: "deep-siren",
    name: "Deep Siren",
    palette: "ocean glow / sirencore / drowned dream",
    sparkles: 22
  }
];

let favorites = JSON.parse(localStorage.getItem(favoriteKey) || "[]");
let recentViewed = JSON.parse(localStorage.getItem(recentKey) || "[]");
let currentTheme = localStorage.getItem(themeKey) || "pink-glitter-dream";

function formatTime(seconds) {
  if (!isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function saveFavorites() {
  localStorage.setItem(favoriteKey, JSON.stringify(favorites));
}

function saveRecent() {
  localStorage.setItem(recentKey, JSON.stringify(recentViewed));
}

function saveTheme() {
  localStorage.setItem(themeKey, currentTheme);
}

function isFavorite(slug) {
  return favorites.includes(slug);
}

function addRecent(slug) {
  recentViewed = [slug, ...recentViewed.filter(item => item !== slug)].slice(0, 8);
  saveRecent();
}

function toggleFavorite(slug) {
  if (isFavorite(slug)) {
    favorites = favorites.filter(item => item !== slug);
  } else {
    favorites.push(slug);
  }

  saveFavorites();
  renderFavorites();
  renderCards();

  if (currentCharacterSlug === slug) {
    renderCharacterPage(slug, false);
  }
}

function getCharacterBySlug(slug) {
  return characters.find(c => c.slug === slug);
}

function closeSidebarOnMobile() {
  if (window.innerWidth <= 900) {
    sidebar.classList.remove("open");
  }
}

function scrollToProfiles() {
  profilesSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function scrollToHero() {
  homeHero.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setActiveSidebarButton(buttonKey) {
  [goHomeBtn, showFavoritesBtn, showRecentBtn, surpriseSidebarBtn].forEach(btn => {
    if (btn) btn.classList.remove("active-link");
  });

  if (buttonKey === "home") goHomeBtn.classList.add("active-link");
  if (buttonKey === "favorites") showFavoritesBtn.classList.add("active-link");
  if (buttonKey === "recent") showRecentBtn.classList.add("active-link");
  if (buttonKey === "random") surpriseSidebarBtn.classList.add("active-link");
}

function setChipActive(value) {
  document.querySelectorAll(".chip").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === value);
  });
}

function resetToAllProfiles() {
  favoritesOnly = false;
  currentFilter = "all";
  searchInput.value = "";
  currentSort = "default";
  if (sortSelect) sortSelect.value = "default";
  setChipActive("all");
  renderCards();
  setActiveSidebarButton("home");
}

function showOnlyFavorites() {
  favoritesOnly = true;
  currentFilter = "all";
  searchInput.value = "";
  setChipActive("all");
  renderCards();
  setActiveSidebarButton("favorites");
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
      <div class="small"><strong>${character.role}</strong> • ${character.fandom}</div>
    </div>
  `;

  article.addEventListener("click", () => openCharacter(character.slug, true));
  return article;
}

function getFilteredCharacters() {
  const query = searchInput.value.toLowerCase().trim();

  const filtered = characters.filter(character => {
    const filterPass =
      currentFilter === "all" ||
      character.category.toLowerCase() === currentFilter.toLowerCase();

    const favoritePass = !favoritesOnly || isFavorite(character.slug);

    const text = `
      ${character.name}
      ${character.category}
      ${character.fandom}
      ${character.role}
      ${character.vibe}
      ${character.quote}
      ${character.personality}
      ${character.story}
      ${character.facts.join(" ")}
      ${character.aesthetics}
      ${character.relationships.map(r => `${r.name} ${r.type} ${r.detail}`).join(" ")}
      ${character.quotes.join(" ")}
      ${character.tags.join(" ")}
    `.toLowerCase();

    return filterPass && favoritePass && text.includes(query);
  });

  if (currentSort === "name-asc") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (currentSort === "name-desc") {
    filtered.sort((a, b) => b.name.localeCompare(a.name));
  } else if (currentSort === "favorites") {
    filtered.sort((a, b) => Number(isFavorite(b.slug)) - Number(isFavorite(a.slug)));
  } else if (currentSort === "category") {
    filtered.sort((a, b) => a.category.localeCompare(b.category));
  }

  return filtered;
}

function renderCards() {
  const filtered = getFilteredCharacters();

  cardsGrid.innerHTML = "";
  filtered.forEach(character => cardsGrid.appendChild(createCard(character)));
  emptyState.style.display = filtered.length ? "none" : "block";
}

function renderFavorites() {
  favoritesList.innerHTML = "";

  const items = favorites.map(slug => getCharacterBySlug(slug)).filter(Boolean);
  favoritesEmpty.style.display = items.length ? "none" : "block";

  items.forEach(character => {
    const link = document.createElement("button");
    link.type = "button";
    link.className = "fav-item";
    link.textContent = `♡ ${character.name}`;
    link.addEventListener("click", () => {
      openCharacter(character.slug, false);
      closeSidebarOnMobile();
    });
    favoritesList.appendChild(link);
  });
}

function renderFeaturedProfile() {
  if (!featuredProfile || !characters.length) return;
  const featured = characters[0];

  featuredProfile.innerHTML = `
    <div class="featured-card">
      <img src="${featured.cover}" alt="${featured.name}">
      <div class="featured-info">
        <span class="card-type">${featured.category}</span>
        <h3>${featured.name}</h3>
        <p>${featured.story}</p>
        <button class="soft-btn" id="openFeaturedBtn" type="button">Open Profile</button>
      </div>
    </div>
  `;

  const openFeaturedBtn = document.getElementById("openFeaturedBtn");
  openFeaturedBtn?.addEventListener("click", () => openCharacter(featured.slug, true));
}

function renderRecentCards() {
  const items = recentViewed.map(slug => getCharacterBySlug(slug)).filter(Boolean);

  cardsGrid.innerHTML = "";
  items.forEach(character => cardsGrid.appendChild(createCard(character)));
  emptyState.style.display = items.length ? "none" : "block";
}

function normalizeVideoUrl(video) {
  if (video.includes("youtube.com/embed")) return video;

  if (video.includes("youtu.be/")) {
    const idPart = video.split("youtu.be/")[1] || "";
    const videoId = idPart.split("?")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }

  if (video.includes("youtube.com/watch?v=")) {
    const url = new URL(video);
    const videoId = url.searchParams.get("v");
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  }

  return video;
}

function renderCharacterPage(slug, playDefaultTrack = false) {
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
            <a href="#home">Home</a> / <span>${character.category}</span> / <span>${character.name}</span>
          </div>

          <h2>${character.name}</h2>

          <div class="character-meta">
            <strong>${character.role}</strong> • ${character.fandom}<br>
            ${character.vibe}
          </div>

          <div class="character-quote">“${character.quote}”</div>

          <div class="summary-actions">
            <button class="favorite-btn ${isFavorite(character.slug) ? "active" : ""}" id="favoriteBtn" type="button">
              ${isFavorite(character.slug) ? "♥ Favorited" : "♡ Add to Favorites"}
            </button>
            <button class="soft-btn" id="playDefaultBtn" type="button">Play Character Theme</button>
            <button class="soft-btn" id="copyCharacterLinkBtn" type="button">Copy Profile Link</button>
            <a class="soft-btn" href="#home">Back to Archive</a>
          </div>

          <div class="info-grid">
            <div class="info-box"><strong>Age</strong>${character.age}</div>
            <div class="info-box"><strong>Birthday</strong>${character.birthday}</div>
            <div class="info-box"><strong>Origin</strong>${character.origin}</div>
            <div class="info-box"><strong>Status</strong>${character.status}</div>
            <div class="info-box"><strong>Species</strong>${character.species}</div>
            <div class="info-box"><strong>Color Theme</strong>${character.color}</div>
          </div>
        </div>
      </div>

      <div class="character-tabs" id="characterTabs">
        <button class="tab-btn active" data-tab="overview" type="button">Overview</button>
        <button class="tab-btn" data-tab="media" type="button">Media</button>
        <button class="tab-btn" data-tab="music" type="button">Music</button>
        <button class="tab-btn" data-tab="details" type="button">Details</button>
      </div>

      <div class="tab-panel active" id="tab-overview">
        <div class="content-grid">
          <div class="stack">
            <div class="box">
              <h3>Story / Lore</h3>
              <p>${character.story}</p>
            </div>
            <div class="box">
              <h3>Personality</h3>
              <p>${character.personality}</p>
            </div>
          </div>

          <div class="stack">
            <div class="box">
              <h3>Favorites</h3>
              <p>${character.favorites}</p>
            </div>
            <div class="box">
              <h3>Aesthetic</h3>
              <p>${character.aesthetics}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="tab-panel" id="tab-media">
        <div class="stack">
          <div class="box">
            <h3>Gallery</h3>
            <div class="gallery-grid">
              ${character.gallery.map(img => `
                <div class="gallery-item">
                  <img src="${img}" alt="${character.name}">
                </div>
              `).join("")}
            </div>
          </div>

          <div class="box">
            <h3>Videos</h3>
            <div class="gallery-grid">
              ${
                character.videos && character.videos.length
                  ? character.videos.map(video => {
                      const normalized = normalizeVideoUrl(video);

                      if (normalized.includes("youtube.com/embed")) {
                        return `
                          <div class="gallery-item">
                            <iframe
                              src="${normalized}"
                              allowfullscreen
                              loading="lazy"
                              referrerpolicy="strict-origin-when-cross-origin">
                            </iframe>
                          </div>
                        `;
                      }

                      return `
                        <div class="gallery-item">
                          <video controls preload="metadata">
                            <source src="${video}" type="video/mp4">
                          </video>
                        </div>
                      `;
                    }).join("")
                  : `<p class="small">No videos yet.</p>`
              }
            </div>
          </div>
        </div>
      </div>

      <div class="tab-panel" id="tab-music">
        <div class="box">
          <h3>Music</h3>
          <div class="track-list">
            ${character.music.map((track, index) => `
              <div class="track">
                <div class="track-info">
                  <strong>${index + 1}. ${track.title}</strong>
                  <span>${track.artist}</span>
                </div>
                <button class="track-btn play-track-btn" data-slug="${character.slug}" data-index="${index}" type="button">
                  Play
                </button>
              </div>
            `).join("")}
          </div>
        </div>
      </div>

      <div class="tab-panel" id="tab-details">
        <div class="content-grid">
          <div class="stack">
            <div class="box">
              <h3>Quotes</h3>
              <div class="quote-list">
                ${character.quotes.map(q => `<div class="quote-item">“${q}”</div>`).join("")}
              </div>
            </div>

            <div class="box">
              <h3>Facts</h3>
              <ul>
                ${character.facts.map(f => `<li>${f}</li>`).join("")}
              </ul>
            </div>
          </div>

          <div class="stack">
            <div class="box">
              <h3>Relationships</h3>
              <div class="relationships">
                ${character.relationships.map(r => `
                  <div class="relation">
                    <strong>${r.name}</strong>
                    <span>${r.type}</span>
                    <p>${r.detail}</p>
                  </div>
                `).join("")}
              </div>
            </div>

            <div class="box">
              <h3>Tags</h3>
              <div class="tags">
                ${character.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  setupCharacterTabs();
  setupCharacterButtons(character);
  setupGalleryLightbox();

  if (playDefaultTrack) {
    playCharacterTrack(character.slug, character.defaultTrack);
  }
}

function setupCharacterTabs() {
  const tabsWrap = document.getElementById("characterTabs");
  if (!tabsWrap) return;

  const buttons = tabsWrap.querySelectorAll(".tab-btn");
  const panels = characterView.querySelectorAll(".tab-panel");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      buttons.forEach(btn => btn.classList.remove("active"));
      panels.forEach(panel => panel.classList.remove("active"));

      button.classList.add("active");
      const panel = document.getElementById(`tab-${button.dataset.tab}`);
      if (panel) panel.classList.add("active");
    });
  });
}

function setupGalleryLightbox() {
  const galleryImages = characterView.querySelectorAll(".gallery-item img");
  galleryImages.forEach(img => {
    img.addEventListener("click", () => {
      lightboxImage.src = img.src;
      lightbox.classList.add("open");
    });
  });
}

function copyCurrentLink() {
  navigator.clipboard.writeText(window.location.href)
    .then(() => alert("Link copied!"))
    .catch(() => alert("Could not copy link."));
}

function setupCharacterButtons(character) {
  const favoriteBtn = document.getElementById("favoriteBtn");
  const playDefaultBtn = document.getElementById("playDefaultBtn");
  const copyCharacterLinkBtn = document.getElementById("copyCharacterLinkBtn");
  const playTrackButtons = characterView.querySelectorAll(".play-track-btn");

  if (favoriteBtn) {
    favoriteBtn.addEventListener("click", () => toggleFavorite(character.slug));
  }

  if (playDefaultBtn) {
    playDefaultBtn.addEventListener("click", () => playCharacterTrack(character.slug, character.defaultTrack));
  }

  if (copyCharacterLinkBtn) {
    copyCharacterLinkBtn.addEventListener("click", copyCurrentLink);
  }

  playTrackButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const slug = btn.dataset.slug;
      const index = Number(btn.dataset.index);
      playCharacterTrack(slug, index);
    });
  });
}

function showView(viewName) {
  homeView.classList.remove("active");
  characterView.classList.remove("active");

  if (viewName === "character") {
    characterView.classList.add("active");
  } else {
    homeView.classList.add("active");
  }
}

function route() {
  const hash = window.location.hash || "#home";

  if (hash.startsWith("#character/")) {
    const slug = hash.replace("#character/", "").trim();
    const character = getCharacterBySlug(slug);

    if (character) {
      showView("character");
      renderCharacterPage(slug, false);
    } else {
      window.location.hash = "#home";
    }
  } else {
    showView("home");
  }

  closeSidebarOnMobile();
}

function openCharacter(slug, playDefault = true) {
  const character = getCharacterBySlug(slug);
  if (!character) return;

  addRecent(slug);

  if (playDefault) {
    playCharacterTrack(slug, character.defaultTrack ?? 0);
  }

  window.location.hash = `#character/${slug}`;
}

function stopMainMusic() {
  mainMusic.pause();
  mainMusic.currentTime = 0;
  mainMusicPlaying = false;
  toggleMainMusicBtn.textContent = "Play Main Music";
}

function stopEverything() {
  audioPlayer.pause();
  audioPlayer.currentTime = 0;
  stopMainMusic();
  playPauseBtn.textContent = "▶";
  progressBar.value = 0;
  currentTime.textContent = "0:00";
  duration.textContent = "0:00";
}

async function toggleMainMusic() {
  try {
    if (!mainMusicPlaying) {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;

      await mainMusic.play();
      mainMusicPlaying = true;
      toggleMainMusicBtn.textContent = "Pause Main Music";
      playerTrackTitle.textContent = "Main Page Theme";
      playerTrackMeta.textContent = "Dream Archive";
      playPauseBtn.textContent = "❚❚";
    } else {
      stopMainMusic();
      updatePlayerInfo("Nothing playing", "Choose a profile or a song");
      playPauseBtn.textContent = "▶";
    }
  } catch (err) {
    alert("The browser blocked music. Click again after interacting with the page.");
  }
}

function updatePlayerInfo(title, meta) {
  playerTrackTitle.textContent = title || "Nothing playing";
  playerTrackMeta.textContent = meta || "Choose a profile or a song";
}

function buildCharacterPlaylist(character) {
  return character.music.map(track => ({
    ...track,
    slug: character.slug,
    ownerName: character.name
  }));
}

function buildAllTracksPlaylist() {
  return characters.flatMap(character =>
    character.music.map(track => ({
      ...track,
      slug: character.slug,
      ownerName: character.name
    }))
  );
}

async function playFromPlaylist(index) {
  if (!currentPlaylist.length || !currentPlaylist[index]) return;

  stopMainMusic();

  currentTrackIndex = index;
  const track = currentPlaylist[currentTrackIndex];
  currentCharacterSlug = track.slug;

  audioPlayer.src = track.url;
  audioPlayer.volume = Number(volumeBar.value);

  try {
    await audioPlayer.play();
    updatePlayerInfo(track.title, `${track.ownerName} • ${track.artist}`);
    playPauseBtn.textContent = "❚❚";
  } catch (err) {
    updatePlayerInfo(track.title, `${track.ownerName} • ${track.artist}`);
    playPauseBtn.textContent = "▶";
  }
}

function playCharacterTrack(slug, trackIndex) {
  const character = getCharacterBySlug(slug);
  if (!character || !character.music[trackIndex]) return;

  currentPlaylist = buildCharacterPlaylist(character);
  playFromPlaylist(trackIndex);
}

function shuffleAllMusic() {
  const allTracks = buildAllTracksPlaylist();
  if (!allTracks.length) return;

  const randomIndex = Math.floor(Math.random() * allTracks.length);
  currentPlaylist = allTracks;
  playFromPlaylist(randomIndex);
}

function playNextTrack() {
  if (!currentPlaylist.length || currentTrackIndex === null) return;
  const nextIndex = (currentTrackIndex + 1) % currentPlaylist.length;
  playFromPlaylist(nextIndex);
}

function playPrevTrack() {
  if (!currentPlaylist.length || currentTrackIndex === null) return;
  const prevIndex = (currentTrackIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
  playFromPlaylist(prevIndex);
}

function openRandomCharacter() {
  if (!characters.length) return;
  const randomIndex = Math.floor(Math.random() * characters.length);
  setActiveSidebarButton("random");
  openCharacter(characters[randomIndex].slug, true);
}

function clearSparkles() {
  if (sparkles) {
    sparkles.innerHTML = "";
  }
}

function buildSparkles(count = 20) {
  clearSparkles();

  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "sparkle";
    el.style.left = `${Math.random() * 100}%`;
    el.style.animationDuration = `${8 + Math.random() * 12}s`;
    el.style.animationDelay = `${Math.random() * 10}s`;
    el.style.opacity = `${0.35 + Math.random() * 0.6}`;
    el.style.transform = `scale(${0.55 + Math.random() * 1.2})`;
    sparkles.appendChild(el);
  }
}

function applyTheme(themeId) {
  const theme = themes.find(item => item.id === themeId) || themes[0];

  currentTheme = theme.id;
  document.body.setAttribute("data-theme", theme.id);
  saveTheme();

  if (themeName) themeName.textContent = theme.name;
  if (themePalette) themePalette.textContent = theme.palette;

  buildSparkles(theme.sparkles);
}

function cycleTheme() {
  const currentIndex = themes.findIndex(theme => theme.id === currentTheme);
  const nextIndex = (currentIndex + 1) % themes.length;
  applyTheme(themes[nextIndex].id);
}

playPauseBtn.addEventListener("click", async () => {
  if (!audioPlayer.src && !mainMusicPlaying) return;

  if (mainMusicPlaying) {
    if (mainMusic.paused) {
      try {
        await mainMusic.play();
        playPauseBtn.textContent = "❚❚";
      } catch (err) {}
    } else {
      mainMusic.pause();
      playPauseBtn.textContent = "▶";
    }
    return;
  }

  if (audioPlayer.paused) {
    try {
      await audioPlayer.play();
      playPauseBtn.textContent = "❚❚";
    } catch (err) {}
  } else {
    audioPlayer.pause();
    playPauseBtn.textContent = "▶";
  }
});

prevBtn.addEventListener("click", playPrevTrack);
nextBtn.addEventListener("click", playNextTrack);

stopBtn.addEventListener("click", () => {
  stopEverything();
  updatePlayerInfo("Nothing playing", "Choose a profile or a song");
});

progressBar.addEventListener("input", () => {
  if (mainMusicPlaying) {
    if (isFinite(mainMusic.duration)) {
      mainMusic.currentTime = (progressBar.value / 100) * mainMusic.duration;
    }
  } else if (isFinite(audioPlayer.duration)) {
    audioPlayer.currentTime = (progressBar.value / 100) * audioPlayer.duration;
  }
});

volumeBar.addEventListener("input", () => {
  const volume = Number(volumeBar.value);
  audioPlayer.volume = volume;
  mainMusic.volume = volume;
});

toggleMainMusicBtn?.addEventListener("click", toggleMainMusic);
shuffleAllMusicBtn?.addEventListener("click", shuffleAllMusic);
changeThemeBtn?.addEventListener("click", cycleTheme);
themeCycleCard?.addEventListener("click", cycleTheme);

audioPlayer.addEventListener("timeupdate", () => {
  if (!isFinite(audioPlayer.duration)) return;
  currentTime.textContent = formatTime(audioPlayer.currentTime);
  duration.textContent = formatTime(audioPlayer.duration);
  progressBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
});

mainMusic.addEventListener("timeupdate", () => {
  if (!mainMusicPlaying || !isFinite(mainMusic.duration)) return;
  currentTime.textContent = formatTime(mainMusic.currentTime);
  duration.textContent = formatTime(mainMusic.duration);
  progressBar.value = (mainMusic.currentTime / mainMusic.duration) * 100;
});

audioPlayer.addEventListener("play", () => {
  mainMusic.pause();
  mainMusicPlaying = false;
  toggleMainMusicBtn.textContent = "Play Main Music";
  playPauseBtn.textContent = "❚❚";
});

audioPlayer.addEventListener("pause", () => {
  if (!audioPlayer.ended) playPauseBtn.textContent = "▶";
});

audioPlayer.addEventListener("ended", () => {
  playNextTrack();
});

mainMusic.addEventListener("play", () => {
  mainMusicPlaying = true;
  playPauseBtn.textContent = "❚❚";
});

mainMusic.addEventListener("pause", () => {
  mainMusicPlaying = false;
  if (!audioPlayer.paused) return;
  playPauseBtn.textContent = "▶";
});

searchInput.addEventListener("input", () => {
  setActiveSidebarButton("home");
  favoritesOnly = false;
  renderCards();
});

sortSelect?.addEventListener("change", () => {
  currentSort = sortSelect.value;
  renderCards();
});

filterChips.addEventListener("click", e => {
  const button = e.target.closest(".chip");
  if (!button) return;

  document.querySelectorAll(".chip").forEach(btn => btn.classList.remove("active"));
  button.classList.add("active");

  currentFilter = button.dataset.filter;
  favoritesOnly = false;
  setActiveSidebarButton("home");
  renderCards();
});

goHomeBtn.addEventListener("click", () => {
  if (window.location.hash.startsWith("#character/")) {
    window.location.hash = "#home";
    setTimeout(scrollToHero, 100);
  } else {
    scrollToHero();
  }
  setActiveSidebarButton("home");
});

showFavoritesBtn.addEventListener("click", () => {
  if (window.location.hash.startsWith("#character/")) {
    window.location.hash = "#home";
    setTimeout(() => {
      showOnlyFavorites();
      scrollToProfiles();
    }, 100);
  } else {
    showOnlyFavorites();
    scrollToProfiles();
  }

  closeSidebarOnMobile();
});

showRecentBtn?.addEventListener("click", () => {
  favoritesOnly = false;
  currentFilter = "all";
  searchInput.value = "";
  setChipActive("all");
  setActiveSidebarButton("recent");

  if (window.location.hash.startsWith("#character/")) {
    window.location.hash = "#home";
    setTimeout(() => {
      renderRecentCards();
      scrollToProfiles();
    }, 100);
  } else {
    renderRecentCards();
    scrollToProfiles();
  }

  closeSidebarOnMobile();
});

surpriseSidebarBtn?.addEventListener("click", () => {
  closeSidebarOnMobile();
  openRandomCharacter();
});

browseArchiveBtn.addEventListener("click", () => {
  if (window.location.hash.startsWith("#character/")) {
    window.location.hash = "#home";
    setTimeout(() => {
      resetToAllProfiles();
      scrollToProfiles();
    }, 100);
  } else {
    resetToAllProfiles();
    scrollToProfiles();
  }
});

surpriseMeBtn.addEventListener("click", openRandomCharacter);

sidebarToggle.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

document.addEventListener("click", e => {
  if (window.innerWidth <= 900) {
    const insideSidebar = sidebar.contains(e.target);
    const onToggle = sidebarToggle.contains(e.target);

    if (!insideSidebar && !onToggle) {
      sidebar.classList.remove("open");
    }
  }
});

lightboxClose?.addEventListener("click", () => {
  lightbox.classList.remove("open");
});

lightbox?.addEventListener("click", e => {
  if (e.target === lightbox) {
    lightbox.classList.remove("open");
  }
});

document.addEventListener("mousemove", e => {
  cursorGlow.style.left = `${e.clientX}px`;
  cursorGlow.style.top = `${e.clientY}px`;
});

function init() {
  applyTheme(currentTheme);
  renderCards();
  renderFavorites();
  renderFeaturedProfile();
  route();

  if (profileCount) {
    profileCount.textContent = String(characters.length);
  }

  audioPlayer.volume = Number(volumeBar.value);
  mainMusic.volume = Number(volumeBar.value);

  if (window.location.hash.startsWith("#character/")) {
    const slug = window.location.hash.replace("#character/", "");
    if (getCharacterBySlug(slug)) {
      renderCharacterPage(slug, false);
    }
  }
}

window.addEventListener("hashchange", route);
init();
