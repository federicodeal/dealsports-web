// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const isMobileMotionViewport = () => window.innerWidth <= 768;

// Initialize Lenis Smooth Scroll only on desktop. Native mobile scrolling avoids
// touch/viewport refresh jumps when browser chrome changes height.
let lenis = null;
if (!isMobileMotionViewport()) {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false,
  });
  window.lenis = lenis;

  // Sync Lenis with GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
} else {
  window.lenis = null;
}

let activeTimeline = null;
let activeScrollTriggers = [];

// Title splitting function by <br> tags (used by hero)
function splitLinesByBr(titleEl) {
  if (!titleEl) return;
  // Prevent double wrapping
  if (titleEl.querySelector('.motion-line-wrapper')) return;

  const html = titleEl.innerHTML;
  const parts = html.split(/<br\s*\/?>/i);
  const wrappedHTML = parts.map(part => {
    const trimmed = part.trim();
    if (!trimmed) return '';
    return `<span class="motion-line-wrapper"><span class="motion-line-reveal">${trimmed}</span></span>`;
  }).join('');
  titleEl.innerHTML = wrappedHTML;
}

// Word splitting function for scroll-driven soft blur reveal
function splitTextIntoWords(node) {
  if (node.nodeType === 3) { // Text node
    const text = node.nodeValue;
    if (!text.trim()) return;
    // Split by whitespace but keep the whitespace chunks so we can reconstruct exactly
    const parts = text.split(/(\s+)/);
    const fragment = document.createDocumentFragment();
    parts.forEach(part => {
      if (/^\s+$/.test(part)) {
        if (fragment.lastChild && fragment.lastChild.classList && fragment.lastChild.classList.contains('word-reveal')) {
          fragment.lastChild.textContent += part;
        } else {
          fragment.appendChild(document.createTextNode(part));
        }
      } else if (part) {
        const span = document.createElement('span');
        span.className = 'word-reveal';
        span.textContent = part;
        fragment.appendChild(span);
      }
    });
    // Replace the text node with our new fragment if it generated elements
    if (fragment.childNodes.length > 0) {
      node.parentNode.replaceChild(fragment, node);
    }
  } else if (node.nodeType === 1) { // Element node
    // Don't process interactive controls or already split text.
    const tagName = node.tagName.toLowerCase();
    if (tagName === 'button' || tagName === 'a' || node.classList.contains('btn') || node.classList.contains('filter-btn') || node.classList.contains('form-submit')) return;
    if (tagName !== 'br' && !node.classList.contains('word-reveal') && !node.classList.contains('char-reveal')) {
      if (node.querySelector('.word-reveal')) return;
      // Convert children to an array to avoid live iteration issues
      Array.from(node.childNodes).forEach(splitTextIntoWords);
    }
  }
}

function splitWordsIntoChars(node) {
  const words = node.querySelectorAll('.word-reveal');
  words.forEach(word => {
    if (word.querySelector('.char-reveal')) return;
    const text = word.textContent;
    word.textContent = '';
    for (let i = 0; i < text.length; i++) {
      const charSpan = document.createElement('span');
      charSpan.className = 'char-reveal';
      charSpan.textContent = text[i];
      word.appendChild(charSpan);
    }
  });
}

// Kill and clean up active animations and scroll triggers
function killPageAnimations() {
  if (activeTimeline) {
    activeTimeline.kill();
    activeTimeline = null;
  }
  if (activeScrollTriggers && activeScrollTriggers.length > 0) {
    activeScrollTriggers.forEach(st => {
      if (st) st.kill();
    });
    activeScrollTriggers = [];
  }

  // Clear GSAP inline styles to prevent layout/state lock
  gsap.set([
      ".motion-hero-media",
      ".motion-hero-bg",
      ".motion-hero-content",
      ".motion-hero-badge",
      ".motion-hero-sub",
      ".motion-hero-actions",
      ".motion-hero-tagline",
      ".motion-page-hero-badge",
      ".motion-page-hero-title",
      ".motion-page-hero-title em",
      ".motion-page-hero-sub",
      ".motion-page-hero-visual",
    ".motion-line-reveal",
    ".motion-line-reveal em",
    ".word-reveal",
    ".motion-text-reveal",
    ".motion-image-left",
    ".motion-image-right",
    ".motion-image-left img",
    ".motion-image-right img",
    ".motion-card-reveal",
    ".motion-icon-response",
    ".motion-decorative",
    ".motion-bg-shift",
    ".stats-bar",
    "#main-header"
  ], { clearProps: "all" });

  document.documentElement.classList.remove('motion-initialized');
}

