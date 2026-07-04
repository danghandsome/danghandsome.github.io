// Smooth scroll (Lenis) + subtle hero parallax (GSAP ScrollTrigger).
// Every step is guarded: if any library fails to load, the page falls back
// to native scrolling and the existing IntersectionObserver reveals.
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  function start() {
    if (!window.gsap || !window.Lenis) return; // native scroll fallback

    try {
      document.documentElement.classList.add("lenis");
      var lenis = new Lenis({
        lerp: 0.1,
        wheelMultiplier: 1,
        smoothTouch: false
      });

      if (window.ScrollTrigger) {
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
        gsap.ticker.lagSmoothing(0);

        // Soft parallax: hero drifts up and fades slightly as you scroll past it.
        var hero = document.querySelector(".hero");
        var heroInner = document.querySelector(".hero .hero-grid");
        if (hero && heroInner) {
          gsap.to(heroInner, {
            yPercent: 10,
            opacity: 0.35,
            ease: "none",
            scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true }
          });
        }
      } else {
        // Lenis without ScrollTrigger: drive it with plain rAF.
        (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
      }

      // Anchor links: route through Lenis so in-page jumps stay smooth.
      document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener("click", function (e) {
          var id = a.getAttribute("href");
          if (!id || id === "#") return;
          var target = document.querySelector(id);
          if (!target) return;
          e.preventDefault();
          lenis.scrollTo(target, { offset: -70 });
        });
      });
    } catch (err) {
      document.documentElement.classList.remove("lenis");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
