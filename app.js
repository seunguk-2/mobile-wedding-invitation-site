"use strict";

let invitation = null;
let toastTimer = 0;

const galleryViewerState = {
  activeIndex: 0,
};

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
  accountNote: document.getElementById("accountNote"),
  rsvpNote: document.getElementById("rsvpNote"),
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
  mapVenueName: document.getElementById("mapVenueName"),
  locationAddress: document.getElementById("locationAddress"),
  locationDetail: document.getElementById("locationDetail"),
  kakaoMapLink: document.getElementById("kakaoMapLink"),
  naverMapLink: document.getElementById("naverMapLink"),
  tmapLink: document.getElementById("tmapLink"),
  googleMapLink: document.getElementById("googleMapLink"),
  copyAddressButton: document.getElementById("copyAddressButton"),
  directionsFigure: document.getElementById("directionsFigure"),
  directionsImage: document.getElementById("directionsImage"),
  transportList: document.getElementById("transportList"),
  noticeList: document.getElementById("noticeList"),
  accountList: document.getElementById("accountList"),
  shareButton: document.getElementById("shareButton"),
  bottomShareButton: document.getElementById("bottomShareButton"),
  toast: document.getElementById("toast"),
  rsvpForm: document.getElementById("rsvpForm"),
  resetRsvpButton: document.getElementById("resetRsvpButton"),
  saveNote: document.getElementById("saveNote"),
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
  return minute > 0
    ? `${invitation.ceremony.meridiem} ${invitation.ceremony.hour}시 ${minute}분`
    : `${invitation.ceremony.meridiem} ${invitation.ceremony.hour}시`;
}

function ceremonyText() {
  return `${invitation.ceremony.year}년 ${invitation.ceremony.month}월 ${invitation.ceremony.day}일 ${invitation.ceremony.weekday} ${ceremonyTimeText()}`;
}

function venueText() {
  return joinNonEmpty([invitation.venue.name, invitation.venue.hall], " ");
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
    elements.heroImage.alt = trimText(invitation.ui.heroImageAlt) || "대표 이미지";
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
  elements.accountNote.textContent = invitation.ui.accountNote;
  elements.rsvpNote.textContent = invitation.ui.rsvpNote;
  elements.footerTitle.textContent = invitation.ui.footerTitle;
  elements.footerCopy.textContent = invitation.ui.footerCopy;

  elements.groomFullName.textContent = invitation.groom.fullName;
  elements.brideFullName.textContent = invitation.bride.fullName;
  elements.groomParents.textContent = `${invitation.groom.father} · ${invitation.groom.mother}의 ${invitation.groom.relationship}`;
  elements.brideParents.textContent = `${invitation.bride.father} · ${invitation.bride.mother}의 ${invitation.bride.relationship}`;

  setHeroImage();

  setContactLink(elements.groomPhoneLink, invitation.groom.phone, "call", "신랑에게 전화하기");
  setContactLink(elements.groomSmsLink, invitation.groom.phone, "sms", "신랑에게 문자 보내기");
  setContactLink(
    elements.groomParentPhoneLink,
    invitation.groom.parentPhone,
    "call",
    "신랑측 혼주에게 전화하기",
  );
  setContactLink(
    elements.groomParentSmsLink,
    invitation.groom.parentPhone,
    "sms",
    "신랑측 혼주에게 문자 보내기",
  );
  setContactLink(elements.bridePhoneLink, invitation.bride.phone, "call", "신부에게 전화하기");
  setContactLink(elements.brideSmsLink, invitation.bride.phone, "sms", "신부에게 문자 보내기");
  setContactLink(
    elements.brideParentPhoneLink,
    invitation.bride.parentPhone,
    "call",
    "신부측 혼주에게 전화하기",
  );
  setContactLink(
    elements.brideParentSmsLink,
    invitation.bride.parentPhone,
    "sms",
    "신부측 혼주에게 문자 보내기",
  );

  elements.ceremonySummary.textContent = ceremonyText();
  elements.ceremonyDescription.textContent = invitation.ceremony.description;
  elements.venueName.textContent = venueText();
  elements.venueAddress.textContent = invitation.venue.address;

  elements.mapVenueName.textContent = invitation.venue.name;
  elements.locationAddress.textContent = joinNonEmpty([venueText(), invitation.venue.address], " · ");
  elements.locationDetail.textContent = invitation.venue.detail;

  const directionsImageUrl = trimText(invitation.venue.directionsImage);
  const directionsAlt = trimText(invitation.venue.directionsImageAlt) || "오시는 길 안내 이미지";
  elements.directionsFigure.hidden = !directionsImageUrl;
  if (directionsImageUrl) {
    elements.directionsImage.src = directionsImageUrl;
    elements.directionsImage.alt = directionsAlt;
  } else {
    elements.directionsImage.removeAttribute("src");
    elements.directionsImage.alt = "";
  }
}

