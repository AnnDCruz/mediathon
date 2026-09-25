(function () {
  "use strict";

  var root = document.documentElement;
  var body = document.body;
  var progress = document.querySelector(".site-header__progress span");
  var opening = document.querySelector(".opening");
  var closing = document.querySelector(".closing");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initPhotos() {
    var manifest = window.TOWN_PHOTOS || {};
    document.querySelectorAll("[data-photo]").forEach(function (frame) {
      var key = frame.getAttribute("data-photo");
      var entry = manifest[key];

      if (!entry || !entry.src) return;

      var img = new Image();
      img.alt = entry.alt || "";
      img.decoding = "async";
      img.loading = frame.hasAttribute("data-priority") ? "eager" : "lazy";

      img.addEventListener("load", function () {
        frame.appendChild(img);
        frame.classList.add("has-image");
        frame.removeAttribute("aria-hidden");
      });

      img.src = entry.src;
    });
  }

  function initReveals() {
    var targets = document.querySelectorAll(".reveal");

    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px"
    });

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  function initProgress() {
    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var value = max > 0 ? window.scrollY / max : 0;
      progress.style.width = (value * 100).toFixed(2) + "%";

      if (opening) {
        opening.classList.toggle("is-past", window.scrollY > window.innerHeight * 0.55);
      }

      if (closing) {
        var rect = closing.getBoundingClientRect();
        var active = rect.top < window.innerHeight * 0.65 && rect.bottom > window.innerHeight * 0.35;
        body.classList.toggle("is-evening", active);
      }
    }

    var ticking = false;

    function schedule() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        update();
      });
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
  }

  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (event) {
        var target = document.querySelector(link.getAttribute("href"));
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start"
        });
      });
    });
  }

  function init() {
    initPhotos();
    initReveals();
    initProgress();
    initSmoothAnchors();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
