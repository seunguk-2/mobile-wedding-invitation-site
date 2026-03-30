"use strict";

let invitation = null;
let toastTimer = 0;

const galleryViewerState = {
  activeIndex: 0,
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const PHONE_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.11.37 2.3.56 3.57.56a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.07 21 3 13.93 3 5a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.27.19 2.46.56 3.57a1 1 0 0 1-.24 1.02l-2.2 2.2Z" fill="currentColor"></path>
  </svg>
`;

const SMS_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H8.41L5 19.41V16H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm2 4v2h12V9H6Zm0 4v1h8v-1H6Z" fill="currentColor"></path>
  </svg>
`;

const elements = {
  metaDescription: document.querySelector('meta[name="description"]'),
  heroDate: document.getElementById("heroDate"),
  groomName: document.getElementById("groomName"),
  brideName: document.getElementById("brideName"),
  heroVenue: document.getElementById("heroVenue"),
  heroMessage: document.getElementById("heroMessage"),
  heroMedia: document.getElementById("heroMedia"),
  heroImage: document.getElementById("heroImage"),
  heroImageCaption: document.getElementById("heroImageCaption"),
  invitationMessage: document.getElementById("invitationMessage"),
  galleryNote: document.getElementById("galleryNote"),
  footerTitle: document.getElementById("footerTitle"),
  footerCopy: document.getElementById("footerCopy"),
  groomFullName: document.getElementById("groomFullName"),
  brideFullName: document.getElementById("brideFullName"),
  groomParents: document.getElementById("groomParents"),
  brideParents: document.getElementById("brideParents"),
  groomPhoneLink: document.getElementById("groomPhoneLink"),
  groomSmsLink: document.getElementById("groomSmsLink"),
  groomParentPhoneLink: document.getElementById("groomParentPhoneLink"),
  groomParentSmsLink: document.getElementById("groomParentSmsLink"),
  bridePhoneLink: document.getElementById("bridePhoneLink"),
  brideSmsLink: document.getElementById("brideSmsLink"),
  brideParentPhoneLink: document.getElementById("brideParentPhoneLink"),
  brideParentSmsLink: document.getElementById("brideParentSmsLink"),
  ceremonySummary: document.getElementById("ceremonySummary"),
  ceremonyDescription: document.getElementById("ceremonyDescription"),
  venueName: document.getElementById("venueName"),
  venueAddress: document.getElementById("venueAddress"),
  countdownTitle: document.getElementById("countdownTitle"),
  countdownBadge: document.getElementById("countdownBadge"),
  countDays: document.getElementById("countDays"),
  countHours: document.getElementById("countHours"),
  countMinutes: document.getElementById("countMinutes"),
  calendarTitle: document.getElementById("calendarTitle"),
  calendarBadge: document.getElementById("calendarBadge"),
  calendarGrid: document.getElementById("calendarGrid"),
  galleryTrack: document.getElementById("galleryTrack"),
  galleryDots: document.getElementById("galleryDots"),
  timelineList: document.getElementById("timelineList"),
  shareButton: document.getElementById("shareButton"),
  bottomShareButton: document.getElementById("bottomShareButton"),
  toast: document.getElementById("toast"),
  galleryViewer: document.getElementById("galleryViewer"),
  galleryViewerBackdrop: document.getElementById("galleryViewerBackdrop"),
  galleryViewerTrack: document.getElementById("galleryViewerTrack"),
  galleryViewerIndex: document.getElementById("galleryViewerIndex"),
  galleryViewerTitle: document.getElementById("galleryViewerTitle"),
  galleryViewerCaption: document.getElementById("galleryViewerCaption"),
  galleryViewerClose: document.getElementById("galleryViewerClose"),
  galleryViewerPrev: document.getElementById("galleryViewerPrev"),
  galleryViewerNext: document.getElementById("galleryViewerNext"),
};

function trimText(value) {
  return String(value || "").trim();
}

function joinNonEmpty(values, separator) {
  return values.filter(Boolean).join(separator);
}

function toDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function hasUsableHref(value) {
  return Boolean(trimText(value));
}

function ceremonyTimeText() {
  const minute = Number(invitation.ceremony.minute) || 0;
  return `${invitation.ceremony.hour}:${String(minute).padStart(2, "0")} ${invitation.ceremony.meridiem}`;
}

function ceremonyText() {
  return `${invitation.ceremony.weekday}, ${MONTHS[invitation.ceremony.month - 1]} ${invitation.ceremony.day}, ${invitation.ceremony.year} at ${ceremonyTimeText()}`;
}

function venueText() {
  return joinNonEmpty([invitation.venue.name, invitation.venue.hall], " ");
}

function familyLine(person) {
  const relationship = trimText(person.relationship);
  const parents = joinNonEmpty([trimText(person.father), trimText(person.mother)], " and ");
  if (relationship && parents) {
    return `${relationship} of ${parents}`;
  }
  return parents;
}

function showToast(message) {
  if (!elements.toast) {
    return;
  }

  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => {
    elements.toast.classList.remove("is-visible");
  }, 2200);
}

