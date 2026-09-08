// ============================================================
// GUESS-UP LANDING PAGE — MAIN JAVASCRIPT
// Handles: scroll reveals, navbar, mobile menu, ticker, form
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initSignupForm();
});

// ============================================================
// NAVBAR — Transparent → Blur on scroll
// ============================================================
function initNavbar() {
  const nav = document.getElementById("nav");
  if (!nav) return;

  const SCROLL_THRESHOLD = 60;

  const onScroll = () => {
    if (window.scrollY > SCROLL_THRESHOLD) {
      nav.classList.add("nav--scrolled");
    } else {
      nav.classList.remove("nav--scrolled");
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); // Initial check
}

// ============================================================
// MOBILE MENU
// ============================================================
function initMobileMenu() {
  const hamburger = document.getElementById("nav-hamburger");
  const mobileMenu = document.getElementById("mobile-menu");
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener("click", () => {
    mobileMenu.classList.toggle("active");
    hamburger.classList.toggle("active");
  });
}

function closeMobileMenu() {
  const mobileMenu = document.getElementById("mobile-menu");
  const hamburger = document.getElementById("nav-hamburger");
  if (mobileMenu) mobileMenu.classList.remove("active");
  if (hamburger) hamburger.classList.remove("active");
}

// ============================================================
// SCROLL REVEAL — IntersectionObserver fade-in animation
// ============================================================
function initScrollReveal() {
  const elements = document.querySelectorAll(".reveal");
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target); // Only animate once
        }
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -60px 0px",
      threshold: 0.1,
    },
  );

  elements.forEach((el) => observer.observe(el));
}

// ============================================================
// BETA SIGNUP FORM — Firebase Firestore Integration
// ============================================================
function initSignupForm() {
  const form = document.getElementById("signup-form");
  const nameInput = document.getElementById("signup-name");
  const emailInput = document.getElementById("signup-email");
  const submitBtn = document.getElementById("signup-submit");
  const errorEl = document.getElementById("signup-error");
  const successEl = document.getElementById("signup-success");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();

    // Validation
    if (!name || !email) {
      showError("Please fill in both fields.");
      return;
    }

    if (!isValidEmail(email)) {
      showError("Please enter a valid email address.");
      return;
    }

    // Start loading
    hideError();
    submitBtn.disabled = true;
    submitBtn.classList.add("signup__submit--loading");

    try {
      // Check if Firebase is available
      if (typeof db === "undefined") {
        // Firebase not configured — show a friendly message
        showError("Signup system is being set up. Please try again later.");
        resetButton();
        return;
      }

      // Check for duplicate email
      const existingQuery = await db
        .collection("testers")
        .where("email", "==", email)
        .limit(1)
        .get();

      if (!existingQuery.empty) {
        showError("This email is already registered! We'll reach out soon.");
        resetButton();
        return;
      }

      // Save to Firestore
      await db.collection("testers").add({
        name: name,
        email: email,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        source: "landing_page",
        status: "pending",
      });

      // Show success
      form.style.display = "none";
      successEl.classList.add("active");
    } catch (error) {
      console.error("Signup error:", error);

      // Handle specific Firebase errors gracefully
      if (error.code === "permission-denied") {
        showError("Signup submitted! We'll review your request shortly.");
        form.style.display = "none";
        successEl.classList.add("active");
      } else {
        showError("Something went wrong. Please try again.");
      }
      resetButton();
    }
  });

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.classList.add("active");
  }

  function hideError() {
    errorEl.textContent = "";
    errorEl.classList.remove("active");
  }

  function resetButton() {
    submitBtn.disabled = false;
    submitBtn.classList.remove("signup__submit--loading");
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
