"use strict";

const invitation = window.WeddingInvitationStore.getInvitation();
const storageKey = window.WeddingInvitationStore.RSVP_STORAGE_KEY;

const elements = {
  metaDescription: document.querySelector('meta[name="description"]'),
  heroDate: document.getElementById("heroDate"),
  groomName: document.getElementById("groomName"),
  brideName: document.getElementById("brideName"),
  heroVenue: document.getElementById("heroVenue"),
  heroMessage: document.getElementById("heroMessage"),
  heroArtLabel: document.getElementById("heroArtLabel"),
  heroArtCaption: document.getElementById("heroArtCaption"),
  heroMonogram: document.getElementById("heroMonogram"),
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
  groomParentPhoneLink: document.getElementById("groomParentPhoneLink"),
  bridePhoneLink: document.getElementById("bridePhoneLink"),
  brideParentPhoneLink: document.getElementById("brideParentPhoneLink"),
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
  galleryGrid: document.getElementById("galleryGrid"),
  timelineList: document.getElementById("timelineList"),
  mapVenueName: document.getElementById("mapVenueName"),
  locationAddress: document.getElementById("locationAddress"),
  locationDetail: document.getElementById("locationDetail"),
  kakaoMapLink: document.getElementById("kakaoMapLink"),
  naverMapLink: document.getElementById("naverMapLink"),
  googleMapLink: document.getElementById("googleMapLink"),
  copyAddressButton: document.getElementById("copyAddressButton"),
  transportList: document.getElementById("transportList"),
  noticeList: document.getElementById("noticeList"),
  accountList: document.getElementById("accountList"),
  shareButton: document.getElementById("shareButton"),
  bottomShareButton: document.getElementById("bottomShareButton"),
  lightbox: document.getElementById("lightbox"),
  lightboxBackdrop: document.getElementById("lightboxBackdrop"),
  lightboxClose: document.getElementById("lightboxClose"),
  lightboxArt: document.getElementById("lightboxArt"),
  lightboxIndex: document.getElementById("lightboxIndex"),
  lightboxTitle: document.getElementById("lightboxTitle"),
  lightboxCaption: document.getElementById("lightboxCaption"),
  toast: document.getElementById("toast"),
  rsvpForm: document.getElementById("rsvpForm"),
  resetRsvpButton: document.getElementById("resetRsvpButton"),
  saveNote: document.getElementById("saveNote"),
};

let toastTimer = 0;

function formatPhone(value) {
  const digits = String(value).replace(/\D/g, "");
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return value;
}

function twoDigits(value) {
  return String(value).padStart(2, "0");
}