// Main scroll trigger registry helper
function setupScrollTriggers(scrollBgYVal, scrollDecorYVal, scrollContentYVal, scrollContentBlurVal) {
  if (activeScrollTriggers && activeScrollTriggers.length > 0) {
    activeScrollTriggers.forEach(st => {
      if (st) st.kill();
    });
    activeScrollTriggers = [];
  }

  if (isMobileMotionViewport()) return;

  const homePage = document.getElementById('page-home');
  const heroSection = homePage ? homePage.querySelector('.motion-hero') : null;

  if (heroSection) {
    // Scroll parallax eliminados a pedido del cliente para evitar el velo/desplazamiento.
  }
}

// GSAP final hero loading sequence timeline (8 phases)
function runFinalHeroTimeline() {
  if (activeTimeline) {
    activeTimeline.kill();
  }

  const isMobile = window.innerWidth <= 768;

  const bgBlurVal = "0px";
  const bgScaleVal = isMobile ? 1.01 : 1.04;
  
  const badgeYVal = isMobile ? 8 : 20;
  const badgeBlurVal = "0px";
  
  const lineBlurVal = "0px";
  const emBlurVal = "0px";
  const subBlurVal = "0px";
  
  const actionsYVal = isMobile ? 8 : 25;
  const actionsScaleVal = isMobile ? 0.99 : 0.96;
  const actionsBlurVal = "0px";
  
  const scrollBgYVal = isMobile ? 15 : 100;
  const scrollDecorYVal = isMobile ? -15 : -80;
  const scrollContentYVal = isMobile ? -25 : -120;
  const scrollContentBlurVal = "0px";
  
  const statsBarYVal = isMobile ? 15 : 60;
  const statsBarBlurVal = "0px";

  activeTimeline = gsap.timeline({
    defaults: { ease: "power3.out", duration: 1.0 }
  });

  // Phase 1: Media fade in with slight scale down and unblur
  activeTimeline.fromTo(".motion-hero-media", {
    opacity: 0,
    scale: 1.04,
    filter: "blur(8px)"
  }, {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    clearProps: "filter",
    duration: 2.0,
    ease: "power2.out"
  });

  // Phase 2: Navigation header and upper badge reveal
  activeTimeline.fromTo("#main-header", {
    opacity: 0,
    y: -20
  }, {
    opacity: 1,
    y: 0,
    duration: 1.2
  }, "-=1.7");

  activeTimeline.fromTo(".motion-hero-badge", {
    opacity: 0,
    y: badgeYVal,
    filter: `blur(${badgeBlurVal})`
  }, {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    clearProps: "filter",
    duration: 1.2
  }, "<");

  // Phase 3: Title reveals line-by-line (translates up, de-blurs, fades in)
  activeTimeline.fromTo(".motion-line-reveal", {
    y: "110%",
    filter: `blur(${lineBlurVal})`,
    opacity: 0
  }, {
    y: "0%",
    filter: "blur(0px)",
    opacity: 1,
    clearProps: "filter",
    stagger: 0.18,
    duration: 1.4
  }, "-=0.9");

  // Phase 4: Emphasis nodes inside the title reveal (for internal pages)
  const ems = document.querySelectorAll('.motion-hero-title em:not(.hero-title__word--em)');
  if (ems.length > 0) {
    activeTimeline.fromTo(ems, {
      opacity: 0,
      filter: `blur(${emBlurVal})`
    }, {
      opacity: 1,
      filter: "blur(0px)",
      clearProps: "filter",
      duration: 1.2
    }, "-=0.9");
  }

  // Phase 4.5: Custom hardcoded Home Hero Title words reveal
  const homeHeroWords = document.querySelectorAll('.hero-title__word');
  if (homeHeroWords.length > 0) {
    activeTimeline.fromTo(homeHeroWords, {
      opacity: 0,
      y: "0.45em",
      filter: `blur(${lineBlurVal})`
    }, {
      opacity: 1,
      y: "0em",
      filter: "blur(0px)",
      clearProps: "filter",
      stagger: 0.045,
      duration: 0.9,
      ease: "power4.out"
    }, "-=0.9");
  }

  // Phase 5: Paragraph reveals with blur reveal
  activeTimeline.fromTo(".motion-hero-sub", {
    opacity: 0,
    filter: `blur(${subBlurVal})`
  }, {
    opacity: 1,
    filter: "blur(0px)",
    clearProps: "filter",
    duration: 1.2
  }, "-=0.9");

  // Phase 6: Buttons/actions fade in, slide up, and scale up
  activeTimeline.fromTo(".motion-hero-actions", {
    opacity: 0,
    y: actionsYVal,
    scale: actionsScaleVal,
    filter: `blur(${actionsBlurVal})`
  }, {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    clearProps: "filter",
    duration: 1.2
  }, "-=1.0");

  // Phase 7: Footer tagline fades in slowly
  activeTimeline.fromTo(".motion-hero-tagline", {
    opacity: 0
  }, {
    opacity: 1,
    duration: 2.0
  }, "-=0.9");

  // Phase 8: Stats bar (next section) reveals right after tagline
  const statsBar = document.querySelector('.stats-bar');
  if (statsBar) {
    activeTimeline.fromTo(statsBar, {
      y: statsBarYVal
    }, {
      y: 0,
      duration: 1.5
    }, "-=1.1");

    const statItems = statsBar.querySelectorAll('.stat-item');
    if (statItems.length > 0) {
      activeTimeline.fromTo(statItems, {
        opacity: 0,
        y: 15
      }, {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        duration: 1.2
      }, "-=1.2");
    }
  }

  // Hook scroll triggers once layout animations finish
  setupScrollTriggers(scrollBgYVal, scrollDecorYVal, scrollContentYVal, scrollContentBlurVal);
}

