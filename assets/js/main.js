/**
 * Enhanced Portfolio Main JS
 * Optimized version of iPortfolio template
 */
(function () {
  "use strict";

  // Configuration Constants
  const CONFIG = {
    // FORM_COOLDOWN: 600000, // 10 minute cooldown (600,000ms)
    HONEYPOT_NAME: "_gotcha",
    PERFORMANCE_WARNING: 3000, // 3 seconds
  };

  const FORM_CONFIG = {
    cooldown: 600000, // 10 minutes
    minCompletionTime: 10000, // 1 second minimum form fill time
    statusMessages: {
      success: "Message sent successfully!",
      error: "Failed to send. Please try again.",
      validation: "Please complete all required fields",
      cooldown: "Please wait {minutes} minute(s) before sending again",
      tooFast: "Please take a moment to complete the form"
    }
  };
  // Cached DOM Elements
  const DOM = {
    headerToggle: document.querySelector(".header-toggle"),
    header: document.querySelector("#header"),
    navmenuLinks: document.querySelectorAll("#navmenu a"),
    dropdownToggles: document.querySelectorAll(".navmenu .toggle-dropdown"),
    preloader: document.querySelector("#preloader"),
    scrollTop: document.querySelector(".scroll-top"),
    typed: document.querySelector(".typed"),
    skillsAnimations: document.querySelectorAll(".skills-animation"),
    isotopeLayouts: document.querySelectorAll(".isotope-layout"),
    swipers: document.querySelectorAll(".init-swiper"),
    themeToggle: document.getElementById("theme-toggle"),
    contactForm: document.getElementById("contact-form"),
    formResult: document.getElementById("form-result"),
  };

  // ======================
  //  DOM Ready Handler
  // ======================
  document.addEventListener("DOMContentLoaded", () => {
    try {
      initMobileNavigation();
      initPreloader();
      initScrollTop();
      initAOS();
      initTypedJS();
      initPureCounter();
      initSkillsAnimation();
      initGlightbox();
      initIsotope();
      initSwipers();
      initHashScroll();
      initNavScrollSpy();
      initThemeToggle();
      initContactForm();
      trackPerformance();
    } catch (error) {
      console.error("Initialization error:", error);
    }
  });

  // ======================
  //  Core Functions
  // ======================

  function initMobileNavigation() {
    if (!DOM.headerToggle || !DOM.header) return;

    const toggleHeader = () => {
      DOM.header.classList.toggle("header-show");
      DOM.headerToggle.classList.toggle("bi-list");
      DOM.headerToggle.classList.toggle("bi-x");
    };

    DOM.headerToggle.addEventListener("click", toggleHeader);
    DOM.navmenuLinks.forEach((link) =>
      link.addEventListener("click", () => DOM.header.classList.contains("header-show") && toggleHeader())
    );
    DOM.dropdownToggles.forEach((toggle) =>
      toggle.addEventListener("click", (e) => {
        e.preventDefault();
        const parent = toggle.parentNode;
        parent.classList.toggle("active");
        parent.nextElementSibling.classList.toggle("dropdown-active");
        e.stopImmediatePropagation();
      })
    );
  }

  function initPreloader() {
    if (!DOM.preloader) return;
    window.addEventListener("load", () => {
      setTimeout(() => {
        DOM.preloader.style.transition = "opacity 0.5s";
        DOM.preloader.style.opacity = "0";
        setTimeout(() => DOM.preloader.remove(), 500);
      }, 300);
    });
  }

  function initScrollTop() {
    if (!DOM.scrollTop) return;

    const toggleScrollTop = () => DOM.scrollTop.classList.toggle("active", window.scrollY > 100);
    DOM.scrollTop.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    window.addEventListener("load", toggleScrollTop);
    document.addEventListener("scroll", throttle(toggleScrollTop, 100));
  }

  function initAOS() {
    if (typeof AOS === "undefined") return;

    AOS.init({
      duration: window.innerWidth < 768 ? 400 : 600, // Faster on mobile
      easing: "ease-in-out",
      once: true,
      mirror: false,
      offset: window.innerWidth < 768 ? 50 : 120, // Trigger earlier on mobile
    });

    window.addEventListener("resize", debounce(() => AOS.refresh(), 100));
  }

  function initTypedJS() {
    if (!DOM.typed || typeof Typed === "undefined") return;
    const typedStrings = DOM.typed.getAttribute("data-typed-items")?.split(",") || [];
    if (typedStrings.length) {
      new Typed(".typed", {
        strings: typedStrings,
        loop: true,
        typeSpeed: 100,
        backSpeed: 50,
        backDelay: 2000,
        showCursor: false,
      });
    }
  }

  function initPureCounter() {
    if (typeof PureCounter !== "undefined") new PureCounter();
  }

  function initSkillsAnimation() {
    if (typeof Waypoint === "undefined") return;
    DOM.skillsAnimations.forEach((item) =>
      new Waypoint({
        element: item,
        offset: "80%",
        handler: () =>
          item.querySelectorAll(".progress .progress-bar").forEach((el) => (el.style.width = el.getAttribute("aria-valuenow") + "%")),
      })
    );
  }

  function initGlightbox() {
    if (typeof GLightbox !== "undefined") GLightbox({ selector: ".glightbox", touchNavigation: true, loop: true });
  }

  function initIsotope() {
    if (typeof Isotope === "undefined" || typeof imagesLoaded === "undefined") return;
    DOM.isotopeLayouts.forEach((item) => {
      const layout = item.getAttribute("data-layout") || "masonry";
      const filter = item.getAttribute("data-default-filter") || "*";
      const sort = item.getAttribute("data-sort") || "original-order";
      const container = item.querySelector(".isotope-container");

      imagesLoaded(container, () => {
        const iso = new Isotope(container, { itemSelector: ".isotope-item", layoutMode: layout, filter, sortBy: sort });
        item.querySelectorAll(".isotope-filters li").forEach((filter) =>
          filter.addEventListener("click", () => {
            item.querySelector(".filter-active")?.classList.remove("filter-active");
            filter.classList.add("filter-active");
            iso.arrange({ filter: filter.getAttribute("data-filter") });
            aosRefresh();
          })
        );
      });
    });
  }

  function initSwipers() {
    if (typeof Swiper === "undefined") return;
    DOM.swipers.forEach((swiper) => {
      const config = JSON.parse(swiper.querySelector(".swiper-config")?.innerHTML.trim() || "{}");
      new Swiper(swiper, config);
    });
  }

  function initHashScroll() {
    if (!window.location.hash) return;
    setTimeout(() => {
      const section = document.querySelector(window.location.hash);
      if (section) {
        const marginTop = parseInt(getComputedStyle(section).scrollMarginTop) || 0;
        window.scrollTo({ top: section.offsetTop - marginTop, behavior: "smooth" });
      }
    }, 100);
  }

  function initNavScrollSpy() {
    if (!DOM.navmenuLinks.length) return;

    const updateActiveLink = () => {
      const scrollPos = window.scrollY + 200;
      DOM.navmenuLinks.forEach((link) => {
        const section = link.hash && document.querySelector(link.hash);
        if (!section) return;
        const { offsetTop: top, offsetHeight: height } = section;
        link.classList.toggle("active", scrollPos >= top && scrollPos <= top + height);
      });
    };

    window.addEventListener("load", updateActiveLink);
    document.addEventListener("scroll", throttle(updateActiveLink, 100));
  }

  function initThemeToggle() {
    if (!DOM.themeToggle) return;

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
    const currentTheme = localStorage.getItem("theme") || (prefersDark.matches ? "dark" : "light");

    document.body.dataset.theme = currentTheme;
    updateThemeIcon(currentTheme);

    DOM.themeToggle.addEventListener("click", () => {
      const newTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
      document.body.dataset.theme = newTheme;
      localStorage.setItem("theme", newTheme);
      updateThemeIcon(newTheme);
    });

    prefersDark.addEventListener("change", (e) => {
      if (!localStorage.getItem("theme")) document.body.dataset.theme = e.matches ? "dark" : "light";
    });

    function updateThemeIcon(theme) {
      const icon = DOM.themeToggle.querySelector("i");
      if (icon) icon.className = `bi bi-${theme === "dark" ? "sun" : "moon"}-fill`;
    }
  }

  function initContactForm() {
    const contactForm = document.getElementById("contact-form");
    const formResult = document.getElementById("form-result");

    if (!contactForm || !formResult) return;

    let lastSubmissionTime = 0;
    let formStartTime = Date.now();

    // Track when user starts interacting with form
    contactForm.addEventListener('focusin', () => {
      if (!formStartTime) formStartTime = Date.now();
    });

    contactForm.addEventListener("submit", handleFormSubmit);

    async function handleFormSubmit(e) {
      e.preventDefault();
      const submitButton = contactForm.querySelector(".btn-premium");

      // Validation checks
      if (!validateForm(contactForm)) {
        showStatusMessage(FORM_CONFIG.statusMessages.validation, "warning");
        return;
      }

      if (isSubmissionTooFast()) {
        showStatusMessage(FORM_CONFIG.statusMessages.tooFast, "warning");
        return;
      }

      if (isInCooldown()) {
        const remaining = Math.ceil(
          (FORM_CONFIG.cooldown - (Date.now() - lastSubmissionTime)) / 60000
        );
        showStatusMessage(
          FORM_CONFIG.statusMessages.cooldown.replace("{minutes}", remaining),
          "warning"
        );
        return;
      }

      // Submit form
      await submitForm(contactForm, submitButton);
    }

    function isSubmissionTooFast() {
      return Date.now() - formStartTime < FORM_CONFIG.minCompletionTime;
    }

    function isInCooldown() {
      return Date.now() - lastSubmissionTime < FORM_CONFIG.cooldown;
    }

    function validateForm(form) {
      let isValid = true;
      form.querySelectorAll("[required]").forEach((field) => {
        const isInvalid = !field.value.trim();
        field.classList.toggle("is-invalid", isInvalid);
        field.setAttribute("aria-invalid", isInvalid);
        if (isInvalid) isValid = false;
      });
      return isValid;
    }

    async function submitForm(form, submitButton) {
      const originalBtnContent = submitButton.innerHTML;

      try {
        // Show loading state
        submitButton.innerHTML = `
          <span class="spinner-grow spinner-grow-sm me-2" role="status" aria-hidden="true"></span>
          Sending...
        `;
        submitButton.disabled = true;

        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });

        if (!response.ok) throw new Error("Submission failed");

        showStatusMessage(FORM_CONFIG.statusMessages.success, "success");
        form.reset();
        lastSubmissionTime = Date.now();
        formStartTime = null; // Reset for next submission
      } catch (error) {
        console.error("Submission error:", error);
        showStatusMessage(FORM_CONFIG.statusMessages.error, "danger");
      } finally {
        submitButton.innerHTML = originalBtnContent;
        submitButton.disabled = false;
      }
    }

    function showStatusMessage(message, type) {
      formResult.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
          ${message}
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      `;
      formResult.hidden = false;

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        const alert = formResult.querySelector(".alert");
        if (alert) {
          alert.classList.add("fade");
          setTimeout(() => formResult.hidden = true, 150);
        }
      }, 5000);
    }
  }

  function trackPerformance() {
    if (!window.performance) return;

    const observer = new PerformanceObserver((list) =>
      list.getEntries().forEach((entry) => {
        if (entry.entryType === "navigation" && entry.loadEventEnd > CONFIG.PERFORMANCE_WARNING) {
          console.warn(`Slow load: ${entry.loadEventEnd.toFixed(0)}ms`);
        }
        if (entry.name === "first-contentful-paint") console.log(`FCP: ${entry.startTime.toFixed(0)}ms`);
      })
    );
    observer.observe({ entryTypes: ["navigation", "paint"] });
  }

  // ======================
  //  Utility Functions
  // ======================

  function throttle(func, limit) {
    let lastFunc, lastRan;
    return function () {
      const context = this,
        args = arguments;
      if (!lastRan) {
        func.apply(context, args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(() => {
          if (Date.now() - lastRan >= limit) {
            func.apply(context, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  }

  function debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  function aosRefresh() {
    if (typeof AOS !== "undefined") AOS.refresh();
  }
})();
