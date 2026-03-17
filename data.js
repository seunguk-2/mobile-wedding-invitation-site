"use strict";

(function attachInvitationStore() {
  const CONTENT_STORAGE_KEY = "wedding-invitation-content-v1";
  const RSVP_STORAGE_KEY = "wedding-invitation-rsvp";
  const PUBLISH_SETTINGS_STORAGE_KEY = "wedding-invitation-publish-settings-v1";
  const PUBLISHED_CONTENT_PATH = "content.json";
  const WEEKDAYS = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

  let publishedInvitationCache = null;

  const DEFAULT_INVITATION = {
    title: "민준과 서연의 모바일 청첩장",
    invitationMessage:
      "서로를 향한 따뜻한 마음으로 같은 길을 걷게 되었습니다. 기쁜 날, 소중한 분들을 모시고 감사의 마음을 전하고자 합니다. 편안한 걸음으로 오셔서 두 사람의 시작을 함께 축복해 주세요.",
    ui: {
      heroMessage: "두 사람이 한마음으로 같은 계절을 시작합니다.",
      heroArtLabel: "서로의 계절이 되어",
      heroArtCaption: "소중한 날을 함께 축복해 주세요",
      galleryNote:
        "웨딩 사진을 넣어 따뜻한 순간들을 담아보세요. 갤러리 이미지는 확대 없이 카드 형태로만 보여집니다.",
      accountNote: "참석이 어려우신 분들을 위해 계좌번호를 함께 안내드립니다.",
      rsvpNote: "현재는 예시용 폼으로 동작하며, 입력 내용은 이 기기에만 저장됩니다.",
      footerTitle: "민준과 서연의 결혼식에 와 주셔서 감사합니다",
      footerCopy: "따뜻한 축복과 응원을 오래도록 간직하겠습니다.",
    },
    groom: {
      fullName: "김민준",
      name: "민준",
      father: "김영호",
      mother: "이정숙",
      relationship: "장남",
      phone: "01012345678",
      parentPhone: "01023456789",
    },
    bride: {
      fullName: "박서연",
      name: "서연",
      father: "박성민",
      mother: "최은경",
      relationship: "장녀",
      phone: "01034567890",
      parentPhone: "01045678901",
    },
    ceremony: {
      year: 2026,
      month: 10,
      day: 24,
      meridiem: "오후",
      hour: 1,
      minute: 0,
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
        caption: "첫 업로드용 사진을 넣으면 이 카드가 실제 이미지로 바뀝니다.",
        tones: ["#d9b7a5", "#b46e5a"],
        image: "",
        alt: "봄의 약속 갤러리 이미지",
      },
      {
        title: "여름의 온기",
        caption: "사진이 없을 때는 감성 카드형 배경으로 표시됩니다.",
        tones: ["#d8c1a5", "#7a8d7e"],
        image: "",
        alt: "여름의 온기 갤러리 이미지",
      },
      {
        title: "가을의 산책",
        caption: "업로드한 사진은 확대 모달 없이 카드로만 노출됩니다.",
        tones: ["#cfa083", "#895643"],
        image: "",
        alt: "가을의 산책 갤러리 이미지",
      },
      {
        title: "겨울의 대화",
        caption: "카드 제목과 설명은 사진 위 오버레이로 유지됩니다.",
        tones: ["#ced6db", "#7a7b8c"],
        image: "",
        alt: "겨울의 대화 갤러리 이미지",
      },
      {
        title: "우리의 하루",
        caption: "모바일 화면에서도 세로형 카드 비율을 유지합니다.",
        tones: ["#f0d9cf", "#c58d7d"],
        image: "",
        alt: "우리의 하루 갤러리 이미지",
      },
      {
        title: "함께라는 이름",
        caption: "나중에 다시 편집 페이지에서 언제든 이미지를 교체할 수 있습니다.",
        tones: ["#d4d0c3", "#8d735f"],
        image: "",
        alt: "함께라는 이름 갤러리 이미지",
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

  function clone(value) {
    if (typeof structuredClone === "function") {
      return structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value));
  }

  function asText(value, fallback) {
    return typeof value === "string" ? value : fallback;
  }

  function asNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function asColor(value, fallback) {
    if (typeof value !== "string") {
      return fallback;
    }
    const trimmed = value.trim();
    return trimmed || fallback;
  }

  function normalizePerson(person, fallback) {
    return {
      fullName: asText(person && person.fullName, fallback.fullName),
      name: asText(person && person.name, fallback.name),
      father: asText(person && person.father, fallback.father),
      mother: asText(person && person.mother, fallback.mother),
      relationship: asText(person && person.relationship, fallback.relationship),
      phone: asText(person && person.phone, fallback.phone),
      parentPhone: asText(person && person.parentPhone, fallback.parentPhone),
    };
  }

  function normalizeUi(ui, fallback) {
    return {
      heroMessage: asText(ui && ui.heroMessage, fallback.heroMessage),
      heroArtLabel: asText(ui && ui.heroArtLabel, fallback.heroArtLabel),
      heroArtCaption: asText(ui && ui.heroArtCaption, fallback.heroArtCaption),
      galleryNote: asText(ui && ui.galleryNote, fallback.galleryNote),
      accountNote: asText(ui && ui.accountNote, fallback.accountNote),
      rsvpNote: asText(ui && ui.rsvpNote, fallback.rsvpNote),
      footerTitle: asText(ui && ui.footerTitle, fallback.footerTitle),
      footerCopy: asText(ui && ui.footerCopy, fallback.footerCopy),
    };
  }

  function normalizeCeremony(ceremony, fallback) {
    const meridiem = asText(ceremony && ceremony.meridiem, fallback.meridiem);

    return {
      year: Math.max(2000, Math.trunc(asNumber(ceremony && ceremony.year, fallback.year))),
      month: Math.min(12, Math.max(1, Math.trunc(asNumber(ceremony && ceremony.month, fallback.month)))),
      day: Math.min(31, Math.max(1, Math.trunc(asNumber(ceremony && ceremony.day, fallback.day)))),
      meridiem: meridiem === "오전" ? "오전" : "오후",
      hour: Math.min(12, Math.max(1, Math.trunc(asNumber(ceremony && ceremony.hour, fallback.hour)))),
      minute: Math.min(59, Math.max(0, Math.trunc(asNumber(ceremony && ceremony.minute, fallback.minute)))),
      description: asText(ceremony && ceremony.description, fallback.description),
    };
  }

  function normalizeVenue(venue, fallback) {
    return {
      name: asText(venue && venue.name, fallback.name),
      hall: asText(venue && venue.hall, fallback.hall),
      address: asText(venue && venue.address, fallback.address),
      detail: asText(venue && venue.detail, fallback.detail),
    };
  }

  function normalizeTextBlockList(list, fallback) {
    if (!Array.isArray(list) || list.length === 0) {
      return clone(fallback);
    }

    return list.map((item, index) => {
      const base = fallback[index] || fallback[fallback.length - 1] || { title: "", body: "" };
      return {
        title: asText(item && item.title, base.title),
        body: asText(item && item.body, base.body),
      };
    });
  }

  function normalizeGallery(list, fallback) {
    if (!Array.isArray(list) || list.length === 0) {
      return clone(fallback);
    }

    return list.map((item, index) => {
      const base = fallback[index] || fallback[fallback.length - 1] || {
        title: "",
        caption: "",
        tones: ["#d9b7a5", "#b46e5a"],
        image: "",
        alt: "",
      };
      const tones = Array.isArray(item && item.tones) ? item.tones : [];

      return {
        title: asText(item && item.title, base.title),
        caption: asText(item && item.caption, base.caption),
        tones: [asColor(tones[0], base.tones[0]), asColor(tones[1], base.tones[1])],
        image: asText(item && item.image, base.image),
        alt: asText(item && item.alt, base.alt),
      };
    });
  }

  function normalizeTimeline(list, fallback) {
    if (!Array.isArray(list) || list.length === 0) {
      return clone(fallback);
    }

    return list.map((item, index) => {
      const base = fallback[index] || fallback[fallback.length - 1] || {
        step: "",
        title: "",
        body: "",
      };

      return {
        step: asText(item && item.step, base.step),
        title: asText(item && item.title, base.title),
        body: asText(item && item.body, base.body),
      };
    });
  }

  function normalizeAccounts(list, fallback) {
    if (!Array.isArray(list) || list.length === 0) {
      return clone(fallback);
    }

    return list.map((group, index) => {
      const baseGroup = fallback[index] || fallback[fallback.length - 1] || {
        label: "",
        entries: [{ role: "", holder: "", bank: "", number: "" }],
      };
      const sourceEntries =
        Array.isArray(group && group.entries) && group.entries.length > 0
          ? group.entries
          : baseGroup.entries;

      return {
        label: asText(group && group.label, baseGroup.label),
        entries: sourceEntries.map((entry, entryIndex) => {
          const baseEntry =
            baseGroup.entries[entryIndex] ||
            baseGroup.entries[baseGroup.entries.length - 1] ||
            { role: "", holder: "", bank: "", number: "" };

          return {
            role: asText(entry && entry.role, baseEntry.role),
            holder: asText(entry && entry.holder, baseEntry.holder),
            bank: asText(entry && entry.bank, baseEntry.bank),
            number: asText(entry && entry.number, baseEntry.number),
          };
        }),
      };
    });
  }

  function to24Hour(ceremony) {
    const hour = Math.trunc(asNumber(ceremony.hour, 12));

    if (ceremony.meridiem === "오전") {
      return hour === 12 ? 0 : hour;
    }

    return hour === 12 ? 12 : hour + 12;
  }

  function twoDigits(value) {
    return String(value).padStart(2, "0");
  }

  function buildCeremonyIso(ceremony) {
    return `${ceremony.year}-${twoDigits(ceremony.month)}-${twoDigits(ceremony.day)}T${twoDigits(to24Hour(ceremony))}:${twoDigits(ceremony.minute)}:00+09:00`;
  }

  function buildWeekday(year, month, day) {
    return WEEKDAYS[new Date(year, month - 1, day).getDay()];
  }

  function prepareInvitation(candidate) {
    const base = candidate || DEFAULT_INVITATION;
    const invitation = {
      title: asText(base.title, DEFAULT_INVITATION.title),
      invitationMessage: asText(base.invitationMessage, DEFAULT_INVITATION.invitationMessage),
      ui: normalizeUi(base.ui, DEFAULT_INVITATION.ui),
      groom: normalizePerson(base.groom, DEFAULT_INVITATION.groom),
      bride: normalizePerson(base.bride, DEFAULT_INVITATION.bride),
      ceremony: normalizeCeremony(base.ceremony, DEFAULT_INVITATION.ceremony),
      venue: normalizeVenue(base.venue, DEFAULT_INVITATION.venue),
      transport: normalizeTextBlockList(base.transport, DEFAULT_INVITATION.transport),
      notices: normalizeTextBlockList(base.notices, DEFAULT_INVITATION.notices),
      gallery: normalizeGallery(base.gallery, DEFAULT_INVITATION.gallery),
      timeline: normalizeTimeline(base.timeline, DEFAULT_INVITATION.timeline),
      accounts: normalizeAccounts(base.accounts, DEFAULT_INVITATION.accounts),
    };

    invitation.ceremony.weekday = buildWeekday(
      invitation.ceremony.year,
      invitation.ceremony.month,
      invitation.ceremony.day,
    );
    invitation.ceremony.iso = buildCeremonyIso(invitation.ceremony);

    return invitation;
  }

  function getStoredInvitation() {
    try {
      const raw = window.localStorage.getItem(CONTENT_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  async function fetchPublishedInvitation(options) {
    const settings = options || {};
    if (!settings.force && publishedInvitationCache) {
      return clone(publishedInvitationCache);
    }

    if (!window.fetch) {
      return null;
    }

    try {
      const response = await window.fetch(`${PUBLISHED_CONTENT_PATH}?ts=${Date.now()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        return null;
      }

      const json = await response.json();
      publishedInvitationCache = prepareInvitation(json);
      return clone(publishedInvitationCache);
    } catch (error) {
      return null;
    }
  }

  async function loadInvitation(options) {
    const settings = options || {};
    const preferLocal = settings.preferLocal !== false;

    if (preferLocal) {
      const local = getStoredInvitation();
      if (local) {
        return prepareInvitation(local);
      }
    }

    const published = await fetchPublishedInvitation(settings);
    if (published) {
      return published;
    }

    if (!preferLocal) {
      const local = getStoredInvitation();
      if (local) {
        return prepareInvitation(local);
      }
    }

    return prepareInvitation(DEFAULT_INVITATION);
  }

  function saveInvitation(invitation) {
    const prepared = prepareInvitation(invitation);

    try {
      window.localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(prepared));
      return { success: true, invitation: prepared };
    } catch (error) {
      return { success: false, invitation: prepared };
    }
  }

  function clearInvitation() {
    try {
      window.localStorage.removeItem(CONTENT_STORAGE_KEY);
      return true;
    } catch (error) {
      return false;
    }
  }

  function exportInvitation(invitation) {
    return JSON.stringify(prepareInvitation(invitation || DEFAULT_INVITATION), null, 2);
  }

  function importInvitation(rawText) {
    const parsed = JSON.parse(rawText);
    return saveInvitation(parsed);
  }

  function getPublishSettings() {
    try {
      const raw = window.localStorage.getItem(PUBLISH_SETTINGS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function savePublishSettings(settings) {
    try {
      window.localStorage.setItem(PUBLISH_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      return true;
    } catch (error) {
      return false;
    }
  }

  window.WeddingInvitationStore = {
    CONTENT_STORAGE_KEY,
    RSVP_STORAGE_KEY,
    PUBLISH_SETTINGS_STORAGE_KEY,
    PUBLISHED_CONTENT_PATH,
    createDefaultInvitation() {
      return clone(prepareInvitation(DEFAULT_INVITATION));
    },
    cloneInvitation(invitation) {
      return clone(prepareInvitation(invitation || DEFAULT_INVITATION));
    },
    getInvitation() {
      const local = getStoredInvitation();
      return prepareInvitation(local || publishedInvitationCache || DEFAULT_INVITATION);
    },
    loadInvitation,
    fetchPublishedInvitation,
    saveInvitation,
    clearInvitation,
    exportInvitation,
    importInvitation,
    getPublishSettings,
    savePublishSettings,
    hasSavedInvitation() {
      return Boolean(getStoredInvitation());
    },
    clearPublishedCache() {
      publishedInvitationCache = null;
    },
  };
})();