// Global title reveal on scroll setup
function initScrollTitles(pageId) {
  const isMobile = window.innerWidth <= 768;
  const blurVal = "0px";
  const yMove = isMobile ? "0.15em" : "0.45em";
  const startVal = isMobile ? "top 90%" : "top 88%";
  const endVal = isMobile ? "top 66%" : "top 60%";

  const page = document.getElementById(`page-${pageId}`);
  if (!page) return;

  // Find all main titles except the hero title
  const titles = page.querySelectorAll('h1:not(.motion-hero-title), h2, .section-title, .ns-section-title, .cta-title');

  titles.forEach(title => {
    // Skip if already initialized by a generic reveal or if it's visually hidden
    if (title.classList.contains('motion-scroll-initialized')) return;
    
    // Apply word wrapper if not already wrapped
    splitTextIntoWords(title);
    title.classList.remove('reveal-on-scroll');
    title.classList.add('motion-scroll-initialized');

    const words = title.querySelectorAll('.word-reveal');

    if (words.length > 0) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: title,
          start: startVal,
          end: endVal,
          scrub: true
        }
      });

      tl.fromTo(words, {
        y: yMove,
        opacity: 0,
        filter: `blur(${blurVal})`
      }, {
        y: "0em",
        opacity: 1,
        filter: "blur(0px)",
        stagger: 0.035,
        ease: "none"
      });

      activeScrollTriggers.push(tl.scrollTrigger);
    }
  });
}

// Main page animation initializer
function initializeHomeAnimations() {
  const homePage = document.getElementById('page-home');
  if (!homePage || !homePage.classList.contains('active')) return;

  const title = homePage.querySelector('.motion-hero-title');
  if (title) {
    if (title.dataset.heroTitleReady !== "true") {
      splitLinesByBr(title);
    }
  }

  // Set prefers-reduced-motion check
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.documentElement.classList.add('motion-initialized');
    gsap.set([
      ".motion-hero-bg",
      ".motion-hero-badge",
      ".motion-hero-sub",
      ".motion-hero-actions",
      ".motion-hero-tagline",
      ".motion-line-reveal",
      ".motion-line-reveal em",
      ".hero-title__word",
      ".stats-bar",
      "#main-header"
    ], { clearProps: "all" });
    return;
  }

  // Set initialized class to lift static CSS hides, then trigger GSAP timeline
  document.documentElement.classList.add('motion-initialized');
  runFinalHeroTimeline();
}

