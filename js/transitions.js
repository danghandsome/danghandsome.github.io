// Page transitions with GSAP curtain reveal effect
(function () {
  var shell = document.querySelector(".page-transition-shell");
  var curtain = document.querySelector(".page-transition-curtain");

  if (!shell || !curtain) return;

  // Register ScrollTrigger with GSAP (will be called after GSAP loads)
  var checkGSAP = setInterval(function () {
    if (window.gsap && window.gsap.registerPlugin) {
      clearInterval(checkGSAP);
      gsap.registerPlugin(ScrollTrigger);
      init();
    }
  }, 100);

  function init() {
    // Animate reveal on page load
    function revealPage() {
      var tl = gsap.timeline();
      shell.classList.add("is-active");

      // Animate curtains from top and bottom (reveal)
      tl.to(curtain, {
        opacity: 1,
        duration: 0.1,
        ease: "none"
      }, 0);

      tl.to(curtain + "::before", {
        yPercent: 100,
        duration: 0.8,
        ease: "power2.inOut"
      }, 0);

      tl.to(curtain + "::after", {
        yPercent: -100,
        duration: 0.8,
        ease: "power2.inOut"
      }, 0);

      tl.to(shell, {
        opacity: 0,
        pointerEvents: "none",
        delay: 0.5,
        duration: 0.3
      });

      return tl;
    }

    // Trigger on load (if page was transitioned)
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", revealPage);
    } else {
      revealPage();
    }

    // Setup scroll-triggered reveal for sections
    var reveals = document.querySelectorAll(".reveal");
    reveals.forEach(function (el) {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          once: true,
          markers: false
        }
      });
    });
  }

  // Store transition data in sessionStorage for next page load
  window.addEventListener("beforeunload", function () {
    try {
      sessionStorage.setItem("nudot:page-transition", JSON.stringify({
        at: Date.now()
      }));
    } catch (e) {}
  });
})();