async function copyText(value) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }

    const helper = document.createElement("textarea");
    helper.value = value;
    helper.setAttribute("readonly", "true");
    helper.style.position = "absolute";
    helper.style.left = "-9999px";
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    document.body.removeChild(helper);
    return true;
  } catch (error) {
    return false;
  }
}

function setHeroImage() {
  const imageUrl = trimText(invitation.ui.heroImage);
  const caption = trimText(invitation.ui.heroImageCaption);

  elements.heroMedia.classList.toggle("is-empty", !imageUrl);

  if (imageUrl) {
    elements.heroImage.hidden = false;
    elements.heroImage.src = imageUrl;
    elements.heroImage.alt = trimText(invitation.ui.heroImageAlt) || "Hero image";
  } else {
    elements.heroImage.hidden = true;
    elements.heroImage.removeAttribute("src");
    elements.heroImage.alt = "";
  }

  elements.heroImageCaption.hidden = !caption;
  elements.heroImageCaption.textContent = caption;
}

function setContactLink(anchor, phone, kind, label) {
  const digits = toDigits(phone);
  const href = digits ? `${kind === "call" ? "tel" : "sms"}:${digits}` : "";

  anchor.innerHTML = `${kind === "call" ? PHONE_ICON : SMS_ICON}<span class="sr-only">${label}</span>`;
  anchor.classList.toggle("is-disabled", !href);
  anchor.setAttribute("aria-label", label);
  anchor.setAttribute("title", label);

  if (!href) {
    anchor.removeAttribute("href");
    anchor.setAttribute("aria-disabled", "true");
    return;
  }

  anchor.href = href;
  anchor.removeAttribute("aria-disabled");
}

