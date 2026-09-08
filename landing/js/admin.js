// ============================================================
// GUESS-UP ADMIN PANEL — MAIN JAVASCRIPT
// Handles: Auth, Dashboard, Deck CRUD, Testers, Feedback, Config
// ============================================================

// ---- State ----
let currentView = "dashboard";
let allDecks = [];
let allTesters = [];
let allFeedback = [];
let siteConfig = {};
let editingDeckId = null;

// ---- DOM Ready ----
document.addEventListener("DOMContentLoaded", () => {
  initAuth();
});

// ============================================================
// AUTH
// ============================================================
function initAuth() {
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  auth.onAuthStateChanged((user) => {
    if (user) {
      showAdmin(user);
    } else {
      showLogin();
    }
  });
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const errorEl = document.getElementById("login-error");
  const btn = document.getElementById("login-btn");

  errorEl.textContent = "";
  btn.disabled = true;
  btn.textContent = "Signing in...";

  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (error) {
    let msg = "Invalid email or password.";
    if (error.code === "auth/user-not-found") msg = "No admin account found.";
    if (error.code === "auth/wrong-password") msg = "Incorrect password.";
    if (error.code === "auth/too-many-requests")
      msg = "Too many attempts. Try later.";
    errorEl.textContent = msg;
    btn.disabled = false;
    btn.textContent = "Sign In";
  }
}

function handleLogout() {
  auth.signOut();
}

function showLogin() {
  document.getElementById("login-screen").style.display = "flex";
  document.getElementById("admin-layout").classList.remove("active");
}

function showAdmin(user) {
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("admin-layout").classList.add("active");
  document.getElementById("sidebar-user").textContent = user.email;

  // Load initial data
  loadAllData();
  navigateTo("dashboard");
}

// ============================================================
// NAVIGATION
// ============================================================
function navigateTo(view) {
  currentView = view;

  // Update sidebar active state
  document.querySelectorAll(".sidebar__link").forEach((link) => {
    link.classList.toggle("active", link.dataset.view === view);
  });

  // Update topbar
  const titles = {
    dashboard: "Dashboard",
    decks: "Deck Manager",
    testers: "Beta Testers",
    feedback: "Feedback",
    config: "Site Config",
  };
  document.getElementById("topbar-title").textContent = titles[view] || view;

  // Render view
  renderView(view);
}

function renderView(view) {
  const area = document.getElementById("content-area");
  const actions = document.getElementById("topbar-actions");
  actions.innerHTML = "";

  switch (view) {
    case "dashboard":
      renderDashboard(area);
      break;
    case "decks":
      renderDecks(area, actions);
      break;
    case "testers":
      renderTesters(area, actions);
      break;
    case "feedback":
      renderFeedback(area, actions);
      break;
    case "config":
      renderConfig(area);
      break;
    default:
      area.innerHTML =
        '<div class="empty-state"><div class="empty-state__icon">🚧</div><div class="empty-state__text">View not found</div></div>';
  }
}

// ============================================================
// DATA LOADING
// ============================================================
function loadAllData() {
  // Real-time listeners
  db.collection("categories").onSnapshot((snap) => {
    allDecks = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    document.getElementById("decks-count").textContent = allDecks.length;
    if (currentView === "dashboard") renderView("dashboard");
    if (currentView === "decks") renderView("decks");
  });

  db.collection("testers")
    .orderBy("timestamp", "desc")
    .onSnapshot((snap) => {
      allTesters = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      document.getElementById("testers-count").textContent = allTesters.length;
      if (currentView === "dashboard") renderView("dashboard");
      if (currentView === "testers") renderView("testers");
    });

  db.collection("feedback")
    .orderBy("timestamp", "desc")
    .onSnapshot((snap) => {
      allFeedback = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      document.getElementById("feedback-count").textContent =
        allFeedback.length;
      if (currentView === "dashboard") renderView("dashboard");
      if (currentView === "feedback") renderView("feedback");
    });
}