function renderCalendar() {
  const year = invitation.ceremony.year;
  const monthIndex = invitation.ceremony.month - 1;
  const eventDay = invitation.ceremony.day;
  const firstDay = new Date(year, monthIndex, 1);
  const lastDate = new Date(year, monthIndex + 1, 0).getDate();
  const startOffset = firstDay.getDay();

  elements.calendarTitle.textContent = `${year}년 ${invitation.ceremony.month}월`;
  elements.calendarBadge.textContent = `${eventDay}일 ${invitation.ceremony.weekday}`;
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
      note.textContent = "예식";
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
    elements.countdownTitle.textContent = "오늘이 결혼식입니다";
    elements.countdownBadge.textContent = "축복해 주세요";
    elements.countDays.textContent = "0";
    elements.countHours.textContent = "0";
    elements.countMinutes.textContent = "0";
    return;
  }

  const days = Math.floor(diff / day);
  const hours = Math.floor((diff % day) / hour);
  const minutes = Math.floor((diff % hour) / minute);

  elements.countdownTitle.textContent = `${invitation.groom.name} · ${invitation.bride.name}의 결혼식이 다가오고 있습니다`;
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
    image.alt = item.alt || item.title || `갤러리 ${index + 1}`;
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
      image.alt = item.alt || item.title || `갤러리 ${index + 1}`;
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
    dot.setAttribute("aria-label", `갤러리 ${index + 1}번으로 이동`);
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

function createNoticeCard(item) {
  const article = document.createElement("article");
  article.className = "notice-card";

  const title = document.createElement("h3");
  title.className = "notice-title";
  title.textContent = item.title;

  const body = document.createElement("p");
  body.className = "notice-body";
  body.textContent = item.body;

  article.append(title, body);
  return article;
}

function renderTransportAndNotices() {
  elements.transportList.innerHTML = "";
  elements.noticeList.innerHTML = "";

  invitation.transport.forEach((item) => {
    elements.transportList.appendChild(createNoticeCard(item));
  });

  invitation.notices.forEach((item) => {
    elements.noticeList.appendChild(createNoticeCard(item));
  });
}

function renderAccounts() {
  elements.accountList.innerHTML = "";

  invitation.accounts.forEach((group, index) => {
    const details = document.createElement("details");
    details.className = "account-card";
    if (index === 0) {
      details.open = true;
    }

    const summary = document.createElement("summary");
    summary.textContent = group.label;
    details.appendChild(summary);

    const body = document.createElement("div");
    body.className = "account-body";

    group.entries.forEach((entry) => {
      const item = document.createElement("div");
      item.className = "account-entry";

      const role = document.createElement("span");
      role.className = "account-role";
      role.textContent = entry.role;

      const holder = document.createElement("strong");
      holder.className = "account-holder";
      holder.textContent = entry.holder;

      const number = document.createElement("span");
      number.className = "account-number";
      number.textContent = `${entry.bank} ${entry.number}`;

      const copyButton = document.createElement("button");
      copyButton.className = "line-button";
      copyButton.type = "button";
      copyButton.textContent = "계좌번호 복사";
      copyButton.addEventListener("click", async () => {
        const succeeded = await copyText(`${entry.bank} ${entry.number} ${entry.holder}`);
        showToast(
          succeeded
            ? `${entry.holder}님의 계좌번호를 복사했습니다`
            : "복사에 실패했습니다",
        );
      });

      item.append(role, holder, number, copyButton);
      body.appendChild(item);
    });

    details.appendChild(body);
    elements.accountList.appendChild(details);
  });
}

function hasCoordinates() {
  return /^-?\d+(\.\d+)?$/u.test(trimText(invitation.venue.latitude)) &&
    /^-?\d+(\.\d+)?$/u.test(trimText(invitation.venue.longitude));
}

function buildTmapHref() {
  if (hasUsableHref(invitation.venue.tmapLink)) {
    return trimText(invitation.venue.tmapLink);
  }

  if (!hasCoordinates()) {
    return "";
  }

  const goalName = encodeURIComponent(venueText() || invitation.venue.name || invitation.venue.address);
  const goalX = encodeURIComponent(trimText(invitation.venue.longitude));
  const goalY = encodeURIComponent(trimText(invitation.venue.latitude));
  return `tmap://route?goalname=${goalName}&goalx=${goalX}&goaly=${goalY}`;
}

