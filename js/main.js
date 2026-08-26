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

  document.querySelectorAll(".project-preview--video").forEach((preview) => {
    const video = preview.querySelector(".project-video");
    if (!video) return;

    const playVideo = () => {
      video.currentTime = 0;
      video.play().catch(() => {});
      preview.classList.add("is-playing");
    };

    const stopVideo = () => {
      video.pause();
      video.currentTime = 0;
      preview.classList.remove("is-playing");
    };

    preview.addEventListener("mouseenter", playVideo);
    preview.addEventListener("mouseleave", stopVideo);

    preview.addEventListener("focusin", playVideo);
    preview.addEventListener("focusout", stopVideo);

    video.addEventListener("ended", () => {
      video.currentTime = 0;
    });
  });
})();