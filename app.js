"use strict";

const invitation = {
  title: "민준과 서연의 모바일 청첩장",
  invitationMessage:
    "서로를 향한 따뜻한 마음으로 같은 길을 걷게 되었습니다. 기쁜 날, 소중한 분들을 모시고 감사의 마음을 전하고자 합니다. 편안한 걸음으로 오셔서 두 사람의 시작을 함께 축복해 주세요.",
  groom: {
    fullName: "김민준",
    name: "민준",
    father: "김영호",
    mother: "이정숙",
    phone: "01012345678",
    parentPhone: "01023456789",
  },
  bride: {
    fullName: "박서연",
    name: "서연",
    father: "박성민",
    mother: "최은경",
    phone: "01034567890",
    parentPhone: "01045678901",
  },
  ceremony: {
    year: 2026,
    month: 10,
    day: 24,
    weekday: "토요일",
    meridiem: "오후",
    hour: 1,
    minute: 0,
    iso: "2026-10-24T13:00:00+09:00",
    description: "예식 시작 30분 전부터 여유롭게 입장하실 수 있습니다.",
  },
  venue: {
    name: "라온제나 그랜드홀",
    hall: "7층 그레이스홀",
    address: "서울특별시 중구 세종대로 110",
    detail: "서울시청역 5번 출구에서 도보 3분",
  },
  transport: [
    {
      title: "지하철 안내",
      body: "1호선과 2호선 시청역 5번 출구에서 도보 3분 거리입니다.",
    },
    {
      title: "주차 안내",
      body: "건물 지하주차장 이용 시 2시간 무료 주차가 가능합니다.",
    },
    {
      title: "식사 안내",
      body: "예식 후 같은 층 연회장에서 식사가 준비되어 있습니다.",
    },
    {
      title: "셔틀 안내",
      body: "서울역 3번 출구 앞에서 20분 간격으로 셔틀이 운행됩니다.",
    },
  ],
  notices: [
    {
      title: "포토존",
      body: "입구 포토월에서 사진을 남기실 수 있도록 포토존을 준비했습니다.",
    },
    {
      title: "아이 동반",
      body: "아이와 함께 오시는 분들을 위해 수유실과 휴게 공간이 마련되어 있습니다.",
    },
    {
      title: "예식 순서",
      body: "본식 이후 간단한 감사 인사와 케이크 커팅이 이어질 예정입니다.",
    },
    {
      title: "마음 전하실 곳",
      body: "참석이 어려우신 분들을 위해 아래에 계좌번호를 함께 안내드립니다.",
    },
  ],
  gallery: [
    {
      title: "봄의 약속",
      caption: "햇살이 가장 부드럽던 날, 서로의 계절이 시작되었습니다.",
      tones: ["#d9b7a5", "#b46e5a"],
    },
    {
      title: "여름의 온기",
      caption: "눈을 마주치며 오래 웃던 순간을 담았습니다.",
      tones: ["#d8c1a5", "#7a8d7e"],
    },
    {
      title: "가을의 산책",
      caption: "천천히 같은 방향으로 걸어가는 마음을 기록했습니다.",
      tones: ["#cfa083", "#895643"],
    },
    {
      title: "겨울의 대화",
      caption: "조용한 이야기 속에서 더 단단해진 시간을 남겼습니다.",
      tones: ["#ced6db", "#7a7b8c"],
    },
    {
      title: "우리의 하루",
      caption: "익숙한 웃음과 설렘이 한 장면 안에 머물렀습니다.",
      tones: ["#f0d9cf", "#c58d7d"],
    },
    {
      title: "함께라는 이름",
      caption: "서로에게 가장 편안한 사람이 되어 가는 순간입니다.",
      tones: ["#d4d0c3", "#8d735f"],
    },
  ],
  timeline: [
    {
      step: "첫 만남",
      title: "서로의 일상에 자연스럽게 스며든 날",
      body: "바쁘게 지나가던 계절 속에서 닮은 웃음과 마음을 발견했습니다.",
    },
    {
      step: "약속",
      title: "평범한 하루를 특별하게 만든 고백",
      body: "함께하는 미래를 이야기하며 오래 기억할 약속을 나누었습니다.",
    },
    {
      step: "오늘",
      title: "같은 방향을 바라보며 한 걸음을 내딛는 날",
      body: "이제 두 사람은 가족이 되어 새로운 계절을 시작합니다.",
    },
  ],
  accounts: [
    {
      label: "신랑측 마음 전하실 곳",
      entries: [
        {
          role: "신랑",
          holder: "김민준",
          bank: "국민은행",
          number: "123-4567-890123",
        },
        {
          role: "혼주",
          holder: "김영호",
          bank: "신한은행",
          number: "110-345-678901",
        },
      ],
    },
    {
      label: "신부측 마음 전하실 곳",
      entries: [
        {
          role: "신부",
          holder: "박서연",
          bank: "하나은행",
          number: "357-910111-22207",
        },
        {
          role: "혼주",
          holder: "박성민",
          bank: "우리은행",
          number: "1002-945-112233",
        },
      ],
    },
  ],
};

const storageKey = "wedding-invitation-rsvp";

const elements = {
  heroDate: document.getElementById("heroDate"),
  groomName: document.getElementById("groomName"),
  brideName: document.getElementById("brideName"),
  heroVenue: document.getElementById("heroVenue"),
  heroMonogram: document.getElementById("heroMonogram"),
  invitationMessage: document.getElementById("invitationMessage"),
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

function ceremonyText() {
  return `${invitation.ceremony.year}년 ${invitation.ceremony.month}월 ${invitation.ceremony.day}일 ${invitation.ceremony.weekday} ${invitation.ceremony.meridiem} ${invitation.ceremony.hour}시`;
}

function venueText() {
  return `${invitation.venue.name} ${invitation.venue.hall}`;
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
  elements.heroDate.textContent = ceremonyText();
  elements.groomName.textContent = invitation.groom.name;
  elements.brideName.textContent = invitation.bride.name;
  elements.heroVenue.textContent = `${venueText()} · ${invitation.venue.detail}`;
  elements.heroMonogram.textContent = `${invitation.groom.name.charAt(0)} ${invitation.bride.name.charAt(0)}`;
  elements.invitationMessage.textContent = invitation.invitationMessage;

  elements.groomFullName.textContent = invitation.groom.fullName;
  elements.brideFullName.textContent = invitation.bride.fullName;
  elements.groomParents.textContent = `${invitation.groom.father} · ${invitation.groom.mother}의 장남`;
  elements.brideParents.textContent = `${invitation.bride.father} · ${invitation.bride.mother}의 장녀`;

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
  elements.locationAddress.textContent = `${venueText()} · ${invitation.venue.address}`;
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
  const query = encodeURIComponent(`${invitation.venue.name} ${invitation.venue.address}`);
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
    const succeeded = await copyText(`${venueText()} ${invitation.venue.address}`);
    showToast(succeeded ? "주소를 복사했습니다" : "복사에 실패했습니다");
  });

  elements.lightboxClose.addEventListener("click", closeLightbox);
  elements.lightboxBackdrop.addEventListener("click", closeLightbox);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.lightbox.hidden) {
      closeLightbox();
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