// Internal Pages Hero Animation Initializer
function initializeInternalHeroAnimations(pageId) {
  const page = document.getElementById(`page-${pageId}`);
  if (!page || !page.classList.contains('active')) return;

  const title = page.querySelector('.motion-page-hero-title');
  if (title) {
    splitTextIntoWords(title);
    splitWordsIntoChars(title);
  }

  // Set prefers-reduced-motion check
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.documentElement.classList.add('motion-initialized');
    gsap.set([
      ".motion-page-hero-badge",
      ".motion-page-hero-title",
      ".motion-page-hero-title em",
      ".motion-page-hero-sub",
      ".motion-page-hero-visual"
    ], { clearProps: "all" });
    return;
  }

  document.documentElement.classList.add('motion-initialized');
  runInternalHeroTimeline(page);
}

// GSAP internal hero loading sequence
function runInternalHeroTimeline(page) {
  const isMobile = window.innerWidth <= 768;
  
  // Animation metrics
  const badgeYVal = isMobile ? 8 : 18;
  const badgeBlurVal = "0px";
  const emBlurVal = "0px";
  const subYVal = isMobile ? 8 : 20;
  const subBlurVal = "0px";
  const visualXVal = isMobile ? 12 : 44;
  const visualBlurVal = "0px";

  // If a timeline is already running, wait for it or kill it
  activeTimeline = gsap.timeline({
    defaults: { ease: "power3.out", duration: 0.8 }
  });

  // Phase 1: Badge reveals (0.00s)
  const badge = page.querySelector('.motion-page-hero-badge');
  if (badge) {
    activeTimeline.fromTo(badge, 
      { opacity: 0, y: badgeYVal, filter: `blur(${badgeBlurVal})` }, 
      { opacity: 1, y: 0, filter: "blur(0px)", clearProps: "filter", duration: 0.7, ease: "power3.out" },
      0.00
    );
  }

  // Phase 2: Title character-by-character reveal (0.15s)
  const chars = page.querySelectorAll('.motion-page-hero-title .char-reveal');
  if (chars.length > 0) {
    activeTimeline.fromTo(chars, 
      { opacity: 0, y: isMobile ? "0.16em" : "0.4em", filter: `blur(${isMobile ? 4 : 12}px)`, scale: isMobile ? 0.99 : 0.96 }, 
      { opacity: 1, y: "0em", filter: "blur(0px)", scale: 1, clearProps: "filter,transform", duration: isMobile ? 0.9 : 1.4, ease: "power2.out", stagger: isMobile ? 0.012 : 0.02 },
      0.15
    );
  }

  // Phase 3: Main visual reveals from side (0.45s)
  const visual = page.querySelector('.motion-page-hero-visual');
  if (visual) {
    // Determine direction based on class or default to right
    let startX = visualXVal;
    if (visual.classList.contains('motion-image-left')) {
      startX = -visualXVal;
    }

    activeTimeline.fromTo(visual, 
      { opacity: 0, x: startX, scale: isMobile ? 1.015 : 1.04, filter: `blur(${visualBlurVal})` }, 
      { opacity: 1, x: 0, scale: 1, filter: "blur(0px)", clearProps: "filter", duration: 1.1, ease: "power4.out" }, 
      0.45
    );

    // Apply parallax to image
    const img = visual.querySelector('img');
    if (img) {
      const parallaxTl = gsap.timeline({
        scrollTrigger: {
          trigger: visual.closest('.page-hero') || visual,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
      parallaxTl.fromTo(img, 
        { y: isMobile ? -6 : -20 }, 
        { y: isMobile ? 6 : 20, ease: "none" }
      );
      activeScrollTriggers.push(parallaxTl.scrollTrigger);
    }
  }

  // Phase 4: Paragraph/Sub reveal (0.70s)
  const sub = page.querySelectorAll('.motion-page-hero-sub');
  if (sub.length > 0) {
    activeTimeline.fromTo(sub, 
      { opacity: 0, y: subYVal, filter: `blur(${subBlurVal})` }, 
      { opacity: 1, y: 0, filter: "blur(0px)", clearProps: "filter", duration: 0.8, ease: "power3.out", stagger: 0.1 }, 
      0.70
    );
  }

  // Phase 5: Button reveal (0.90s)
  const btn = page.querySelector('.motion-page-hero-btn');
  if (btn) {
    activeTimeline.fromTo(btn, 
      { opacity: 0, y: badgeYVal, scale: 0.96, filter: `blur(${badgeBlurVal})` }, 
      { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", clearProps: "filter", duration: 0.7, ease: "power3.out" },
      0.90
    );
  }

}

// Generic Scroll Motion System
function initGenericScrollMotion(pageId) {
  const isMobile = window.innerWidth <= 768;
  const page = document.getElementById(`page-${pageId}`);
  if (!page) return;

  // 1. Text Reveal (paragraphs, labels, secondary text)
  const texts = page.querySelectorAll('.motion-text-reveal:not(button):not(.btn):not(.filter-btn):not(.form-submit)');
  texts.forEach(el => {
    splitTextIntoWords(el);
    const words = el.querySelectorAll('.word-reveal');
    if (words.length === 0) return;

    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: isMobile ? "top 90%" : "top 85%", end: isMobile ? "top 80%" : "top 75%", scrub: true }
    });
    tl.fromTo(words, 
      { y: isMobile ? "0.15em" : "0.45em", opacity: 0, filter: "blur(0px)" },
      { y: "0em", opacity: 1, filter: "blur(0px)", ease: "none", stagger: 0.02 }
    );
    activeScrollTriggers.push(tl.scrollTrigger);
  });

  // 2. Image Reveal (Left/Right side image reveal, without scrub scale)
  const imagesLeft = page.querySelectorAll('.motion-image-left img');
  const imagesRight = page.querySelectorAll('.motion-image-right img');
  
  imagesLeft.forEach(img => {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: img.parentElement, start: isMobile ? "top 90%" : "top 80%", end: "top 40%", scrub: true }
    });
    tl.fromTo(img,
      { x: isMobile ? -20 : -40, opacity: 0, filter: "blur(0px)" },
      { x: 0, opacity: 1, filter: "blur(0px)", ease: "none" }
    );
    activeScrollTriggers.push(tl.scrollTrigger);
  });

  imagesRight.forEach(img => {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: img.parentElement, start: isMobile ? "top 90%" : "top 80%", end: "top 40%", scrub: true }
    });
    tl.fromTo(img,
      { x: isMobile ? 20 : 40, opacity: 0, filter: "blur(0px)" },
      { x: 0, opacity: 1, filter: "blur(0px)", ease: "none" }
    );
    activeScrollTriggers.push(tl.scrollTrigger);
  });

  // 2.5 Global Image Parallax. Disable on mobile to avoid crop, overflow and
  // ScrollTrigger jitter on touch devices.
  if (!isMobile) {
    const allImages = page.querySelectorAll('img');
    allImages.forEach(img => {
      // Skip if it's a logo or small icon
      if (img.closest('.header') || img.closest('.nav') || img.closest('.footer') || img.closest('.icon')) return;

      const wrapper = img.parentElement;
    
      // Slight scale so parallax movement doesn't reveal gaps at top/bottom
      gsap.set(img, { scale: 1.15, transformOrigin: "center center" });
    
      const tl = gsap.timeline({
        scrollTrigger: { 
          trigger: wrapper, 
          start: "top bottom", 
          end: "bottom top", 
          scrub: true 
        }
      });

      // Move image slightly in opposition to scroll
      tl.fromTo(img, 
        { yPercent: -10 },
        { yPercent: 10, ease: "none" }
      );
      activeScrollTriggers.push(tl.scrollTrigger);
    });
  }

  // 3. Card Cascade Reveal (Non-scrubbed, stable appearance)
  const cards = page.querySelectorAll('.motion-card-reveal');
  const parents = new Set(Array.from(cards).map(card => card.parentElement));
  
  parents.forEach(parent => {
    const childrenCards = parent.querySelectorAll('.motion-card-reveal');
    if (childrenCards.length > 0) {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: parent, start: isMobile ? "top 95%" : "top 85%", toggleActions: "play none none none" }
      });
      tl.fromTo(childrenCards,
        { y: 16, opacity: 0, filter: "blur(0px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", stagger: 0.1, duration: 0.6, ease: "power2.out" }
      );
      
      // Also animate icons inside these cards if present
      const icons = parent.querySelectorAll('.motion-icon-response');
      if (icons.length > 0) {
        tl.fromTo(icons, 
          { scale: 0.8, rotation: -10, opacity: 0 },
          { scale: 1, rotation: 0, opacity: 1, stagger: 0.1, ease: "power2.out", duration: 0.6 }, 
          "<0.1"
        );
      }
      activeScrollTriggers.push(tl.scrollTrigger);
    }
  });

  // 4. Background Shifts
  const bgShifts = page.querySelectorAll('.motion-bg-shift');
  bgShifts.forEach(el => {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: "top 70%", end: "top 20%", scrub: true }
    });
    // This assumes we will toggle a class or just rely on CSS variables. It's better to animate a variable or opacity of a pseudo element.
    // Easiest GSAP approach: animate backgroundColor if inline, or just an overlay opacity.
    // For now, we'll animate a custom property --bg-shift-progress 0 to 1, and CSS can handle it.
    tl.fromTo(el, { "--bg-shift-progress": 0 }, { "--bg-shift-progress": 1, ease: "none" });
    activeScrollTriggers.push(tl.scrollTrigger);
  });

  // 5. Decorative Parallax
  const decoratives = page.querySelectorAll('.motion-decorative');
  decoratives.forEach(el => {
    const speed = el.dataset.speed || 0.05; // standard slow speed
    const yMove = isMobile ? speed * -30 : speed * -300; 
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el.parentElement || el, start: "top bottom", end: "bottom top", scrub: true }
    });
    tl.to(el, { y: yMove, ease: "none" });
    activeScrollTriggers.push(tl.scrollTrigger);
  });

  // 6. Magnetic Buttons (Desktop only)
  if (!isMobile) {
    const magnets = page.querySelectorAll('.motion-magnet');
    magnets.forEach(btn => {
      if (btn.dataset.motionMagnetReady === 'true') return;
      btn.dataset.motionMagnetReady = 'true';
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left) - rect.width / 2;
        const y = (e.clientY - rect.top) - rect.height / 2;
        
        gsap.to(btn, { x: x * 0.2, y: y * 0.2, duration: 0.4, ease: "power2.out" });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
      });
    });
  }
}