function fillBasicContent() {
  document.title = invitation.title;
  if (elements.metaDescription) {
    elements.metaDescription.content = invitation.invitationMessage;
  }

  elements.heroDate.textContent = ceremonyText();
  elements.groomName.textContent = invitation.groom.name;
  elements.brideName.textContent = invitation.bride.name;
  elements.heroVenue.textContent = joinNonEmpty([venueText(), invitation.venue.detail], " · ");
  elements.heroMessage.textContent = invitation.ui.heroMessage;
  elements.invitationMessage.textContent = invitation.invitationMessage;
  elements.galleryNote.textContent = invitation.ui.galleryNote;
  elements.footerTitle.textContent = invitation.ui.footerTitle;
  elements.footerCopy.textContent = invitation.ui.footerCopy;

  elements.groomFullName.textContent = invitation.groom.fullName;
  elements.brideFullName.textContent = invitation.bride.fullName;
  elements.groomParents.textContent = familyLine(invitation.groom);
  elements.brideParents.textContent = familyLine(invitation.bride);

  setHeroImage();

  setContactLink(elements.groomPhoneLink, invitation.groom.phone, "call", "Call the groom");
  setContactLink(elements.groomSmsLink, invitation.groom.phone, "sms", "Text the groom");
  setContactLink(
    elements.groomParentPhoneLink,
    invitation.groom.parentPhone,
    "call",
    "Call the groom's parents",
  );
  setContactLink(
    elements.groomParentSmsLink,
    invitation.groom.parentPhone,
    "sms",
    "Text the groom's parents",
  );
  setContactLink(elements.bridePhoneLink, invitation.bride.phone, "call", "Call the bride");
  setContactLink(elements.brideSmsLink, invitation.bride.phone, "sms", "Text the bride");
  setContactLink(
    elements.brideParentPhoneLink,
    invitation.bride.parentPhone,
    "call",
    "Call the bride's parents",
  );
  setContactLink(
    elements.brideParentSmsLink,
    invitation.bride.parentPhone,
    "sms",
    "Text the bride's parents",
  );

  elements.ceremonySummary.textContent = ceremonyText();
  elements.ceremonyDescription.textContent = invitation.ceremony.description;
  elements.venueName.textContent = venueText();
  elements.venueAddress.textContent = joinNonEmpty(
    [trimText(invitation.venue.address), trimText(invitation.venue.detail)],
    " · ",
  );
}

function renderCalendar() {
  const year = invitation.ceremony.year;
  const monthIndex = invitation.ceremony.month - 1;
  const eventDay = invitation.ceremony.day;
  const firstDay = new Date(year, monthIndex, 1);
  const lastDate = new Date(year, monthIndex + 1, 0).getDate();
  const startOffset = firstDay.getDay();

  elements.calendarTitle.textContent = `${MONTHS[monthIndex]} ${year}`;
  elements.calendarBadge.textContent = `${invitation.ceremony.weekday}, ${MONTHS[monthIndex]} ${eventDay}`;
  elements.calendarGrid.innerHTML = "";

  for (let index = 0; index < startOffset; index += 1) {
    const blank = document.createElement("div");
    blank.className = "calendar-cell is-empty";
    elements.calendarGrid.appendChild(blank);
  }

  for (let date = 1; date <= lastDate; date += 1) {
    const cell = document.createElement("div");
    cell.className = "calendar-cell";

    const dateLabel = document.createElement("span");
    dateLabel.className = "calendar-date";
    dateLabel.textContent = String(date);
    cell.appendChild(dateLabel);

    if (date === eventDay) {
      cell.classList.add("is-event");
      const note = document.createElement("span");
      note.className = "calendar-note";
      note.textContent = "Wedding";
      cell.appendChild(note);
    }

    elements.calendarGrid.appendChild(cell);
  }
}

function updateCountdown() {
  const target = new Date(invitation.ceremony.iso).getTime();
  const now = Date.now();
  const diff = target - now;
  const minute = 1000 * 60;
  const hour = minute * 60;
  const day = hour * 24;

  if (diff <= 0) {
    elements.countdownTitle.textContent = "Today is our wedding day";
    elements.countdownBadge.textContent = "Celebrate with us";
    elements.countDays.textContent = "0";
    elements.countHours.textContent = "0";
    elements.countMinutes.textContent = "0";
    return;
  }

  const days = Math.floor(diff / day);
  const hours = Math.floor((diff % day) / hour);
  const minutes = Math.floor((diff % hour) / minute);

  elements.countdownTitle.textContent = `${invitation.groom.name} & ${invitation.bride.name}'s wedding is getting close`;
  elements.countdownBadge.textContent = `D-${days}`;
  elements.countDays.textContent = String(days);
  elements.countHours.textContent = String(hours);
  elements.countMinutes.textContent = String(minutes);
}