function joinNonEmpty(values, separator) {
  return values.filter(Boolean).join(separator);
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
  elements.heroArtLabel.textContent = invitation.ui.heroArtLabel;
  elements.heroArtCaption.textContent = invitation.ui.heroArtCaption;
  elements.heroMonogram.textContent = `${invitation.groom.name.charAt(0)} ${invitation.bride.name.charAt(0)}`.trim();
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

  elements.groomPhoneLink.href = `tel:${invitation.groom.phone}`;
  elements.groomPhoneLink.textContent = `신랑 ${formatPhone(invitation.groom.phone)}`;
  elements.groomParentPhoneLink.href = `tel:${invitation.groom.parentPhone}`;
  elements.groomParentPhoneLink.textContent = `혼주 ${formatPhone(invitation.groom.parentPhone)}`;
  elements.bridePhoneLink.href = `tel:${invitation.bride.phone}`;
  elements.bridePhoneLink.textContent = `신부 ${formatPhone(invitation.bride.phone)}`;
  elements.brideParentPhoneLink.href = `tel:${invitation.bride.parentPhone}`;
  elements.brideParentPhoneLink.textContent = `혼주 ${formatPhone(invitation.bride.parentPhone)}`;

  elements.ceremonySummary.textContent = ceremonyText();
  elements.ceremonyDescription.textContent = invitation.ceremony.description;
  elements.venueName.textContent = venueText();
  elements.venueAddress.textContent = invitation.venue.address;

  elements.mapVenueName.textContent = invitation.venue.name;
  elements.locationAddress.textContent = joinNonEmpty([venueText(), invitation.venue.address], " · ");
  elements.locationDetail.textContent = invitation.venue.detail;
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

function renderGallery() {
  elements.galleryGrid.innerHTML = "";

  invitation.gallery.forEach((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gallery-card";
    button.style.setProperty("--tone-a", item.tones[0]);
    button.style.setProperty("--tone-b", item.tones[1]);

    const number = document.createElement("span");
    number.className = "gallery-index";
    number.textContent = `${twoDigits(index + 1)}`;

    const copy = document.createElement("span");
    copy.className = "gallery-copy";

    const title = document.createElement("strong");
    title.className = "gallery-title";
    title.textContent = item.title;

    const caption = document.createElement("span");
    caption.className = "gallery-caption";
    caption.textContent = item.caption;

    copy.append(title, caption);
    button.append(number, copy);
    button.addEventListener("click", () => openLightbox(item, index));

    elements.galleryGrid.appendChild(button);
  });
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

function buildMapLinks() {
  const query = encodeURIComponent(joinNonEmpty([invitation.venue.name, invitation.venue.address], " "));
  elements.kakaoMapLink.href = `https://map.kakao.com/link/search/${query}`;
  elements.naverMapLink.href = `https://map.naver.com/p/search/${query}`;
  elements.googleMapLink.href = `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function openLightbox(item, index) {
  elements.lightboxArt.style.setProperty("--tone-a", item.tones[0]);
  elements.lightboxArt.style.setProperty("--tone-b", item.tones[1]);
  elements.lightboxIndex.textContent = `${twoDigits(index + 1)} / ${twoDigits(invitation.gallery.length)}`;
  elements.lightboxTitle.textContent = item.title;
  elements.lightboxCaption.textContent = item.caption;
  elements.lightbox.hidden = false;
  document.body.classList.add("is-modal-open");
}

function closeLightbox() {
  elements.lightbox.hidden = true;
  document.body.classList.remove("is-modal-open");
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

function saveRsvp(data) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(data));
    return true;
  } catch (error) {
    return false;
  }
}

function loadRsvp() {
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function resetRsvp() {
  try {
    window.localStorage.removeItem(storageKey);
  } catch (error) {
    return;
  }
}

function updateSaveNote(savedAt) {
  if (!savedAt) {
    elements.saveNote.textContent = "아직 저장된 참석 의사가 없습니다.";
    return;
  }

  const formatter = new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "long",
    timeStyle: "short",
  });

  elements.saveNote.textContent = `${formatter.format(new Date(savedAt))} 기준으로 이 기기에 저장되었습니다.`;
}

function populateRsvpForm(saved) {
  if (!saved) {
    return;
  }

  const form = elements.rsvpForm;
  form.guestName.value = saved.guestName || "";
  form.companions.value = saved.companions || "1";
  form.meal.value = saved.meal || "식사 예정";
  form.message.value = saved.message || "";

  const attendance = form.querySelector(`input[name="attendance"][value="${saved.attendance || "참석"}"]`);
  if (attendance) {
    attendance.checked = true;
  }

  updateSaveNote(saved.savedAt);
}

function bindRsvpForm() {
  const saved = loadRsvp();
  populateRsvpForm(saved);
  updateSaveNote(saved ? saved.savedAt : null);

  elements.rsvpForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(elements.rsvpForm);
    const payload = {
      guestName: String(formData.get("guestName") || "").trim(),
      attendance: String(formData.get("attendance") || "참석"),
      companions: String(formData.get("companions") || "1"),
      meal: String(formData.get("meal") || "식사 예정"),
      message: String(formData.get("message") || "").trim(),
      savedAt: new Date().toISOString(),
    };

    if (!payload.guestName) {
      showToast("성함을 입력해 주세요");
      return;
    }

    const success = saveRsvp(payload);
    updateSaveNote(payload.savedAt);
    showToast(success ? "참석 의사를 이 기기에 저장했습니다" : "저장에 실패했습니다");
  });

  elements.resetRsvpButton.addEventListener("click", () => {
    elements.rsvpForm.reset();
    const defaultAttendance = elements.rsvpForm.querySelector('input[name="attendance"][value="참석"]');
    if (defaultAttendance) {
      defaultAttendance.checked = true;
    }
    resetRsvp();
    updateSaveNote(null);
    showToast("입력 내용을 초기화했습니다");
  });
}

function bindEvents() {
  elements.shareButton.addEventListener("click", shareInvitation);
  elements.bottomShareButton.addEventListener("click", shareInvitation);

  elements.copyAddressButton.addEventListener("click", async () => {
    const succeeded = await copyText(joinNonEmpty([venueText(), invitation.venue.address], " "));
    showToast(succeeded ? "주소를 복사했습니다" : "복사에 실패했습니다");
  });

  elements.lightboxClose.addEventListener("click", closeLightbox);
  elements.lightboxBackdrop.addEventListener("click", closeLightbox);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.lightbox.hidden) {
      closeLightbox();
    }
  });

  window.addEventListener("storage", (event) => {
    if (event.key === window.WeddingInvitationStore.CONTENT_STORAGE_KEY) {
      window.location.reload();
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

function init() {
  fillBasicContent();
  renderCalendar();
  updateCountdown();
  renderGallery();
  renderTimeline();
  renderTransportAndNotices();
  renderAccounts();
  buildMapLinks();
  bindRsvpForm();
  bindEvents();
  registerServiceWorker();
  window.setInterval(updateCountdown, 60 * 1000);
}

init();