// Hook into SPA Navigation Lifecycle
window.initPageAnimations = function(page) {
  killPageAnimations();
  syncMobileButtonArrows();

  if (page === 'home') {
    initializeHomeAnimations();
  } else {
    initializeInternalHeroAnimations(page);
  }

  // Check prefers-reduced-motion before initializing scroll titles
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion) {
    // Add a slight delay to ensure layout is ready before calculating ScrollTrigger start/end
    setTimeout(() => {
      initScrollTitles(page);
      initGenericScrollMotion(page);
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }, isMobileMotionViewport() ? 120 : 100);
    
    if (!isMobileMotionViewport()) {
      // Fallback refresh for late image loads on desktop
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 800);
    }
  }
};

// Check load states and fire on startup
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(() => {
    const homePage = document.getElementById('page-home');
    if (homePage && homePage.classList.contains('active')) {
      window.initPageAnimations('home');
    }
  }, 50);
} else {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      const homePage = document.getElementById('page-home');
      if (homePage && homePage.classList.contains('active')) {
        window.initPageAnimations('home');
      }
    }, 50);
  });
}

function syncMobileButtonArrows() {
  document.querySelectorAll('.form-submit').forEach(btn => {
    if (!btn.dataset.originalText) {
      btn.dataset.originalText = btn.textContent;
    }
    btn.textContent = isMobileMotionViewport()
      ? btn.dataset.originalText.replace(/[→↗➜➝➔⟶]/g, '').trim()
      : btn.dataset.originalText;
  });
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  syncMobileButtonArrows();
} else {
  document.addEventListener('DOMContentLoaded', syncMobileButtonArrows);
}

// Refresh ScrollTrigger calculations on real viewport width changes. Mobile
// address-bar height changes fire resize events while scrolling, so ignore them.
let lastViewportWidth = window.innerWidth;
let resizeRefreshTimer = null;
window.addEventListener('resize', () => {
  syncMobileButtonArrows();
  const widthChanged = Math.abs(window.innerWidth - lastViewportWidth) > 2;
  if (isMobileMotionViewport() && !widthChanged) return;
  lastViewportWidth = window.innerWidth;
  clearTimeout(resizeRefreshTimer);
  resizeRefreshTimer = setTimeout(() => {
    ScrollTrigger.refresh();
  }, 150);
});