// ============================================================
// DASHBOARD
// ============================================================
function renderDashboard(area) {
  const totalWords = allDecks.reduce(
    (sum, d) => sum + (d.words?.length || 0),
    0,
  );
  const recentTesters = allTesters.slice(0, 8);
  const recentFeedback = allFeedback.slice(0, 5);

  area.innerHTML = `
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-card__label">Total Decks</div>
        <div class="stat-card__value">${allDecks.length}</div>
        <div class="stat-card__sub">${allDecks.filter((d) => d.isAvailable !== false).length} available</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__label">Total Words</div>
        <div class="stat-card__value">${totalWords.toLocaleString()}</div>
        <div class="stat-card__sub">Across all decks</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__label">Beta Signups</div>
        <div class="stat-card__value">${allTesters.length}</div>
        <div class="stat-card__sub">${allTesters.filter((t) => t.status === "pending").length} pending</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__label">Feedback</div>
        <div class="stat-card__value">${allFeedback.length}</div>
        <div class="stat-card__sub">${allFeedback.filter((f) => !f.read).length} unread</div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
      <!-- Recent Testers -->
      <div class="data-table-wrapper">
        <div class="data-table-header">
          <div class="data-table-header__title">Recent Signups</div>
          <button class="btn btn--secondary btn--sm" onclick="navigateTo('testers')">View All</button>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${
              recentTesters.length
                ? recentTesters
                    .map(
                      (t) => `
              <tr>
                <td style="color: var(--text-primary); font-weight: 600;">${esc(t.name || "—")}</td>
                <td>${esc(t.email || "—")}</td>
                <td>${formatDate(t.timestamp)}</td>
              </tr>
            `,
                    )
                    .join("")
                : '<tr><td colspan="3" style="text-align:center; color: var(--text-tertiary); padding: 30px;">No signups yet</td></tr>'
            }
          </tbody>
        </table>
      </div>

      <!-- Recent Feedback -->
      <div class="data-table-wrapper">
        <div class="data-table-header">
          <div class="data-table-header__title">Recent Feedback</div>
          <button class="btn btn--secondary btn--sm" onclick="navigateTo('feedback')">View All</button>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Message</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${
              recentFeedback.length
                ? recentFeedback
                    .map(
                      (f) => `
              <tr>
                <td style="color: var(--text-primary); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${esc((f.message || "").slice(0, 60))}</td>
                <td>${formatDate(f.timestamp)}</td>
                <td><span class="badge badge--${f.read ? "available" : "new"}">${f.read ? "Read" : "New"}</span></td>
              </tr>
            `,
                    )
                    .join("")
                : '<tr><td colspan="3" style="text-align:center; color: var(--text-tertiary); padding: 30px;">No feedback yet</td></tr>'
            }
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ============================================================
// DECK MANAGER
// ============================================================
function renderDecks(area, actions) {
  actions.innerHTML = `
    <div class="search-bar">
      <span class="search-bar__icon">🔍</span>
      <input class="search-bar__input" id="deck-search" placeholder="Search decks..." oninput="filterDecks()">
    </div>
    <button class="btn btn--primary" onclick="openDeckModal()">+ New Deck</button>
  `;

  const sortedDecks = [...allDecks].sort(
    (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0),
  );

  area.innerHTML = `
    <div class="data-table-wrapper">
      <table class="data-table" id="decks-table">
        <thead>
          <tr>
            <th>Icon</th>
            <th>Name</th>
            <th>Words</th>
            <th>Color</th>
            <th>Status</th>
            <th>Order</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${
            sortedDecks.length
              ? sortedDecks
                  .map(
                    (deck) => `
            <tr data-deck-id="${deck.id}" data-deck-name="${esc(deck.name?.toLowerCase() || "")}">
              <td class="deck-icon-cell">${esc(deck.icon || "🎮")}</td>
              <td>
                <div style="font-weight: 700; color: var(--text-primary);">${esc(deck.name || "Unnamed")}</div>
                <div style="font-size: 11px; color: var(--text-tertiary); margin-top: 2px;">${esc(deck.id)}</div>
              </td>
              <td><span class="badge badge--pending">${deck.words?.length || 0} words</span></td>
              <td><span class="color-swatch" style="background: ${esc(deck.color || "#FFC107")};"></span></td>
              <td>
                ${deck.isAvailable !== false ? '<span class="badge badge--available">Active</span>' : '<span class="badge badge--hidden">Hidden</span>'}
                ${deck.isTrending ? ' <span class="badge badge--trending">🔥</span>' : ""}
                ${deck.isLocked ? ' <span class="badge badge--locked">🔒</span>' : ""}
              </td>
              <td style="color: var(--text-tertiary);">${deck.sortOrder || 0}</td>
              <td>
                <div style="display: flex; gap: 4px;">
                  <button class="btn btn--secondary btn--sm" onclick="openDeckModal('${deck.id}')" title="Edit">✏️</button>
                  <button class="btn btn--secondary btn--sm" onclick="openWordManager('${deck.id}')" title="Words">📝</button>
                  <button class="btn btn--secondary btn--sm" onclick="duplicateDeck('${deck.id}')" title="Duplicate">📋</button>
                  <button class="btn btn--danger btn--sm" onclick="confirmDeleteDeck('${deck.id}', '${esc(deck.name)}')" title="Delete">🗑️</button>
                </div>
              </td>
            </tr>
          `,
                  )
                  .join("")
              : '<tr><td colspan="7"><div class="empty-state"><div class="empty-state__icon">🎴</div><div class="empty-state__text">No decks yet. Click "+ New Deck" to create one.</div></div></td></tr>'
          }
        </tbody>
      </table>
    </div>
  `;
}

function filterDecks() {
  const query =
    document.getElementById("deck-search")?.value.toLowerCase() || "";
  document.querySelectorAll("#decks-table tbody tr").forEach((row) => {
    const name = row.dataset.deckName || "";
    row.style.display = name.includes(query) ? "" : "none";
  });
}

// ---- Deck Modal (Create/Edit) ----
function openDeckModal(deckId = null) {
  editingDeckId = deckId;
  const deck = deckId ? allDecks.find((d) => d.id === deckId) : null;
  const isNew = !deck;

  document.getElementById("modal-title").textContent = isNew
    ? "Create New Deck"
    : `Edit: ${deck.name}`;

  document.getElementById("modal-body").innerHTML = `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Deck Name *</label>
        <input class="form-input" id="deck-name" value="${esc(deck?.name || "")}" placeholder="e.g. Bollywood Hits">
      </div>
      <div class="form-group">
        <label class="form-label">Icon (Emoji) *</label>
        <input class="form-input" id="deck-icon" value="${esc(deck?.icon || "")}" placeholder="e.g. 🎬" maxlength="4">
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Description</label>
      <textarea class="form-textarea" id="deck-description" placeholder="Short description for the deck">${esc(deck?.description || "")}</textarea>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Primary Color</label>
        <div class="color-picker-row">
          <input type="color" class="color-picker-input" id="deck-color" value="${deck?.color || "#FFC107"}">
          <input class="form-input" id="deck-color-hex" value="${esc(deck?.color || "#FFC107")}" placeholder="#FFC107" style="flex:1;">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Gradient End Color</label>
        <div class="color-picker-row">
          <input type="color" class="color-picker-input" id="deck-gradient" value="${deck?.gradientEnd || "#8B0000"}">
          <input class="form-input" id="deck-gradient-hex" value="${esc(deck?.gradientEnd || "#8B0000")}" placeholder="#8B0000" style="flex:1;">
        </div>
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Sort Order</label>
        <input class="form-input" id="deck-sort" type="number" value="${deck?.sortOrder || 0}" min="0">
      </div>
      <div class="form-group">
        <label class="form-label">Image URL (optional)</label>
        <input class="form-input" id="deck-image" value="${esc(deck?.imageUrl || "")}" placeholder="https://...">
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Toggles</label>
      <div style="display: flex; gap: 24px; flex-wrap: wrap;">
        <div class="toggle-wrapper">
          <div class="toggle ${deck?.isAvailable !== false ? "active" : ""}" id="deck-available" onclick="this.classList.toggle('active')">
            <div class="toggle__knob"></div>
          </div>
          <span class="toggle-label">Available</span>
        </div>
        <div class="toggle-wrapper">
          <div class="toggle ${deck?.isTrending ? "active" : ""}" id="deck-trending" onclick="this.classList.toggle('active')">
            <div class="toggle__knob"></div>
          </div>
          <span class="toggle-label">Trending 🔥</span>
        </div>
        <div class="toggle-wrapper">
          <div class="toggle ${deck?.isLocked ? "active" : ""}" id="deck-locked" onclick="this.classList.toggle('active')">
            <div class="toggle__knob"></div>
          </div>
          <span class="toggle-label">Locked 🔒</span>
        </div>
      </div>
    </div>

    ${
      !isNew
        ? ""
        : `
    <div class="form-group">
      <label class="form-label">Deck ID (auto-generated if blank)</label>
      <input class="form-input" id="deck-id-custom" placeholder="e.g. bollywood_hits">
    </div>
    `
    }
  `;

  // Sync color pickers
  setTimeout(() => {
    syncColorPickers("deck-color", "deck-color-hex");
    syncColorPickers("deck-gradient", "deck-gradient-hex");
  }, 50);

  document.getElementById("modal-footer").innerHTML = `
    <button class="btn btn--secondary" onclick="closeModal()">Cancel</button>
    <button class="btn btn--primary" onclick="saveDeck()">${isNew ? "Create Deck" : "Save Changes"}</button>
  `;

  openModal();
}

function syncColorPickers(pickerId, hexId) {
  const picker = document.getElementById(pickerId);
  const hex = document.getElementById(hexId);
  if (!picker || !hex) return;

  picker.addEventListener("input", () => {
    hex.value = picker.value;
  });
  hex.addEventListener("input", () => {
    if (/^#[0-9a-fA-F]{6}$/.test(hex.value)) picker.value = hex.value;
  });
}

async function saveDeck() {
  const name = document.getElementById("deck-name").value.trim();
  const icon = document.getElementById("deck-icon").value.trim();
  if (!name || !icon) {
    toast("Name and Icon are required.", "error");
    return;
  }

  const data = {
    name,
    icon,
    description: document.getElementById("deck-description").value.trim(),
    color: document.getElementById("deck-color-hex").value.trim(),
    gradientEnd: document.getElementById("deck-gradient-hex").value.trim(),
    sortOrder: parseInt(document.getElementById("deck-sort").value) || 0,
    imageUrl: document.getElementById("deck-image").value.trim() || null,
    isAvailable: document
      .getElementById("deck-available")
      .classList.contains("active"),
    isTrending: document
      .getElementById("deck-trending")
      .classList.contains("active"),
    isLocked: document
      .getElementById("deck-locked")
      .classList.contains("active"),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  };

  try {
    if (editingDeckId) {
      await db.collection("categories").doc(editingDeckId).update(data);
      toast(`Deck "${name}" updated!`, "success");
    } else {
      const customId = document.getElementById("deck-id-custom")?.value.trim();
      const docId = customId || name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
      data.words = [];
      data.wordsCount = 0;
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection("categories").doc(docId).set(data);
      toast(`Deck "${name}" created!`, "success");
    }
    closeModal();
  } catch (error) {
    console.error("Save deck error:", error);
    toast("Error saving deck. Check console.", "error");
  }
}

async function confirmDeleteDeck(deckId, deckName) {
  document.getElementById("modal-title").textContent = "Delete Deck";
  document.getElementById("modal-body").innerHTML = `
    <div class="confirm-dialog__message">
      Are you sure you want to delete <strong>"${esc(deckName)}"</strong>?
      This will permanently remove the deck and all its words. This cannot be undone.
    </div>
  `;
  document.getElementById("modal-footer").innerHTML = `
    <button class="btn btn--secondary" onclick="closeModal()">Cancel</button>
    <button class="btn btn--danger" onclick="deleteDeck('${deckId}')">Delete Forever</button>
  `;
  openModal();
}

async function deleteDeck(deckId) {
  try {
    await db.collection("categories").doc(deckId).delete();
    toast("Deck deleted.", "success");
    closeModal();
  } catch (error) {
    toast("Error deleting deck.", "error");
  }
}

async function duplicateDeck(deckId) {
  const deck = allDecks.find((d) => d.id === deckId);
  if (!deck) return;

  const newId = deckId + "_copy_" + Date.now().toString(36);
  const newData = { ...deck };
  delete newData.id;
  newData.name = deck.name + " (Copy)";
  newData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
  newData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();

  try {
    await db.collection("categories").doc(newId).set(newData);
    toast(`Deck duplicated as "${newData.name}"`, "success");
  } catch (error) {
    toast("Error duplicating deck.", "error");
  }
}

// ---- Word Manager ----
function openWordManager(deckId) {
  const deck = allDecks.find((d) => d.id === deckId);
  if (!deck) return;

  const words = deck.words || [];

  document.getElementById("modal-title").textContent =
    `Words — ${deck.name} (${words.length})`;
  document.getElementById("modal-body").innerHTML = `
    <div class="form-group">
      <label class="form-label">Add Words (press Enter or paste comma-separated)</label>
      <div class="word-tags" id="word-tags-container">
        ${words
          .map(
            (w) => `
          <span class="word-tag">
            ${esc(w)}
            <span class="word-tag__remove" onclick="removeWord('${deckId}', '${esc(w.replace(/'/g, "\\'"))}')">×</span>
          </span>
        `,
          )
          .join("")}
        <input class="word-tags__input" id="word-input" placeholder="Type a word and press Enter..." onkeydown="handleWordInput(event, '${deckId}')">
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Bulk Add (one per line or comma-separated)</label>
      <textarea class="form-textarea" id="bulk-words" placeholder="Paste multiple words here..." rows="4"></textarea>
      <button class="btn btn--secondary" style="margin-top: 8px;" onclick="bulkAddWords('${deckId}')">Add All</button>
    </div>
  `;

  document.getElementById("modal-footer").innerHTML = `
    <button class="btn btn--secondary" onclick="closeModal()">Close</button>
  `;

  openModal();
}

async function handleWordInput(e, deckId) {
  if (e.key !== "Enter") return;
  e.preventDefault();
  const input = document.getElementById("word-input");
  const word = input.value.trim();
  if (!word) return;

  try {
    await db
      .collection("categories")
      .doc(deckId)
      .update({
        words: firebase.firestore.FieldValue.arrayUnion(word),
      });
    input.value = "";
    toast(`Added "${word}"`, "info");
    // Refresh word manager after snapshot updates
    setTimeout(() => openWordManager(deckId), 500);
  } catch (error) {
    toast("Error adding word.", "error");
  }
}

async function removeWord(deckId, word) {
  try {
    await db
      .collection("categories")
      .doc(deckId)
      .update({
        words: firebase.firestore.FieldValue.arrayRemove(word),
      });
    toast(`Removed "${word}"`, "info");
    setTimeout(() => openWordManager(deckId), 500);
  } catch (error) {
    toast("Error removing word.", "error");
  }
}

async function bulkAddWords(deckId) {
  const text = document.getElementById("bulk-words").value.trim();
  if (!text) return;

  const words = text
    .split(/[,\n]/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0);
  if (!words.length) return;

  try {
    await db
      .collection("categories")
      .doc(deckId)
      .update({
        words: firebase.firestore.FieldValue.arrayUnion(...words),
      });
    toast(`Added ${words.length} words!`, "success");
    setTimeout(() => openWordManager(deckId), 500);
  } catch (error) {
    toast("Error adding words.", "error");
  }
}

// ============================================================
// BETA TESTERS
// ============================================================
function renderTesters(area, actions) {
  actions.innerHTML = `
    <div class="search-bar">
      <span class="search-bar__icon">🔍</span>
      <input class="search-bar__input" id="tester-search" placeholder="Search by name or email..." oninput="filterTesters()">
    </div>
    <button class="btn btn--secondary" onclick="exportTestersCSV()">📥 Export CSV</button>
  `;

  area.innerHTML = `
    <div class="data-table-wrapper">
      <table class="data-table" id="testers-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Source</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${
            allTesters.length
              ? allTesters
                  .map(
                    (t) => `
            <tr data-search="${esc((t.name || "").toLowerCase() + " " + (t.email || "").toLowerCase())}">
              <td style="font-weight: 600; color: var(--text-primary);">${esc(t.name || "—")}</td>
              <td>${esc(t.email || "—")}</td>
              <td><span class="badge badge--pending">${esc(t.source || "direct")}</span></td>
              <td>${formatDate(t.timestamp)}</td>
              <td><span class="badge badge--${t.status === "approved" ? "available" : "new"}">${esc(t.status || "pending")}</span></td>
              <td>
                <button class="btn btn--danger btn--sm" onclick="deleteTester('${t.id}')">🗑️</button>
              </td>
            </tr>
          `,
                  )
                  .join("")
              : '<tr><td colspan="6"><div class="empty-state"><div class="empty-state__icon">👥</div><div class="empty-state__text">No beta testers yet.</div></div></td></tr>'
          }
        </tbody>
      </table>
    </div>
  `;
}

function filterTesters() {
  const query =
    document.getElementById("tester-search")?.value.toLowerCase() || "";
  document.querySelectorAll("#testers-table tbody tr").forEach((row) => {
    const search = row.dataset.search || "";
    row.style.display = search.includes(query) ? "" : "none";
  });
}

async function deleteTester(testerId) {
  if (!confirm("Remove this tester?")) return;
  try {
    await db.collection("testers").doc(testerId).delete();
    toast("Tester removed.", "success");
  } catch (error) {
    toast("Error removing tester.", "error");
  }
}

function exportTestersCSV() {
  if (!allTesters.length) {
    toast("No testers to export.", "info");
    return;
  }

  const headers = ["Name", "Email", "Source", "Date", "Status"];
  const rows = allTesters.map((t) => [
    t.name || "",
    t.email || "",
    t.source || "direct",
    formatDate(t.timestamp),
    t.status || "pending",
  ]);

  const csv = [headers, ...rows]
    .map((r) => r.map((c) => `"${c}"`).join(","))
    .join("\n");
  downloadFile("beta_testers.csv", csv, "text/csv");
  toast("CSV exported!", "success");
}

// ============================================================
// FEEDBACK
// ============================================================
function renderFeedback(area, actions) {
  area.innerHTML = `
    <div class="data-table-wrapper">
      <div class="data-table-header">
        <div class="data-table-header__title">All Feedback (${allFeedback.length})</div>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Message</th>
            <th>Email</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${
            allFeedback.length
              ? allFeedback
                  .map(
                    (f) => `
            <tr>
              <td style="max-width: 300px; color: var(--text-primary);">
                <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${esc(f.message || "—")}</div>
              </td>
              <td>${esc(f.email || "—")}</td>
              <td>${formatDate(f.timestamp)}</td>
              <td><span class="badge badge--${f.read ? "available" : "new"}">${f.read ? "Read" : "New"}</span></td>
              <td>
                <div style="display: flex; gap: 4px;">
                  <button class="btn btn--secondary btn--sm" onclick="viewFeedback('${f.id}')">👁️</button>
                  ${!f.read ? `<button class="btn btn--success btn--sm" onclick="markFeedbackRead('${f.id}')">✓</button>` : ""}
                  <button class="btn btn--danger btn--sm" onclick="deleteFeedback('${f.id}')">🗑️</button>
                </div>
              </td>
            </tr>
          `,
                  )
                  .join("")
              : '<tr><td colspan="5"><div class="empty-state"><div class="empty-state__icon">💬</div><div class="empty-state__text">No feedback yet.</div></div></td></tr>'
          }
        </tbody>
      </table>
    </div>
  `;
}

function viewFeedback(feedbackId) {
  const fb = allFeedback.find((f) => f.id === feedbackId);
  if (!fb) return;

  document.getElementById("modal-title").textContent = "Feedback Details";
  document.getElementById("modal-body").innerHTML = `
    <div class="form-group">
      <label class="form-label">From</label>
      <div style="color: var(--text-primary); font-weight: 600;">${esc(fb.email || "Anonymous")}</div>
    </div>
    <div class="form-group">
      <label class="form-label">Date</label>
      <div style="color: var(--text-secondary);">${formatDate(fb.timestamp)}</div>
    </div>
    <div class="form-group">
      <label class="form-label">Message</label>
      <div style="color: var(--text-primary); line-height: 1.7; background: var(--bg-input); padding: 14px; border-radius: var(--radius-md);">${esc(fb.message || "—")}</div>
    </div>
  `;
  document.getElementById("modal-footer").innerHTML = `
    <button class="btn btn--secondary" onclick="closeModal()">Close</button>
    ${!fb.read ? `<button class="btn btn--success" onclick="markFeedbackRead('${fb.id}'); closeModal();">Mark as Read</button>` : ""}
  `;

  openModal();

  // Auto mark as read
  if (!fb.read) markFeedbackRead(feedbackId);
}

async function markFeedbackRead(feedbackId) {
  try {
    await db.collection("feedback").doc(feedbackId).update({ read: true });
  } catch (error) {
    console.error("Error marking feedback read:", error);
  }
}

async function deleteFeedback(feedbackId) {
  if (!confirm("Delete this feedback?")) return;
  try {
    await db.collection("feedback").doc(feedbackId).delete();
    toast("Feedback deleted.", "success");
  } catch (error) {
    toast("Error deleting feedback.", "error");
  }
}

// ============================================================
// SITE CONFIG
// ============================================================
function renderConfig(area) {
  // Load config from Firestore
  db.collection("site_config")
    .doc("landing")
    .get()
    .then((doc) => {
      siteConfig = doc.exists ? doc.data() : {};
      renderConfigForm(area);
    })
    .catch(() => {
      siteConfig = {};
      renderConfigForm(area);
    });
}

function renderConfigForm(area) {
  area.innerHTML = `
    <div class="data-table-wrapper" style="padding: 28px;">
      <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 24px;">Landing Page Configuration</h3>

      <div class="form-group">
        <label class="form-label">Announcement / Ticker Text</label>
        <textarea class="form-textarea" id="config-ticker" placeholder="Comma-separated ticker items...">${esc(siteConfig.tickerText || "")}</textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Instagram URL</label>
          <input class="form-input" id="config-instagram" value="${esc(siteConfig.instagramUrl || "")}" placeholder="https://instagram.com/...">
        </div>
        <div class="form-group">
          <label class="form-label">YouTube URL</label>
          <input class="form-input" id="config-youtube" value="${esc(siteConfig.youtubeUrl || "")}" placeholder="https://youtube.com/...">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Reddit URL</label>
          <input class="form-input" id="config-reddit" value="${esc(siteConfig.redditUrl || "")}" placeholder="https://reddit.com/r/...">
        </div>
        <div class="form-group">
          <label class="form-label">APK / Play Store URL</label>
          <input class="form-input" id="config-apk" value="${esc(siteConfig.apkUrl || "")}" placeholder="https://play.google.com/...">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Trailer Video URL</label>
        <input class="form-input" id="config-trailer" value="${esc(siteConfig.trailerUrl || "")}" placeholder="https://youtube.com/watch?v=...">
      </div>

      <div class="form-group" style="display: flex; gap: 24px; flex-wrap: wrap;">
        <div class="toggle-wrapper">
          <div class="toggle ${siteConfig.betaMode !== false ? "active" : ""}" id="config-beta" onclick="this.classList.toggle('active')">
            <div class="toggle__knob"></div>
          </div>
          <span class="toggle-label">Beta Mode (show signup form)</span>
        </div>
        <div class="toggle-wrapper">
          <div class="toggle ${siteConfig.showTicker !== false ? "active" : ""}" id="config-show-ticker" onclick="this.classList.toggle('active')">
            <div class="toggle__knob"></div>
          </div>
          <span class="toggle-label">Show Ticker</span>
        </div>
      </div>

      <div style="margin-top: 24px;">
        <button class="btn btn--primary" onclick="saveConfig()">Save Configuration</button>
      </div>
    </div>
  `;
}

async function saveConfig() {
  const data = {
    tickerText: document.getElementById("config-ticker").value.trim(),
    instagramUrl: document.getElementById("config-instagram").value.trim(),
    youtubeUrl: document.getElementById("config-youtube").value.trim(),
    redditUrl: document.getElementById("config-reddit").value.trim(),
    apkUrl: document.getElementById("config-apk").value.trim(),
    trailerUrl: document.getElementById("config-trailer").value.trim(),
    betaMode: document
      .getElementById("config-beta")
      .classList.contains("active"),
    showTicker: document
      .getElementById("config-show-ticker")
      .classList.contains("active"),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  };

  try {
    await db
      .collection("site_config")
      .doc("landing")
      .set(data, { merge: true });
    toast("Configuration saved!", "success");
  } catch (error) {
    toast("Error saving config.", "error");
  }
}

// ============================================================
// MODAL HELPERS
// ============================================================
function openModal() {
  document.getElementById("modal-overlay").classList.add("active");
}

function closeModal() {
  document.getElementById("modal-overlay").classList.remove("active");
  editingDeckId = null;
}

// Close on overlay click
document.addEventListener("click", (e) => {
  if (e.target.id === "modal-overlay") closeModal();
});

// Close on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
function toast(message, type = "info") {
  const container = document.getElementById("toast-container");
  const el = document.createElement("div");
  el.className = `toast toast--${type}`;
  el.textContent = message;
  container.appendChild(el);

  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateX(40px)";
    el.style.transition = "all 0.3s ease";
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

// ============================================================
// UTILITY HELPERS
// ============================================================
function esc(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(timestamp) {
  if (!timestamp) return "—";
  let date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else {
    date = new Date(timestamp);
  }

  if (isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
