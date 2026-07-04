// Main animation & smooth scroll orchestration
(function () {
  // Wait for GSAP, ScrollTrigger, Lenis to load
  function checkLibs() {
    if (window.gsap && window.gsap.ticker && window.Lenis) {
      init();
    } else {
      setTimeout(checkLibs, 100);
    }
  }

  function init() {
    // Initialize Lenis smooth scroll
    var lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      gestureOrientation: "vertical",
      normalizeWheel: false,
      smoothTouch: false
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Connect Lenis to ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Scroll trigger animations for all sections
    setupScrollAnimations();
  }

  function setupScrollAnimations() {
    // Animate section titles on scroll
    var sectionTitles = document.querySelectorAll(".section-title");
    sectionTitles.forEach(function (el) {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true
        }
      });
    });

    // Animate cards with stagger
    var cards = document.querySelectorAll(".card, .proj");
    cards.forEach(function (el) {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          once: true
        }
      });
    });

    // Parallax effect on hero section
    var heroText = document.querySelector(".hero-grid > .reveal");
    if (heroText) {
      gsap.to(heroText, {
        y: function () {
          return window.innerHeight * 0.3;
        },
        opacity: 0.7,
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
          onUpdate: function (self) {
            // Slow parallax scroll
          }
        }
      });
    }

    // Animate stats on scroll
    var stats = document.querySelectorAll(".stat");
    stats.forEach(function (el, i) {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        delay: i * 0.1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true
        }
      });
    });

    // Fade in reveals with stagger
    var reveals = document.querySelectorAll(".reveal");
    reveals.forEach(function (el) {
      // Check if already animated by transitions.js
      if (window.getComputedStyle(el).opacity !== "0") return;

      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          once: true
        }
      });
    });

    // Hover animations for interactive elements
    setupHoverAnimations();
  }

  function setupHoverAnimations() {
    // Card hover lift effect
    document.querySelectorAll(".card, .proj").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        gsap.to(el, {
          y: -8,
          duration: 0.3,
          ease: "power2.out"
        });
      });
      el.addEventListener("mouseleave", function () {
        gsap.to(el, {
          y: 0,
          duration: 0.3,
          ease: "power2.out"
        });
      });
    });

    // Button hover effects
    document.querySelectorAll(".btn").forEach(function (btn) {
      btn.addEventListener("mouseenter", function () {
        gsap.to(btn, {
          scale: 1.05,
          duration: 0.2,
          ease: "power2.out"
        });
      });
      btn.addEventListener("mouseleave", function () {
        gsap.to(btn, {
          scale: 1,
          duration: 0.2,
          ease: "power2.out"
        });
      });
    });
  }

  // Start checking for libraries
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", checkLibs);
  } else {
    checkLibs();
  }
})();
