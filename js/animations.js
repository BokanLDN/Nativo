gsap.registerPlugin(ScrollTrigger);

// ── Word-split helper ─────────────────────────────────────────
// Wraps each whitespace-separated word in an inline-block <span>
// so GSAP can target individual words. Returns the span array.
function splitIntoWords(el) {
  el.innerHTML = el.textContent
    .trim()
    .split(/\s+/)
    .map((w) => `<span class="word" style="display:inline-block">${w}</span>`)
    .join(" ");
  return Array.from(el.querySelectorAll(".word"));
}

// ── Reduced-motion gate ───────────────────────────────────────
// If the user prefers reduced motion, skip all animation and
// immediately set every animated element to its final state.
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if (prefersReducedMotion) {
  gsap.set([".hero__title", ".hero__scroll"], { opacity: 1, y: 0 });
} else {
  initAnimations();
}

function initAnimations() {
  heroEntrance();
  servicesEntrance();
}

// ── Services cards ────────────────────────────────────────────
// Stagger in when the services section scrolls into view.
function servicesEntrance() {
  const cards = gsap.utils.toArray(".services__card");
  if (!cards.length) return;

  gsap.set(cards, { opacity: 0, y: 50 });

  gsap.to(cards, {
    opacity: 1,
    y: 0,
    duration: 0.9,
    stagger: 0.15,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".services",
      start: "top 75%",
      once: true,
    },
  });
}

// ── Hero entrance ─────────────────────────────────────────────
// Runs on page load with no ScrollTrigger.
// Sequence: h1 words stagger in → scroll indicator fades up after.
function heroEntrance() {
  const titleEl = document.querySelector(".hero__title");
  const scrollEl = document.querySelector(".hero__scroll");

  if (!titleEl) return;

  const words = splitIntoWords(titleEl);

  // Set initial hidden state before the timeline starts to prevent
  // a flash of the fully-visible element before GSAP takes over.
  gsap.set(words, { opacity: 0, y: 24 });
  if (scrollEl) gsap.set(scrollEl, { opacity: 0, y: 24 });

  // Single timeline — tweak delay/durations here to adjust the whole sequence.
  const tl = gsap.timeline({ delay: 0.2 });

  // 1. h1 words stagger in
  tl.to(words, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.08,
    ease: "power3.out",
  });

  // 2. Scroll indicator follows 0.15s after the last word lands
  if (scrollEl) {
    tl.to(
      scrollEl,
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
      ">0.15"
    );
  }
}