function createGalleryCard(item, index, useButton) {
  const node = document.createElement(useButton ? "button" : "article");
  node.className = "gallery-card gallery-slide";
  node.style.setProperty("--tone-a", item.tones[0]);
  node.style.setProperty("--tone-b", item.tones[1]);

  if (useButton) {
    node.type = "button";
  }

  if (item.image) {
    node.classList.add("has-image");
    const image = document.createElement("img");
    image.className = "gallery-image";
    image.src = item.image;
    image.alt = item.alt || item.title || `Gallery image ${index + 1}`;
    image.draggable = false;
    image.loading = "lazy";
    image.decoding = "async";
    node.appendChild(image);
  }

  const copy = document.createElement("span");
  copy.className = "gallery-copy";

  const title = document.createElement("strong");
  title.className = "gallery-title";
  title.textContent = item.title;

  const caption = document.createElement("span");
  caption.className = "gallery-caption";
  caption.textContent = item.caption;

  copy.append(title, caption);
  node.appendChild(copy);
  return node;
}

function clearNode(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function updateActiveDots(activeIndex) {
  const dots = elements.galleryDots.querySelectorAll(".gallery-dot");
  dots.forEach((dot, index) => {
    dot.classList.toggle("is-active", index === activeIndex);
    dot.setAttribute("aria-current", index === activeIndex ? "true" : "false");
  });
}

function findClosestTrackIndex(track) {
  const children = Array.from(track.children);
  if (children.length === 0) {
    return 0;
  }

  const trackRect = track.getBoundingClientRect();
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  children.forEach((child, index) => {
    const childRect = child.getBoundingClientRect();
    const distance = Math.abs(childRect.left - trackRect.left - 8);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
}

function scrollTrackToIndex(track, index, behavior) {
  const target = track.children[index];
  if (!target) {
    return;
  }

  target.scrollIntoView({
    behavior: behavior || "smooth",
    block: "nearest",
    inline: "start",
  });
}

function updateGalleryViewerMeta(index) {
  galleryViewerState.activeIndex = index;
  const item = invitation.gallery[index];
  if (!item) {
    return;
  }

  elements.galleryViewerIndex.textContent = `${index + 1} / ${invitation.gallery.length}`;
  elements.galleryViewerTitle.textContent = item.title;
  elements.galleryViewerCaption.textContent = item.caption;
  elements.galleryViewerPrev.disabled = index <= 0;
  elements.galleryViewerNext.disabled = index >= invitation.gallery.length - 1;
}

function openGalleryViewer(index) {
  elements.galleryViewer.hidden = false;
  document.body.classList.add("is-modal-open");
  updateGalleryViewerMeta(index);
  window.requestAnimationFrame(() => {
    scrollTrackToIndex(elements.galleryViewerTrack, index, "auto");
  });
}

function closeGalleryViewer() {
  elements.galleryViewer.hidden = true;
  document.body.classList.remove("is-modal-open");
}

function renderGalleryViewerSlides() {
  clearNode(elements.galleryViewerTrack);

  invitation.gallery.forEach((item, index) => {
    const slide = document.createElement("div");
    slide.className = "gallery-viewer-slide";

    if (item.image) {
      const image = document.createElement("img");
      image.className = "gallery-viewer-image";
      image.src = item.image;
      image.alt = item.alt || item.title || `Gallery image ${index + 1}`;
      image.loading = "lazy";
      image.decoding = "async";
      image.draggable = false;
      slide.appendChild(image);
    } else {
      slide.appendChild(createGalleryCard(item, index, false));
    }

    elements.galleryViewerTrack.appendChild(slide);
  });
}

function renderGallery() {
  clearNode(elements.galleryTrack);
  clearNode(elements.galleryDots);

  invitation.gallery.forEach((item, index) => {
    const card = createGalleryCard(item, index, true);
    card.addEventListener("click", () => {
      openGalleryViewer(index);
    });
    elements.galleryTrack.appendChild(card);

    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "gallery-dot";
    dot.setAttribute("aria-label", `Go to gallery slide ${index + 1}`);
    dot.addEventListener("click", () => {
      scrollTrackToIndex(elements.galleryTrack, index);
      updateActiveDots(index);
    });
    elements.galleryDots.appendChild(dot);
  });

  renderGalleryViewerSlides();
  updateActiveDots(0);
  updateGalleryViewerMeta(0);
}

function renderTimeline() {
  elements.timelineList.innerHTML = "";

  invitation.timeline.forEach((item) => {
    const article = document.createElement("article");
    article.className = "timeline-item";

    const step = document.createElement("span");
    step.className = "timeline-step";
    step.textContent = item.step;

    const title = document.createElement("strong");
    title.className = "timeline-title";
    title.textContent = item.title;

    const body = document.createElement("p");
    body.className = "notice-body";
    body.textContent = item.body;

    article.append(step, title, body);
    elements.timelineList.appendChild(article);
  });
}

async function shareInvitation() {
  const shareData = {
    title: invitation.title,
    text: `You're invited to the wedding of ${invitation.groom.name} and ${invitation.bride.name}.`,
    url: window.location.href,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }
  } catch (error) {
    if (error && error.name === "AbortError") {
      return;
    }
  }

  const copied = await copyText(window.location.href);
  showToast(copied ? "The page link has been copied." : "Sharing is not supported on this device.");
}

function rerenderInvitation() {
  fillBasicContent();
  renderCalendar();
  updateCountdown();
  renderGallery();
  renderTimeline();
}

function bindGalleryTrack() {
  elements.galleryTrack.addEventListener("scroll", () => {
    updateActiveDots(findClosestTrackIndex(elements.galleryTrack));
  });

  elements.galleryViewerTrack.addEventListener("scroll", () => {
    const index = findClosestTrackIndex(elements.galleryViewerTrack);
    updateGalleryViewerMeta(index);
  });
}

function bindGalleryViewer() {
  elements.galleryViewerBackdrop.addEventListener("click", closeGalleryViewer);
  elements.galleryViewerClose.addEventListener("click", closeGalleryViewer);
  elements.galleryViewerPrev.addEventListener("click", () => {
    const nextIndex = Math.max(0, galleryViewerState.activeIndex - 1);
    scrollTrackToIndex(elements.galleryViewerTrack, nextIndex);
    updateGalleryViewerMeta(nextIndex);
  });
  elements.galleryViewerNext.addEventListener("click", () => {
    const nextIndex = Math.min(invitation.gallery.length - 1, galleryViewerState.activeIndex + 1);
    scrollTrackToIndex(elements.galleryViewerTrack, nextIndex);
    updateGalleryViewerMeta(nextIndex);
  });

  document.addEventListener("keydown", (event) => {
    if (elements.galleryViewer.hidden) {
      return;
    }

    if (event.key === "Escape") {
      closeGalleryViewer();
      return;
    }

    if (event.key === "ArrowLeft") {
      elements.galleryViewerPrev.click();
      return;
    }

    if (event.key === "ArrowRight") {
      elements.galleryViewerNext.click();
    }
  });

  window.addEventListener("resize", () => {
    if (elements.galleryViewer.hidden) {
      return;
    }
    scrollTrackToIndex(elements.galleryViewerTrack, galleryViewerState.activeIndex, "auto");
  });
}

function bindEvents() {
  elements.shareButton.addEventListener("click", shareInvitation);
  elements.bottomShareButton.addEventListener("click", shareInvitation);

  bindGalleryTrack();
  bindGalleryViewer();

  window.addEventListener("storage", async (event) => {
    if (event.key === window.WeddingInvitationStore.CONTENT_STORAGE_KEY) {
      invitation = await window.WeddingInvitationStore.loadInvitation();
      rerenderInvitation();
    }
  });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  if (!window.location.protocol.startsWith("http")) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      return undefined;
    });
  });
}

async function init() {
  invitation = await window.WeddingInvitationStore.loadInvitation();
  rerenderInvitation();
  bindEvents();
  registerServiceWorker();
  window.setInterval(updateCountdown, 60 * 1000);
}

init();
