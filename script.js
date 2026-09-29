/* =========================================================
   Portfolio interactions — vanilla JavaScript
   Handles: mobile menu, active nav, fade-in, form, images
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("main section[id]");
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");

  // ---------- Mobile navigation ----------
  function closeMenu() {
    if (!toggle || !menu) return;
    toggle.classList.remove("is-open");
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    document.body.classList.remove("menu-open");
  }

  function openMenu() {
    toggle.classList.add("is-open");
    menu.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
    document.body.classList.add("menu-open");
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      if (menu.classList.contains("is-open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
  }

  // ---------- Header shadow on scroll ----------
  function updateHeader() {
    if (!header) return;
    if (window.scrollY > 8) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  // ---------- Smooth scrolling with sticky-header offset ----------
  navLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      const href = link.getAttribute("href");
      if (!href || href.charAt(0) !== "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      const headerHeight = header ? header.offsetHeight : 72;
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight + 2;

      window.scrollTo({
        top: top,
        behavior: "smooth"
      });
    });
  });

  // ---------- Highlight the current section in the navbar ----------
  function setActiveLink() {
    const headerHeight = header ? header.offsetHeight : 72;
    let currentId = "home";

    sections.forEach(function (section) {
      const sectionTop = section.offsetTop - headerHeight - 80;
      if (window.scrollY >= sectionTop) {
        currentId = section.id;
      }
    });

    navLinks.forEach(function (link) {
      const href = link.getAttribute("href");
      if (href === "#" + currentId) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  setActiveLink();
  window.addEventListener("scroll", setActiveLink, { passive: true });

  // ---------- Fade-in when sections enter the viewport ----------
  const fadeItems = document.querySelectorAll(".fade-in");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    fadeItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  } else if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    fadeItems.forEach(function (item) {
      observer.observe(item);
    });
  } else {
    fadeItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  // ---------- Profile / project image handling ----------
  function showImageFallback(img) {
    const parent = img.parentElement;

    img.classList.add("is-hidden");

    if (parent) {
      const fallback = parent.querySelector(".img-fallback");

      if (fallback) {
        fallback.hidden = false;
      }
    }
  }

  const photos = document.querySelectorAll("img.js-photo");

  photos.forEach(function (img) {
    img.addEventListener("error", function () {
      showImageFallback(img);
    });

    if (img.complete && img.naturalWidth === 0) {
      showImageFallback(img);
    }
  });

  // ---------- Contact form → Formspree (endpoint is the form action in index.html) ----------
  if (form) {
    const submitButton = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const name = form.elements.name.value.trim();
      const email = form.elements.email.value.trim();
      const subject = form.elements.subject.value.trim();
      const message = form.elements.message.value.trim();

      status.classList.remove("is-error");

      if (!name || !email || !subject || !message) {
        status.classList.add("is-error");
        status.textContent = "Please fill in all fields before submitting.";
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
      }
      status.textContent = "Sending your message…";

      fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form)
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Send failed");
          }
          status.textContent = "Message sent successfully! I’ll get back to you soon.";
          form.reset();
        })
        .catch(function () {
          status.classList.add("is-error");
          status.textContent = "Something went wrong. Please try again.";
        })
        .finally(function () {
          if (submitButton) {
            submitButton.disabled = false;
          }
        });
    });
  }
});