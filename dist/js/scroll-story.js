/**
 * Scroll reveals and typewriter text for the presentation website.
 * Content remains real HTML, keeps its layout space, and is readable without JS.
 */
export function startScrollStory() {
  if (!("IntersectionObserver" in window)) return;

  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const completed = new WeakSet();
  const textStates = new Map();
  const revealTargets = [
    ...document.querySelectorAll(
      ".hero-copy, .quick-portals > a, .reveal, .values-band, .faq-section > div, .footer-heading, .footer-grid > div, .demo-note",
    ),
  ];
  let enabled = false;
  let frameId = 0;
  let observer;

  // Wrap whole words, then letters, so a word never breaks in the middle on mobile.
  // Opt in individual heading phrases in HTML. Never animate copy or controls.
  const textTargets = document.querySelectorAll("[data-typewriter]");
  textTargets.forEach((element) => {
    const accessibleText = element.innerText.replace(/\s+/g, " ").trim();
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (
          !node.textContent.trim() ||
          node.parentElement.closest("svg, [aria-hidden='true']")
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    const letters = [];
    nodes.forEach((node) => {
      const run = document.createElement("span");
      run.className = "type-run";
      run.setAttribute("aria-hidden", "true");
      node.textContent
        .replace(/\s+/g, " ")
        .split(/(\s+)/)
        .forEach((word) => {
          if (!word) return;
          if (/^\s+$/.test(word)) {
            run.append(document.createTextNode(" "));
            return;
          }
          const wordElement = document.createElement("span");
          wordElement.className = "typed-word";
          for (const character of Array.from(word)) {
            const letter = document.createElement("span");
            letter.className = "typed-char";
            letter.textContent = character;
            wordElement.append(letter);
            letters.push(letter);
          }
          run.append(wordElement);
        });
      node.replaceWith(run);
    });
    const readableCopy = document.createElement("span");
    readableCopy.className = "sr-only";
    readableCopy.textContent = accessibleText;
    element.append(readableCopy);
    element.classList.add("typewriter-text");
    element.dataset.typeState = "idle";
    textStates.set(element, {
      letters,
      count: letters.length,
      started: null,
      previous: 0,
      cursor: null,
      duration: Math.min(1750, Math.max(600, letters.length * 65)),
    });
  });

  function removeCursor(state) {
    state.cursor?.classList.remove("typing-caret");
    state.cursor = null;
  }
  function finish(element, state, remember = false) {
    state.letters.forEach((letter) => letter.classList.add("typed"));
    removeCursor(state);
    state.started = null;
    element.dataset.typeState = "complete";
    if (remember) completed.add(element);
  }
  function animate(now) {
    frameId = 0;
    if (!enabled) return;
    let running = false;
    textStates.forEach((state, element) => {
      if (state.started === null) return;
      const elapsed = now - state.started;
      const count = Math.max(
        0,
        Math.min(
          state.letters.length,
          Math.floor((elapsed / state.duration) * state.letters.length),
        ),
      );
      for (let index = state.previous; index < count; index++)
        state.letters[index].classList.add("typed");
      removeCursor(state);
      if (count > 0 && count < state.letters.length) {
        state.cursor = state.letters[count - 1];
        state.cursor.classList.add("typing-caret");
      }
      state.previous = count;
      if (count >= state.letters.length) finish(element, state, true);
      else running = true;
    });
    if (running) frameId = requestAnimationFrame(animate);
  }
  function beginTyping(element) {
    const state = textStates.get(element);
    if (!state || completed.has(element) || state.started !== null) return;
    // A short lead-in lets the ghost reveal settle before the first letter.
    state.started = performance.now() + 140;
    state.previous = 0;
    element.dataset.typeState = "typing";
    if (!frameId) frameId = requestAnimationFrame(animate);
  }
  function show(element) {
    element.classList.add("ghost-visible");
    if (textStates.has(element)) beginTyping(element);
    element.querySelectorAll(".typewriter-text").forEach(beginTyping);
  }
  function setEnabled(next, explicitChoice = false) {
    if (enabled === next && observer) return;
    enabled = next;
    observer?.disconnect();
    cancelAnimationFrame(frameId);
    frameId = 0;
    document.body.classList.toggle("scroll-story-enabled", next);
    document.body.classList.toggle(
      "motion-opt-in",
      next && explicitChoice && preference.matches,
    );
    if (!next) {
      revealTargets.forEach((element) =>
        element.classList.add("ghost-visible"),
      );
      textStates.forEach((state, element) => finish(element, state));
      return;
    }

    textStates.forEach((state, element) => {
      if (completed.has(element)) return;
      state.started = null;
      state.previous = 0;
      removeCursor(state);
      state.letters.forEach((letter) => letter.classList.remove("typed"));
      element.dataset.typeState = "waiting";
    });
    revealTargets.forEach((element, index) => {
      element.classList.add("ghost-reveal");
      element.classList.remove("ghost-visible");
      element.style.setProperty("--ghost-delay", `${(index % 3) * 60}ms`);
    });
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            show(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" },
    );
    // Observe text individually too: long sections can extend beyond one viewport.
    new Set([...revealTargets, ...textStates.keys()]).forEach((element) =>
      observer.observe(element),
    );
  }

  // Tabbing to a link or a field must never leave it hidden by an animation.
  document.addEventListener("focusin", (event) => {
    const target = event.target.closest(".ghost-reveal");
    if (target) show(target);
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) return;
    textStates.forEach((state, element) => {
      if (state.started !== null) finish(element, state, true);
    });
  });
  setEnabled(true, true);
}