function buildMapLinks() {
  const query = encodeURIComponent(joinNonEmpty([invitation.venue.name, invitation.venue.address], " "));
  elements.kakaoMapLink.href = `https://map.kakao.com/link/search/${query}`;
  elements.naverMapLink.href = `https://map.naver.com/p/search/${query}`;
  elements.googleMapLink.href = hasCoordinates()
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${trimText(invitation.venue.latitude)},${trimText(invitation.venue.longitude)}`)}`
    : `https://www.google.com/maps/search/?api=1&query=${query}`;

  const tmapHref = buildTmapHref();
  elements.tmapLink.hidden = !tmapHref;
  if (tmapHref) {
    elements.tmapLink.href = tmapHref;
  } else {
    elements.tmapLink.removeAttribute("href");
  }
}

async function shareInvitation() {
  const shareData = {
    title: invitation.title,
    text: `${invitation.groom.name}과 ${invitation.bride.name}의 결혼식에 초대합니다.`,
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
  showToast(copied ? "현재 주소를 복사했습니다" : "공유를 지원하지 않는 환경입니다");
}

function updateSaveNote(submission) {
  if (!submission || !submission.submittedAt) {
    elements.saveNote.textContent = "아직 전달된 참석 의사가 없습니다.";
    return;
  }

  const formatter = new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const guestName = trimText(submission.guestName) || "하객";
  elements.saveNote.textContent = `${formatter.format(new Date(submission.submittedAt))} 기준 ${guestName}님의 응답이 정상적으로 전달되었습니다.`;
}

function getRsvpEndpointUrl() {
  return trimText(invitation.rsvp && invitation.rsvp.endpointUrl);
}

async function parseJsonResponse(response) {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
}

async function submitRsvp(payload) {
  const endpointUrl = getRsvpEndpointUrl();
  if (!endpointUrl) {
    throw new Error("RSVP 저장 엔드포인트가 아직 연결되지 않았습니다.");
  }

  const response = await window.fetch(endpointUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const result = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(result && result.error ? result.error : `응답 저장 요청에 실패했습니다. (${response.status})`);
  }

  return result;
}

function resetRsvpFormFields() {
  elements.rsvpForm.reset();
  const defaultAttendance = elements.rsvpForm.querySelector('input[name="attendance"][value="참석"]');
  if (defaultAttendance) {
    defaultAttendance.checked = true;
  }
}

function bindRsvpForm() {
  updateSaveNote(null);

  elements.rsvpForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(elements.rsvpForm);
    const payload = {
      guestName: trimText(formData.get("guestName")),
      attendance: trimText(formData.get("attendance")) || "참석",
      companions: String(formData.get("companions") || "1"),
      meal: trimText(formData.get("meal")) || "식사 예정",
      message: trimText(formData.get("message")),
      sourceUrl: window.location.href,
    };

    if (!payload.guestName) {
      showToast("성함을 입력해 주세요");
      return;
    }

    try {
      const result = await submitRsvp(payload);
      updateSaveNote(result && result.submission ? result.submission : null);
      resetRsvpFormFields();
      showToast("참석 의사를 전달했습니다");
    } catch (error) {
      showToast(error && error.message ? error.message : "참석 의사 전달에 실패했습니다");
    }
  });

  elements.resetRsvpButton.addEventListener("click", () => {
    resetRsvpFormFields();
    updateSaveNote(null);
    showToast("입력 내용을 초기화했습니다");
  });
}

function rerenderInvitation() {
  fillBasicContent();
  renderCalendar();
  updateCountdown();
  renderGallery();
  renderTimeline();
  renderTransportAndNotices();
  renderAccounts();
  buildMapLinks();
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

  elements.copyAddressButton.addEventListener("click", async () => {
    const succeeded = await copyText(joinNonEmpty([venueText(), invitation.venue.address], " "));
    showToast(succeeded ? "주소를 복사했습니다" : "복사에 실패했습니다");
  });

  bindGalleryTrack();
  bindGalleryViewer();

  window.addEventListener("storage", async (event) => {
    if (event.key === window.WeddingInvitationStore.CONTENT_STORAGE_KEY) {
      invitation = await window.WeddingInvitationStore.loadInvitation();
      rerenderInvitation();
      updateSaveNote(null);
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
  bindRsvpForm();
  bindEvents();
  registerServiceWorker();
  window.setInterval(updateCountdown, 60 * 1000);
}

init();
