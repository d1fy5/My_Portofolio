(() => {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-menu]");
  const menuLinks = menu.querySelectorAll("a");

  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    toggle.classList.toggle("is-active", open);
    document.body.classList.toggle("menu-open", open);
    menu.classList.toggle("is-open", open);
    if (open) {
      menuLinks[0]?.focus();
    } else {
      toggle.focus();
    }
  };

  toggle.addEventListener("click", () => {
    setMenu(!menu.classList.contains("is-open"));
  });

  menuLinks.forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("is-open")) {
      setMenu(false);
    }
  });

  const revealEls = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const isActive = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("is-active", isActive);
          if (isActive) {
            link.setAttribute("aria-current", "true");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  sections.forEach((section) => sectionObserver.observe(section));

  const easeInOutCubic = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const scrollToSection = (hash) => {
    const target = document.querySelector(hash);
    if (!target) return false;
    const targetY =
      target.getBoundingClientRect().top +
      window.scrollY -
      (document.querySelector(".site-header")?.offsetHeight || 0) -
      16;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo(0, targetY);
      return true;
    }
    const html = document.documentElement;
    const prevBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    const startY = window.scrollY;
    const diff = targetY - startY;
    const duration = 650;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      window.scrollTo(0, startY + diff * easeInOutCubic(p));
      if (p < 1) requestAnimationFrame(step);
      else html.style.scrollBehavior = prevBehavior;
    };
    requestAnimationFrame(step);
    return true;
  };

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const hash = link.getAttribute("href");
      if (hash.length < 2) return;
      if (scrollToSection(hash)) e.preventDefault();
    });
  });

  document.querySelectorAll(".project-preview--video").forEach((preview) => {
    const video = preview.querySelector(".project-video");
    if (!video) return;

    video.addEventListener("ended", () => {
      video.currentTime = 0;
    });
  });

  document.querySelectorAll(".project--link").forEach((card) => {
    const video = card.querySelector(".project-video");
    if (!video) return;

    card.addEventListener("mouseenter", () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    });

    card.addEventListener("mouseleave", () => {
      video.pause();
      video.currentTime = 0;
    });

    card.addEventListener("click", (e) => {
      const href = card.dataset.href;
      if (href) window.location.href = href;
    });
  });
})();