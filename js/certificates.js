(() => {
  const certificates = [
    {
      id: 1,
      title: "Full Stack Web Development",
      issuer: "Dicoding Indonesia",
      date: "August 2026",
      category: "Web Development",
      image: "",
      credentialId: "",
      credentialUrl: ""
    }
  ];

  const categories = [
    { key: "all", label: "All" },
    { key: "web-development", label: "Web Development" },
    { key: "frontend", label: "Frontend" },
    { key: "backend", label: "Backend" },
    { key: "programming", label: "Programming" },
    { key: "database", label: "Database" },
    { key: "ui-ux", label: "UI/UX" },
    { key: "other", label: "Other" }
  ];

  const categoryKey = (name) =>
    String(name || "")
      .toLowerCase()
      .replace(/\s+/g, "-");

  const matchesCategory = (cert, key) =>
    key === "all" || categoryKey(cert.category) === key;

  const grid = document.querySelector("[data-cert-grid]");
  const empty = document.querySelector("[data-cert-empty]");
  const emptyTitle = document.querySelector("[data-empty-title]");
  const emptyDesc = document.querySelector("[data-empty-desc]");
  const filterBar = document.querySelector("[data-cert-filter]");
  const searchInput = document.querySelector("[data-cert-search]");
  const modal = document.querySelector("[data-modal]");
  const modalContent = document.querySelector("[data-modal-body]");

  let activeCategory = "all";
  let query = "";

  const esc = (str) => {
    const div = document.createElement("div");
    div.textContent = String(str ?? "");
    return div.innerHTML;
  };

  const placeholderSvg = (title, issuer, seed, w = 600, h = 420) => {
    const hue = seed % 360;
    return (
      "<svg xmlns='http://www.w3.org/2000/svg' width='" + w + "' height='" + h + "' viewBox='0 0 " + w + " " + h + "'>" +
      "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>" +
      "<stop offset='0' stop-color='hsl(" + hue + ",45%,20%)'/>" +
      "<stop offset='1' stop-color='hsl(" + (hue + 30) + ",45%,12%)'/>" +
      "</linearGradient></defs>" +
      "<rect width='" + w + "' height='" + h + "' fill='url(#g)'/>" +
      "<rect x='40' y='60' width='" + (w - 80) + "' height='" + (h - 120) + "' rx='14' fill='rgba(7,17,31,0.55)' stroke='rgba(232,241,255,0.18)'/>" +
      "<circle cx='" + (w / 2) + "' cy='160' r='34' fill='none' stroke='rgba(59,130,246,0.55)' stroke-width='5'/>" +
      "<rect x='" + (w / 2 - 34) + "' y='146' width='68' height='10' rx='5' fill='#3b82f6' transform='rotate(-45 " + (w / 2) + " 151)'/>" +
      "<rect x='" + (w / 2 - 150) + "' y='260' width='300' height='14' rx='7' fill='rgba(232,241,255,0.65)'/>" +
      "<rect x='" + (w / 2 - 110) + "' y='290' width='220' height='9' rx='4.5' fill='rgba(232,241,255,0.32)'/>" +
      "<text x='" + (w / 2) + "' y='" + (h - 70) + "' text-anchor='middle' font-family='Georgia, serif' font-style='italic' font-size='20' fill='rgba(232,241,255,0.45)'>Certificate of Completion</text>" +
      "</svg>"
    );
  };

  const imageFor = (cert) => {
    if (cert.image) return cert.image;
    return (
      "data:image/svg+xml;utf8," +
      encodeURIComponent(placeholderSvg(cert.title, cert.issuer, cert.id))
        .replace(/'/g, "%27")
        .replace(/"/g, "%22")
    );
  };

  const cardHtml = (cert, index) => {
    const cat = esc(cert.category || "Other");
    const credId = cert.credentialId
      ? "<div class='cert-detail'><span class='cert-detail-label'>Credential ID</span><span class='cert-detail-value cert-detail-value--mono'>" + esc(cert.credentialId) + "</span></div>"
      : "";
    const verify = cert.credentialUrl
      ? "<a class='cert-verify' href='" + esc(cert.credentialUrl) + "' target='_blank' rel='noopener noreferrer'>Verify Credential <span aria-hidden='true'>↗</span></a>"
      : "";
    return (
      "<article class='cert-card reveal' data-cert-card style='--delay:" + (index % 3) * 80 + "ms'>" +
        "<button class='cert-preview' type='button' data-open='" + cert.id + "' aria-haspopup='dialog' aria-label='View certificate: " + esc(cert.title) + "'>" +
          "<img src='" + imageFor(cert) + "' alt='" + esc(cert.title) + " by " + esc(cert.issuer) + "' loading='lazy'>" +
        "</button>" +
        "<div class='cert-body'>" +
          "<span class='cert-category'>" + cat + "</span>" +
          "<h3 class='cert-title'>" + esc(cert.title) + "</h3>" +
          "<p class='cert-issuer'>" + esc(cert.issuer) + "</p>" +
          "<div class='cert-details'>" +
            "<div class='cert-detail'><span class='cert-detail-label'>Issued</span><span class='cert-detail-value'>" + esc(cert.date) + "</span></div>" +
            credId +
          "</div>" +
          "<div class='cert-actions'>" +
            "<button class='btn btn--primary btn--sm' type='button' data-open='" + cert.id + "' aria-haspopup='dialog'>View Certificate</button>" +
            verify +
          "</div>" +
        "</div>" +
      "</article>"
    );
  };

  const filtered = () =>
    certificates.filter(
      (cert) =>
        matchesCategory(cert, activeCategory) &&
        (!query ||
          (cert.title + " " + cert.issuer + " " + cert.category)
            .toLowerCase()
            .includes(query.toLowerCase()))
    );

  const render = () => {
    const items = filtered();
    grid.innerHTML = items.map(cardHtml).join("");
    const showEmpty = items.length === 0;
    empty.hidden = !showEmpty;
    if (showEmpty) {
      const anyCert = certificates.length === 0;
      emptyTitle.textContent = anyCert
        ? "No certificates yet."
        : "No certificates found.";
      emptyDesc.textContent = anyCert
        ? "Certificates will appear here as I continue learning and developing my skills."
        : "Try adjusting your search or selecting a different category.";
    }
    initReveal();
    bindCards();
  };

  const initReveal = () => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    grid.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
  };

  const openModal = (id) => {
    const cert = certificates.find((c) => String(c.id) === String(id));
    if (!cert) return;
    const credId = cert.credentialId
      ? "<div class='modal-detail'><span class='modal-detail-label'>Credential ID</span><span class='modal-detail-value modal-detail-value--mono'>" + esc(cert.credentialId) + "</span></div>"
      : "";
    const verify = cert.credentialUrl
      ? "<a class='btn btn--ghost btn--sm' href='" + esc(cert.credentialUrl) + "' target='_blank' rel='noopener noreferrer'>Verify Credential <span aria-hidden='true'>↗</span></a>"
      : "";
    modalContent.innerHTML =
      "<div class='modal-media'>" +
        "<img src='" + imageFor(cert) + "' alt='" + esc(cert.title) + " by " + esc(cert.issuer) + "' class='modal-image'>" +
        "<button class='modal-close-inline' type='button' data-modal-close aria-label='Close'>✕</button>" +
      "</div>" +
      "<div class='modal-info'>" +
        "<span class='cert-category'>" + esc(cert.category || "Other") + "</span>" +
        "<h3 class='modal-title'>" + esc(cert.title) + "</h3>" +
        "<p class='modal-issuer'>" + esc(cert.issuer) + "</p>" +
        "<div class='modal-details'>" +
          "<div class='modal-detail'><span class='modal-detail-label'>Issued</span><span class='modal-detail-value'>" + esc(cert.date) + "</span></div>" +
          credId +
        "</div>" +
        "<div class='modal-actions'>" + verify + "</div>" +
      "</div>";
    focusFirst(modal);
    modal.hidden = false;
    document.body.classList.add("modal-open");
    requestAnimationFrame(() => modal.classList.add("is-open"));
  };

  const closeModal = () => {
    if (modal.hidden) return;
    modal.classList.remove("is-open");
    setTimeout(() => {
      modal.hidden = true;
      document.body.classList.remove("modal-open");
      const opener = grid.querySelector(".cert-preview[data-open]");
      if (opener) opener.focus();
    }, 200);
  };

  const focusFirst = (scope) => {
    const focusable = scope.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length) focusable[0].focus();
  };

  const bindCards = () => {
    grid.querySelectorAll("[data-open]").forEach((btn) => {
      btn.addEventListener("click", () => openModal(btn.getAttribute("data-open")));
    });
  };

  const buildFilter = () => {
    filterBar.innerHTML = categories
      .map(
        (c) =>
          "<button class='filter-btn" +
          (c.key === activeCategory ? " is-active" : "") +
          "' type='button' data-filter='" +
          c.key +
          "'>" +
          c.label +
          "</button>"
      )
      .join("");
    filterBar.querySelectorAll("[data-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeCategory = btn.getAttribute("data-filter");
        filterBar.querySelectorAll("[data-filter]").forEach((b) =>
          b.classList.toggle("is-active", b === btn)
        );
        render();
      });
    });
  };

  if (filterBar) buildFilter();
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      query = e.target.value.trim();
      render();
    });
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-modal-close]")) closeModal();
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  const header = document.querySelector("[data-header]");
  const onScroll = () => header && header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  render();
})();
