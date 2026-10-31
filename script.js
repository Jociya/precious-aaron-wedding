(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const page = document.body.dataset.page;
  let revealObserver = null;
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
  const phoneHref = wedding.contact.phone.replace(/[^\d+]/g, "");
  const whatsappHref = wedding.contact.whatsapp.replace(/\D/g, "");
  const mapUrl = (query, embed = false) => `https://www.google.com/maps${embed ? "" : "/search/"}?${embed ? "q" : "api=1&query"}=${encodeURIComponent(query)}${embed ? "&output=embed" : ""}`;
  const formattedDate = (date, weekday = false) => date === "TBD"
    ? wedding.copy.status.tbd
    : new Date(date).toLocaleDateString("en-GB", { ...(weekday ? { weekday: "long" } : {}), day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Lagos" });
  const countdownMarkup = (id) => `<div class="countdown" id="${id}" role="timer" aria-live="off"><span class="countdown-status"></span><div class="countdown-units">${wedding.copy.countdownLabels.map((label, index) => `<div><strong data-unit="${["days", "hours", "minutes", "seconds"][index]}">00</strong><span>${escapeHtml(label)}</span></div>`).join("")}</div></div>`;
  const sectionHeading = (label, heading) => `<div class="section-heading fade-up"><p class="eyebrow">${escapeHtml(label)}</p><h2>${escapeHtml(heading)}</h2><span class="ornament" aria-hidden="true">✳</span></div>`;

  const nav = () => `
    <header class="site-header${page === "home" ? "" : " is-subpage"}" id="top">
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Open navigation"><span></span><span></span></button>
      <nav class="site-nav" id="site-nav" aria-label="Main navigation">
        <div class="nav-side nav-left"><a href="index.html#program">${escapeHtml(wedding.copy.nav[0])}</a><a href="index.html#story">${escapeHtml(wedding.copy.nav[1])}</a><a href="gallery.html">${escapeHtml(wedding.copy.nav[2])}</a></div>
        <a class="monogram" href="index.html#top" aria-label="${escapeHtml(wedding.title)}">${escapeHtml(wedding.title)}</a>
        <div class="nav-side nav-right"><a href="index.html#details">${escapeHtml(wedding.copy.nav[3])}</a><a href="index.html#directions">${escapeHtml(wedding.copy.nav[4])}</a><a href="index.html#contact">${escapeHtml(wedding.copy.nav[5])}</a></div>
      </nav>
    </header>`;

  const footer = () => `
    <footer class="site-footer"><a class="monogram" href="index.html#top">${escapeHtml(wedding.title)}</a><p class="toast">${escapeHtml(wedding.toast)}</p><p>${escapeHtml(wedding.copy.footer.thankYou)}</p><span class="footer-ornament" aria-hidden="true">✳</span></footer>
    <div class="scroll-progress" aria-hidden="true"><span></span></div>`;

  const imageMarkup = (photo, alt, className = "", loading = "lazy") => {
    if (!photo) return "";
    const focus = escapeHtml(photo.focus || "center 30%");
    return `<img${className ? ` class="${className}"` : ""} style="object-position:${focus}" src="${escapeHtml(photo.thumb)}" alt="${escapeHtml(alt)}" width="${Number(photo.width)}" height="${Number(photo.height)}" loading="${loading}" decoding="async">`;
  };
  const fullImageMarkup = (photo, alt, className = "", loading = "lazy") => {
    if (!photo) return "";
    const position = escapeHtml(photo.focus || "center 30%");
    return `<img${className ? ` class="${className}"` : ""} style="object-position:${position}" src="${escapeHtml(photo.full)}" alt="${escapeHtml(alt)}" width="${Number(photo.width)}" height="${Number(photo.height)}" loading="${loading}" decoding="async">`;
  };
  const photoRevealMarkup = (photo, alt, className = "", loading = "lazy") => photo
    ? `<div class="photo-reveal arch-reveal ${className}">${imageMarkup(photo, alt, "", loading)}</div>`
    : "";

  const eventCard = (event, kind) => {
    const heading = kind === "traditional" ? wedding.copy.details.traditional : kind === "church" ? wedding.copy.details.church : wedding.copy.details.reception;
    const details = kind === "traditional"
      ? `<p class="event-complete">${escapeHtml(wedding.copy.details.completed)}</p><a class="text-link traditional-photos-link" href="gallery.html?tab=traditional">${escapeHtml(wedding.copy.details.photos)} <span aria-hidden="true">→</span></a>`
      : `<dl><div><dt>${escapeHtml(wedding.copy.details.dateLabel)}</dt><dd>${event.date === "TBD" ? escapeHtml(wedding.copy.details.tbd) : new Date(event.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Lagos" })}</dd></div>${kind === "church" ? `<div><dt>${escapeHtml(wedding.copy.details.timeLabel)}</dt><dd>${escapeHtml(wedding.copy.details.churchTime)}</dd></div>` : ""}<div><dt>${escapeHtml(wedding.copy.details.venueLabel)}</dt><dd>${escapeHtml(event.venue)}</dd></div></dl>${kind === "church" ? countdownMarkup("details-countdown") : ""}`;
    return `<article class="event-card fade-up"><p class="eyebrow">${kind === "traditional" ? "01" : kind === "church" ? "02" : "03"}</p><h3>${escapeHtml(heading)}</h3>${details}</article>`;
  };

  const directionsCard = (kind, event) => {
    const date = event.date === "TBD" ? null : formattedDate(event.date);
    const time = event.time && event.time !== "TBD" ? event.time : null;
    const schedule = date && time
      ? `${date} · ${time}`
      : date || time || "Date and time to be confirmed";
    const address = event.address || event.venue;
    return `
      <article class="map-card fade-up">
        <div class="map-card-copy"><p class="eyebrow">${escapeHtml(wedding.copy.directions[kind])}</p><h3>${escapeHtml(event.venue)}</h3><p class="map-address">${escapeHtml(address)}</p>
          <p class="map-schedule">${escapeHtml(schedule)}</p>
          <div class="map-actions"><a class="button button-primary directions-primary" href="${mapUrl(event.mapQuery)}" target="_blank" rel="noopener noreferrer">${escapeHtml(wedding.copy.directions.directionsButton)} <span aria-hidden="true">→</span></a><button class="button button-secondary copy-address" type="button" data-address="${escapeHtml(address)}">Copy address<span class="copy-status" aria-live="polite"></span></button><a class="button button-secondary" href="https://wa.me/?text=${encodeURIComponent(`${event.venue} — ${mapUrl(event.mapQuery)}`)}" target="_blank" rel="noopener noreferrer">Share on WhatsApp</a></div>
        </div><iframe title="${escapeHtml(wedding.copy.directions[kind])} map: ${escapeHtml(event.venue)}" src="${mapUrl(event.mapQuery, true)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      </article>`;
  };

  const renderHome = () => {
    const churchDate = formattedDate(wedding.events.church.date, true);
    const traditionalDate = formattedDate(wedding.events.traditional.date);
    const heroPhoto = wedding.gallery.preWedding[2];
    return `
      <main>
        <section class="hero" id="home">
          ${wedding.images.hero ? `<div class="hero-media">${fullImageMarkup(heroPhoto, "Precious and Aaron at their pre-wedding shoot", "hero-photo", "eager")}</div>` : ""}
          <div class="hero-content"><p class="eyebrow">${escapeHtml(wedding.copy.heroLabel)}</p><h1><span class="hero-name">${escapeHtml(wedding.couple.bride)}</span><span class="hero-name hero-ampersand"><i>&amp;</i></span><span class="hero-name">${escapeHtml(wedding.couple.groom)}</span></h1><p class="hero-intro">${escapeHtml(wedding.copy.invitation)}</p><p class="hero-date">${escapeHtml(churchDate)}<br><span>${escapeHtml(wedding.events.church.venue)}</span></p>${countdownMarkup("hero-countdown")}<div class="hero-actions"><a class="button button-primary button-large" href="program.html">${escapeHtml(wedding.copy.heroActions[0])} <span aria-hidden="true">→</span></a><a class="button button-light-outline" href="${mapUrl(wedding.events.church.mapQuery)}" target="_blank" rel="noopener noreferrer">${escapeHtml(wedding.copy.heroActions[1])}</a></div></div>
        </section>
        <section class="section journey-section" id="journey">${sectionHeading("The celebrations", "Our Journey")}<div class="journey-track"><span class="journey-line" aria-hidden="true"></span>
          <article class="journey-chapter fade-up"><span class="journey-dot" aria-hidden="true"></span>${photoRevealMarkup(wedding.gallery.preWedding[0], wedding.copy.story.photoAlt[1], "journey-photo")}<div class="journey-copy"><p class="eyebrow">01 · A beginning</p><h3>Pre-Wedding</h3><p>${escapeHtml(wedding.copy.invitation)}</p></div></article>
          <article class="journey-chapter fade-up"><span class="journey-dot" aria-hidden="true"></span>${photoRevealMarkup(wedding.gallery.traditional[6], wedding.copy.details.traditional, "journey-photo")}<div class="journey-copy"><p class="eyebrow">02 · ${escapeHtml(traditionalDate)}</p><h3>${escapeHtml(wedding.events.traditional.name)}</h3><p>${escapeHtml(wedding.copy.details.completed)}</p><a class="text-link" href="gallery.html?tab=traditional">${escapeHtml(wedding.copy.details.photos)} <span aria-hidden="true">→</span></a></div></article>
          <article class="journey-chapter fade-up"><span class="journey-dot" aria-hidden="true"></span>${photoRevealMarkup(wedding.gallery.preWedding[4], wedding.copy.story.photoAlt[0], "journey-photo")}<div class="journey-copy"><p class="eyebrow">03 · ${escapeHtml(formattedDate(wedding.events.church.date))}</p><h3>${escapeHtml(wedding.events.church.name)}</h3><p>${escapeHtml(wedding.events.church.venue)}</p></div></article>
        </div></section>
        <section class="section story-section dark-section" id="story"><div class="story-layout"><div class="story-copy fade-up"><div class="section-heading story-heading"><p class="eyebrow">${escapeHtml(wedding.copy.story.label)}</p><h2>${escapeHtml(wedding.story.heading)}</h2><span class="ornament" aria-hidden="true">✳</span></div><p>${escapeHtml(wedding.story.text)}</p><p class="story-names">${escapeHtml(wedding.fullNames)}</p></div><div class="story-photos fade-up parallax-photo">${fullImageMarkup(wedding.gallery.preWedding[3], wedding.copy.story.photoAlt[0], "story-photo-main")}</div></div></section>
        <section class="section program-section" id="program">${sectionHeading(wedding.copy.program.label, wedding.copy.program.heading)}
          <div class="program-tabs" role="tablist" aria-label="${escapeHtml(wedding.copy.program.heading)}"><button id="church-tab" role="tab" type="button" aria-selected="true" aria-controls="church-program" tabindex="0">${escapeHtml(wedding.copy.program.churchTab)}</button><button id="reception-tab" role="tab" type="button" aria-selected="false" aria-controls="reception-program" tabindex="-1">${escapeHtml(wedding.copy.program.receptionTab)}</button></div>
          <div class="program-preview-layout"><div class="program-panel-wrap" id="church-program" role="tabpanel" aria-labelledby="church-tab"><div class="program-preview-list">${homeProgramItems(wedding.program.church, "church")}</div></div><div class="program-panel-wrap" id="reception-program" role="tabpanel" aria-labelledby="reception-tab" hidden><div class="program-preview-list">${homeProgramItems(wedding.program.reception, "reception")}</div></div></div>
          <a class="button button-primary print-button" href="assets/Precious-and-Aaron-Wedding-Program.pdf" download="Precious-and-Aaron-Wedding-Program.pdf">${escapeHtml(wedding.copy.program.download)} <span aria-hidden="true">↓</span></a>
        </section>
        <section class="section gallery-section dark-section" id="gallery">${sectionHeading(wedding.copy.gallery.label, wedding.copy.gallery.heading)}<div class="gallery-tabs" role="tablist" aria-label="${escapeHtml(wedding.copy.gallery.heading)}">${galleryTabMarkup("home-gallery")}</div><div class="gallery-panel" id="home-gallery-panel" role="tabpanel" aria-labelledby="home-gallery-tab-0"><div class="gallery-grid home-gallery-grid"></div></div><p class="gallery-empty" hidden>${escapeHtml(wedding.copy.gallery.coming)}</p><a class="button button-outline gallery-full-link" href="gallery.html">${escapeHtml(wedding.copy.gallery.seeFull)} <span aria-hidden="true">→</span></a></section>
        <section class="section details-section" id="details"><div class="direction-heading" id="directions">${sectionHeading(wedding.copy.directions.label, wedding.copy.directions.heading)}</div><div class="maps-grid">${directionsCard("church", wedding.events.church)}${directionsCard("reception", wedding.events.reception)}</div></section>
        <section class="section know-section" id="good-to-know">${sectionHeading(wedding.copy.goodToKnow.label, wedding.copy.goodToKnow.heading)}<div class="know-grid"><article class="know-card fade-up"><h3>${escapeHtml(wedding.copy.goodToKnow.colours)}</h3><div class="swatches">${wedding.colours.map((colour) => `<div><span style="--swatch:${escapeHtml(colour.hex)}" aria-hidden="true"></span><small>${escapeHtml(colour.name)}</small></div>`).join("")}</div></article><article class="know-card fade-up"><h3>${escapeHtml(wedding.copy.goodToKnow.arrival)}</h3><p>${escapeHtml(wedding.copy.goodToKnow.arrivalText)}</p></article><article class="know-card fade-up"><h3>${escapeHtml(wedding.copy.goodToKnow.travel)}</h3><p>${escapeHtml(wedding.copy.goodToKnow.travelText)}</p></article><article class="know-card fade-up"><h3>${escapeHtml(wedding.copy.goodToKnow.questions)}</h3><p>${escapeHtml(wedding.copy.goodToKnow.questionText)}</p><a class="text-link" href="index.html#contact">${escapeHtml(wedding.copy.contactSection.heading)} <span aria-hidden="true">→</span></a></article></div></section>
        <section class="contact-section" id="contact"><div class="contact-content fade-up"><p class="eyebrow">${escapeHtml(wedding.copy.contactSection.label)}</p><h2>${escapeHtml(wedding.copy.contactSection.heading)}</h2><p class="contact-name">${escapeHtml(wedding.contact.name)}</p><p class="contact-phone">${escapeHtml(wedding.contact.phone)}</p><div class="contact-actions"><a class="button button-primary" href="https://wa.me/${whatsappHref}" target="_blank" rel="noopener noreferrer">${escapeHtml(wedding.copy.contactSection.whatsapp)} <span aria-hidden="true">→</span></a><a class="text-link" href="tel:${phoneHref}">${escapeHtml(wedding.copy.contactSection.call)}</a></div></div></section>
      </main>`;
  };

  const homeProgramItems = (items, prefix) => {
    return items.map((item, index) => ({ item, index })).filter(({ item }) => item.featured).map(({ item, index }) => {
      return `<a class="program-preview-item" href="program.html#${prefix}-${index + 1}"><h3>${escapeHtml(item.title || "")}</h3></a>`;
    }).join("");
  };

  const galleryTabMarkup = (prefix) => wedding.copy.gallery.tabs.map((label, index) => `<button type="button" role="tab" id="${prefix}-tab-${index}" aria-controls="${prefix}-panel" aria-selected="${index === 0}" tabindex="${index === 0 ? "0" : "-1"}">${escapeHtml(label)}</button>`).join("");

  const renderGalleryPage = () => `
    <main class="subpage-main gallery-page">
      <section class="section full-gallery-section" id="full-gallery"><div class="subpage-intro dark-section">${sectionHeading(wedding.copy.gallery.label, wedding.copy.gallery.heading)}<a class="text-link back-link" href="index.html">${escapeHtml(wedding.copy.gallery.backHome)} <span aria-hidden="true">←</span></a></div>
        <div class="gallery-tabs" role="tablist" aria-label="${escapeHtml(wedding.copy.gallery.heading)}">${galleryTabMarkup("full-gallery")}</div>
        <div class="gallery-panel" id="full-gallery-panel" role="tabpanel" aria-labelledby="full-gallery-tab-0"><div class="gallery-grid full-gallery-grid"></div></div>
        <p class="gallery-empty" hidden>${escapeHtml(wedding.copy.gallery.coming)}</p>
        <button class="button button-outline load-more-button" type="button">${escapeHtml(wedding.copy.gallery.loadMore)}</button>
      </section>
    </main>`;

  const programFields = (item) => `
    ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
    ${item.notes ? `<p class="program-note">${escapeHtml(item.notes)}</p>` : ""}
    ${item.hymn ? `<p class="program-detail"><span>Hymn</span>${escapeHtml(item.hymn)}</p>` : ""}
    ${item.speaker ? `<p class="program-detail"><span>Speaker</span>${escapeHtml(item.speaker)}</p>` : ""}`;

  const peopleListMarkup = (title, people, type) => {
    if (!people?.length) return "";
    const list = type === "ministers"
      ? `<ul class="roster-list">${people.map(({ role, name }) => `<li>${role ? `<span class="roster-role">${escapeHtml(role)}</span>` : ""}<span class="roster-name">${escapeHtml(name)}</span></li>`).join("")}</ul>`
      : `<dl class="roster-list">${people.map(({ role, names }) => `<div><dt class="roster-role">${escapeHtml(role)}</dt><dd class="roster-name">${names.map(escapeHtml).join(", ")}</dd></div>`).join("")}</dl>`;
    return `<section class="program-roster program-roster-${type}"><h2>${escapeHtml(title)}</h2>${list}</section>`;
  };

  const timelineMarkup = (items, prefix) => {
    let lastGroup = null;
    return items.map((item, index) => {
      const groupHeading = item.group && item.group !== lastGroup ? `<h3 class="timeline-group">${escapeHtml(item.group)}</h3>` : "";
      lastGroup = item.group || null;
      const number = String(index + 1).padStart(2, "0");
      const hasTime = Boolean(item.time?.trim());
      return `${groupHeading}<article class="timeline-item fade-up${hasTime ? " has-time" : " no-time"}" id="${prefix}-${index + 1}">${hasTime ? `<div class="timeline-time">${escapeHtml(item.time)}</div>` : ""}<div class="timeline-marker" aria-hidden="true"></div><div class="timeline-content"><p class="eyebrow">${number}</p><h3>${escapeHtml(item.title || "")}</h3>${programFields(item)}</div></article>`;
    }).join("");
  };

  const renderProgramPage = () => `
    <main class="subpage-main program-page">
      <section class="section full-program-section"><div class="subpage-intro dark-section">${sectionHeading(wedding.copy.program.label, wedding.copy.program.heading)}<a class="text-link back-link" href="index.html#program">Back to home <span aria-hidden="true">←</span></a></div>
        <div class="program-sticky-tabs"><div class="program-tabs" role="tablist" aria-label="${escapeHtml(wedding.copy.program.heading)}"><button id="full-church-tab" role="tab" type="button" aria-selected="true" aria-controls="full-church-panel" tabindex="0">${escapeHtml(wedding.copy.program.churchTab)}</button><button id="full-reception-tab" role="tab" type="button" aria-selected="false" aria-controls="full-reception-panel" tabindex="-1">${escapeHtml(wedding.copy.program.receptionTab)}</button></div></div>
        <section class="timeline-panel" id="full-church-panel" role="tabpanel" aria-labelledby="full-church-tab">${peopleListMarkup("Officiating Ministers", wedding.program.officiating, "ministers")}<div class="timeline">${timelineMarkup(wedding.program.church, "church")}</div></section>
        <section class="timeline-panel" id="full-reception-panel" role="tabpanel" aria-labelledby="full-reception-tab" hidden>${peopleListMarkup("Bridal Crew", wedding.program.bridalCrew, "crew")}<div class="timeline">${timelineMarkup(wedding.program.reception, "reception")}</div></section>
        <a id="download" class="button button-primary print-button" href="assets/Precious-and-Aaron-Wedding-Program.pdf" download="Precious-and-Aaron-Wedding-Program.pdf">${escapeHtml(wedding.copy.program.download)} <span aria-hidden="true">↓</span></a><button class="print-link print-program" type="button">${escapeHtml(wedding.copy.program.print)}</button>
      </section>
    </main>`;

  const mainMarkup = page === "gallery" ? renderGalleryPage() : page === "program" ? renderProgramPage() : renderHome();
  $("#site").innerHTML = `${nav()}${mainMarkup}${footer()}`;

  const header = $(".site-header");
  const menuToggle = $(".menu-toggle");
  const siteNav = $("#site-nav");
  const setHeaderState = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
  window.addEventListener("scroll", setHeaderState, { passive: true });
  setHeaderState();
  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    siteNav.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
  });
  $$("#site-nav a").forEach((link) => link.addEventListener("click", () => {
    siteNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    document.body.classList.remove("menu-open");
  }));
  $$(".print-program").forEach((button) => button.addEventListener("click", () => window.print()));

  const homeProgramTabs = $$(".program-tabs [role=tab]").filter((tab) => tab.id === "church-tab" || tab.id === "reception-tab");
  const activateHomeProgramTab = (tab) => {
    homeProgramTabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
      $(`#${item.getAttribute("aria-controls")}`).hidden = !selected;
    });
  };
  homeProgramTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateHomeProgramTab(tab));
    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      const next = homeProgramTabs[(index + (event.key === "ArrowRight" ? 1 : -1) + homeProgramTabs.length) % homeProgramTabs.length];
      next.focus();
      activateHomeProgramTab(next);
    });
  });
  const fullProgramTabs = $$(".program-sticky-tabs [role=tab]");
  const activateFullProgramTab = (tab) => {
    fullProgramTabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
      $(`#${item.getAttribute("aria-controls")}`).hidden = !selected;
    });
    observeFadeUps();
  };
  fullProgramTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateFullProgramTab(tab));
    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      const next = fullProgramTabs[(index + (event.key === "ArrowRight" ? 1 : -1) + fullProgramTabs.length) % fullProgramTabs.length];
      next.focus();
      activateFullProgramTab(next);
    });
  });
  if (page === "program" && window.location.hash) {
    const target = $(window.location.hash);
    if (target?.classList.contains("timeline-item") && target.id.startsWith("reception-")) {
      const receptionTab = $("#full-reception-tab");
      activateFullProgramTab(receptionTab);
      requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
    }
  }
  if (page === "program" && window.location.hash === "#download") {
    const downloadButton = $("#download");
    if (downloadButton) {
      const goToDownload = () => downloadButton.scrollIntoView({ block: "center", behavior: "instant" });
      requestAnimationFrame(goToDownload);
      window.addEventListener("load", goToDownload, { once: true });
    }
  }
  
  $$(".copy-address").forEach((button) => {
    button.addEventListener("click", async () => {
      const status = $(".copy-status", button);
      try {
        if (!navigator.clipboard?.writeText) throw new Error("Clipboard access is unavailable.");
        await navigator.clipboard.writeText(button.dataset.address);
        status.textContent = "Copied";
      } catch {
        status.textContent = "Unable to copy";
      }
      window.setTimeout(() => {
        status.textContent = "";
      }, 2000);
    });
  });

  const galleryGroups = [wedding.gallery.preWedding, wedding.gallery.traditional, wedding.gallery.whiteWedding];
  const galleryTabs = $$(".gallery-tabs [role=tab]");
  const galleryGrid = page === "gallery" ? $(".full-gallery-grid") : $(".home-gallery-grid");
  const galleryPanel = page === "gallery" ? $("#full-gallery-panel") : $("#home-gallery-panel");
  const galleryEmpty = $(".gallery-empty");
  const loadMoreButton = $(".load-more-button");
  let activeGalleryIndex = 0;
  let activePhotoIndex = 0;
  let visiblePhotoCount = 12;
  let lightboxOpener = null;
  let touchStartX = 0;

  const galleryTileLayout = (index, groupIndex, photoCount) => {
    const rowStart = Math.floor(index / 3) * 3;
    const rowSize = Math.min(3, photoCount - rowStart);
    const rowIndex = Math.floor(index / 3);
    const patterns = rowSize === 3
      ? [[6, 3, 3], [3, 6, 3], [3, 3, 6], [4, 4, 4]]
      : rowSize === 2
        ? [[8, 4], [4, 8], [6, 6], [6, 6]]
        : [[12]];
    const seed = (groupIndex * 7 + rowIndex * 5) % patterns.length;
    const mobilePatterns = rowSize === 3 ? [[2, 2, 2]] : rowSize === 2 ? [[4, 2], [2, 4], [3, 3]] : [[6]];
    const mobileSeed = (groupIndex * 3 + rowIndex) % mobilePatterns.length;
    return {
      columns: patterns[seed][index - rowStart],
      mobileColumns: mobilePatterns[mobileSeed][index - rowStart],
      rows: 2 + ((groupIndex + rowIndex) % 2)
    };
  };

  const createPhotoButtons = (photos, start, end, groupIndex, layoutCount) => photos.slice(start, end).map((photo, offset) => {
    const index = start + offset;
    const tile = galleryTileLayout(index, groupIndex, layoutCount);
    return `
      <button class="gallery-item fade-up" type="button" data-photo-index="${index}" aria-label="Open ${escapeHtml(wedding.copy.gallery.tabs[groupIndex])} photo ${index + 1}" style="--gallery-order:${index % 6};--tile-columns:${tile.columns};--tile-columns-mobile:${tile.mobileColumns};--tile-rows:${tile.rows}">
        ${imageMarkup(photo, `${wedding.copy.gallery.tabs[groupIndex]} photograph ${index + 1}`)}
      </button>`;
  }).join("");

  const renderGallery = (index) => {
    activeGalleryIndex = index;
    visiblePhotoCount = 12;
    galleryTabs.forEach((tab, tabIndex) => {
      const selected = index === tabIndex;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    galleryPanel.setAttribute("aria-labelledby", galleryTabs[index].id);
    const photos = galleryGroups[index];
    const homeLimit = page === "home" ? 6 : photos.length;
    const limit = Math.min(visiblePhotoCount, homeLimit, photos.length);
    galleryPanel.hidden = photos.length === 0;
    if (galleryEmpty) galleryEmpty.hidden = photos.length !== 0;
    galleryGrid.innerHTML = createPhotoButtons(photos, 0, limit, index, limit);
    if (loadMoreButton) loadMoreButton.hidden = limit >= photos.length;
    observeFadeUps();
  };

  galleryTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => renderGallery(index));
    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      const nextIndex = (index + (event.key === "ArrowRight" ? 1 : -1) + galleryTabs.length) % galleryTabs.length;
      galleryTabs[nextIndex].focus();
      renderGallery(nextIndex);
    });
  });
  loadMoreButton?.addEventListener("click", () => {
    const photos = galleryGroups[activeGalleryIndex];
    const nextCount = Math.min(visiblePhotoCount + 12, photos.length);
    galleryGrid.insertAdjacentHTML("beforeend", createPhotoButtons(photos, visiblePhotoCount, nextCount, activeGalleryIndex, nextCount));
    visiblePhotoCount = nextCount;
    loadMoreButton.hidden = visiblePhotoCount >= photos.length;
    observeFadeUps();
  });
  if (page === "gallery") {
    const selectedTab = new URLSearchParams(window.location.search).get("tab");
    renderGallery(selectedTab === "traditional" ? 1 : selectedTab === "white" ? 2 : 0);
  } else if (page === "home") {
    renderGallery(0);
  }

  const lightbox = $("#lightbox");
  const lightboxImage = $("img", lightbox);
  const lightboxCaption = $("figcaption", lightbox);
  const lightboxButtons = [$(".lightbox-prev", lightbox), $(".lightbox-next", lightbox)];
  const displayLightboxPhoto = () => {
    const photo = galleryGroups[activeGalleryIndex][activePhotoIndex];
    lightboxImage.src = photo.full;
    lightboxImage.width = photo.width;
    lightboxImage.height = photo.height;
    lightboxImage.alt = `${wedding.copy.gallery.tabs[activeGalleryIndex]} photograph ${activePhotoIndex + 1}`;
    lightboxCaption.textContent = `${wedding.copy.gallery.tabs[activeGalleryIndex]} · ${activePhotoIndex + 1} / ${galleryGroups[activeGalleryIndex].length}`;
    lightboxImage.classList.remove("is-zoomed");
    lightboxButtons.forEach((button) => button.hidden = false);
  };
  const openLightbox = (index, opener) => {
    activePhotoIndex = index;
    lightboxOpener = opener;
    const source = $("img", opener) || opener;
    const sourceRect = source.getBoundingClientRect();
    displayLightboxPhoto();
    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    $(".lightbox-close", lightbox).focus();
    requestAnimationFrame(() => {
      lightbox.classList.add("is-open");
      if (reducedMotion) return;
      const targetRect = lightboxImage.getBoundingClientRect();
      if (!targetRect.width || !targetRect.height) return;
      lightboxImage.style.transformOrigin = "top left";
      lightboxImage.style.transition = "none";
      lightboxImage.style.transform = `translate(${sourceRect.left - targetRect.left}px, ${sourceRect.top - targetRect.top}px) scale(${sourceRect.width / targetRect.width}, ${sourceRect.height / targetRect.height})`;
      requestAnimationFrame(() => {
        lightboxImage.style.transition = "";
        lightboxImage.style.transform = "";
      });
    });
  };
  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    lightbox.hidden = true;
    document.body.classList.remove("lightbox-open");
    lightboxOpener?.focus();
  };
  const moveLightbox = (direction) => {
    const photos = galleryGroups[activeGalleryIndex];
    activePhotoIndex = (activePhotoIndex + direction + photos.length) % photos.length;
    displayLightboxPhoto();
  };
  galleryGrid?.addEventListener("click", (event) => {
    const button = event.target.closest(".gallery-item");
    if (button) openLightbox(Number(button.dataset.photoIndex), button);
  });
  $(".lightbox-close", lightbox)?.addEventListener("click", closeLightbox);
  lightboxButtons[0]?.addEventListener("click", () => moveLightbox(-1));
  lightboxButtons[1]?.addEventListener("click", () => moveLightbox(1));
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  lightbox.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener("touchend", (event) => {
    if (lightbox.hidden) return;
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 50) moveLightbox(distance < 0 ? 1 : -1);
  }, { passive: true });
  lightboxImage.addEventListener("transitionend", () => {
    lightboxImage.style.transformOrigin = "";
  });
  lightboxImage.addEventListener("click", () => lightboxImage.classList.toggle("is-zoomed"));
  document.addEventListener("keydown", (event) => {
    if (lightbox.hidden) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") moveLightbox(-1);
    if (event.key === "ArrowRight") moveLightbox(1);
    if (event.key === "Tab") {
      const focusable = $$("button", lightbox);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  if (page === "home") {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    $$(".countdown").forEach((element) => {
      const eventDate = wedding.events.church.date;
      const targetDate = eventDate === "TBD" ? Number.NaN : new Date(eventDate).getTime();
      const status = $(".countdown-status", element);
      const units = $(".countdown-units", element);
      const update = () => {
        if (Number.isNaN(targetDate)) {
          status.textContent = wedding.copy.status.tbd;
          units.hidden = true;
          return;
        }
        const difference = targetDate - Date.now();
        if (element.id === "hero-countdown" && difference <= 0 && difference > -12 * 60 * 60 * 1000) {
          status.textContent = wedding.copy.status.today;
          units.hidden = true;
          return;
        }
        if (difference <= 0) {
          status.textContent = element.id === "hero-countdown" ? wedding.copy.status.thanks : wedding.copy.status.today;
          units.hidden = true;
          return;
        }
        status.textContent = "";
        units.hidden = false;
        const seconds = Math.floor(difference / 1000);
        const values = { days: Math.floor(seconds / 86400), hours: Math.floor((seconds % 86400) / 3600), minutes: Math.floor((seconds % 3600) / 60), seconds: seconds % 60 };
        Object.entries(values).forEach(([unit, value]) => {
          const digit = $(`[data-unit="${unit}"]`, element);
          const nextValue = String(value).padStart(2, "0");
          if (digit.textContent === nextValue) return;
          digit.textContent = nextValue;
          if (!reducedMotion) {
            digit.classList.remove("is-rolling");
            requestAnimationFrame(() => digit.classList.add("is-rolling"));
          }
        });
      };
      update();
      window.setInterval(update, 1000);
    });
  }

  const progressBar = $(".scroll-progress span");
  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = `scaleX(${scrollable > 0 ? window.scrollY / scrollable : 0})`;
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  revealObserver = "IntersectionObserver" in window ? new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 }) : null;
  function observeFadeUps() {
    $$(".fade-up:not(.is-visible), .photo-reveal:not(.is-visible), .journey-track:not(.is-visible)").forEach((element) => {
      if (revealObserver) revealObserver.observe(element);
      else element.classList.add("is-visible");
    });
  }
  observeFadeUps();
  if (page === "home" && !reducedMotion) {
    const storyPhoto = $(".parallax-photo");
    let parallaxFrame = 0;
    const updateParallax = () => {
      if (parallaxFrame) return;
      parallaxFrame = requestAnimationFrame(() => {
        parallaxFrame = 0;
        if (!storyPhoto) return;
        const bounds = storyPhoto.getBoundingClientRect();
        const offset = Math.max(-40, Math.min(40, (window.innerHeight / 2 - (bounds.top + bounds.height / 2)) * 0.08));
        storyPhoto.style.setProperty("--parallax-y", `${offset}px`);
      });
    };
    window.addEventListener("scroll", updateParallax, { passive: true });
    window.addEventListener("resize", updateParallax);
    updateParallax();
  }
})();
