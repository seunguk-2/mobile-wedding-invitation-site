"use strict";

(function attachInvitationStore() {
  const CONTENT_STORAGE_KEY = "wedding-invitation-content-v1";
  const RSVP_STORAGE_KEY = "wedding-invitation-rsvp";
  const PUBLISH_SETTINGS_STORAGE_KEY = "wedding-invitation-publish-settings-v1";
  const PUBLISHED_CONTENT_PATH = "content.json";
  const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  let publishedInvitationCache = null;

  const DEFAULT_INVITATION = {
    title: "Minjun & Seoyeon's Wedding Invitation",
    invitationMessage:
      "With grateful hearts, we are beginning a new chapter together. We would be honored to celebrate this special day with the people we love. Please join us and bless the start of our life together.",
    ui: {
      heroMessage: "We are stepping into the same season, together.",
      heroImage: "",
      heroImageAlt: "Hero image",
      heroImageCaption: "Please celebrate this special day with us.",
      galleryNote:
        "Tap a photo to open the full-screen carousel.",
      accountNote: "If you are unable to attend, we have included bank details below.",
      rsvpNote: "Your reply helps us prepare for the day.",
      footerTitle: "Thank you for celebrating with us",
      footerCopy: "We will remember your love and support for years to come.",
    },
    groom: {
      fullName: "Minjun Kim",
      name: "Minjun",
      father: "Youngho Kim",
      mother: "Jungsook Lee",
      relationship: "eldest son",
      phone: "01012345678",
      parentPhone: "01023456789",
    },
    bride: {
      fullName: "Seoyeon Park",
      name: "Seoyeon",
      father: "Sungmin Park",
      mother: "Eunkyung Choi",
      relationship: "eldest daughter",
      phone: "01034567890",
      parentPhone: "01045678901",
    },
    ceremony: {
      year: 2026,
      month: 10,
      day: 24,
      meridiem: "PM",
      hour: 1,
      minute: 0,
      description: "Doors open 30 minutes before the ceremony.",
    },
    venue: {
      name: "Laonjena Grand Hall",
      hall: "7F Grace Hall",
      address: "110 Sejong-daero, Jung-gu, Seoul",
      detail: "A 3-minute walk from Exit 5 of City Hall Station",
      latitude: "37.5662952",
      longitude: "126.9779451",
      tmapLink: "",
      directionsImage: "",
      directionsImageAlt: "Directions image",
    },
    transport: [
      {
        title: "Subway",
        body: "The venue is a 3-minute walk from Exit 5 of City Hall Station on Lines 1 and 2.",
      },
      {
        title: "Parking",
        body: "Complimentary parking is available for up to 2 hours in the building garage.",
      },
      {
        title: "Reception Meal",
        body: "A meal will be served in the banquet hall on the same floor after the ceremony.",
      },
      {
        title: "Shuttle",
        body: "A shuttle runs every 20 minutes from Exit 3 of Seoul Station.",
      },
    ],
    notices: [
      {
        title: "Photo Zone",
        body: "A photo wall will be ready at the entrance for you to enjoy.",
      },
      {
        title: "With Children",
        body: "A nursing room and resting area will be available for guests coming with children.",
      },
      {
        title: "Program",
        body: "A short thank-you and cake cutting will follow the ceremony.",
      },
      {
        title: "Blessing Gifts",
        body: "Bank details are shared below for guests who are unable to attend in person.",
      },
    ],
    gallery: [
      {
        title: "Spring Promise",
        caption: "Upload your first photo and this card will switch to the real image.",
        tones: ["#d9b7a5", "#b46e5a"],
        image: "",
        alt: "Spring Promise gallery image",
      },
      {
        title: "Summer Warmth",
        caption: "When no photo is uploaded, this card keeps its editorial color background.",
        tones: ["#d8c1a5", "#7a8d7e"],
        image: "",
        alt: "Summer Warmth gallery image",
      },
      {
        title: "Autumn Walk",
        caption: "Uploaded photos can also be viewed in the full-screen carousel.",
        tones: ["#cfa083", "#895643"],
        image: "",
        alt: "Autumn Walk gallery image",
      },
      {
        title: "Winter Conversation",
        caption: "Each photo keeps its title and caption as an overlay.",
        tones: ["#ced6db", "#7a7b8c"],
        image: "",
        alt: "Winter Conversation gallery image",
      },
      {
        title: "Our Day",
        caption: "It is designed to feel natural to swipe through on a phone.",
        tones: ["#f0d9cf", "#c58d7d"],
        image: "",
        alt: "Our Day gallery image",
      },
      {
        title: "Together",
        caption: "You can return to the editor later and replace any image at any time.",
        tones: ["#d4d0c3", "#8d735f"],
        image: "",
        alt: "Together gallery image",
      },
    ],
    timeline: [
      {
        step: "First Meeting",
        title: "The day we quietly became part of each other's everyday lives",
        body: "In the middle of busy seasons, we found familiar laughter and comfort in one another.",
      },
      {
        step: "Promise",
        title: "The conversation that made an ordinary day unforgettable",
        body: "As we spoke about our future together, we shared a promise we will remember for a lifetime.",
      },
      {
        step: "Today",
        title: "The day we take one step forward in the same direction",
        body: "Now we begin a new season together as family.",
      },
    ],
    accounts: [
      {
        label: "Groom's Side",
        entries: [
          {
            role: "Groom",
            holder: "Minjun Kim",
            bank: "KB Kookmin Bank",
            number: "123-4567-890123",
          },
          {
            role: "Parents",
            holder: "Youngho Kim",
            bank: "Shinhan Bank",
            number: "110-345-678901",
          },
        ],
      },
      {
        label: "Bride's Side",
        entries: [
          {
            role: "Bride",
            holder: "Seoyeon Park",
            bank: "Hana Bank",
            number: "357-910111-22207",
          },
          {
            role: "Parents",
            holder: "Sungmin Park",
            bank: "Woori Bank",
            number: "1002-945-112233",
          },
        ],
      },
    ],
    rsvp: {
      endpointUrl: "https://mobile-wedding-invitation-site.ksu1949.workers.dev/rsvp",
      adminLabel: "You can review and manage replies from the editor.",
    },
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
      heroImage: asText(ui && ui.heroImage, fallback.heroImage),
      heroImageAlt: asText(ui && ui.heroImageAlt, fallback.heroImageAlt),
      heroImageCaption: asText(ui && ui.heroImageCaption, fallback.heroImageCaption),
      galleryNote: asText(ui && ui.galleryNote, fallback.galleryNote),
      accountNote: asText(ui && ui.accountNote, fallback.accountNote),
      rsvpNote: asText(ui && ui.rsvpNote, fallback.rsvpNote),
      footerTitle: asText(ui && ui.footerTitle, fallback.footerTitle),
      footerCopy: asText(ui && ui.footerCopy, fallback.footerCopy),
    };
  }

  function normalizeMeridiem(value, fallback) {
    const input = asText(value, fallback).trim().toUpperCase();
    if (input === "AM" || input === "오전") {
      return "AM";
    }
    return "PM";
  }

  function normalizeCeremony(ceremony, fallback) {
    const meridiem = normalizeMeridiem(ceremony && ceremony.meridiem, fallback.meridiem);

    return {
      year: Math.max(2000, Math.trunc(asNumber(ceremony && ceremony.year, fallback.year))),
      month: Math.min(12, Math.max(1, Math.trunc(asNumber(ceremony && ceremony.month, fallback.month)))),
      day: Math.min(31, Math.max(1, Math.trunc(asNumber(ceremony && ceremony.day, fallback.day)))),
      meridiem,
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
      latitude: asText(venue && venue.latitude, fallback.latitude),
      longitude: asText(venue && venue.longitude, fallback.longitude),
      tmapLink: asText(venue && venue.tmapLink, fallback.tmapLink),
      directionsImage: asText(venue && venue.directionsImage, fallback.directionsImage),
      directionsImageAlt: asText(venue && venue.directionsImageAlt, fallback.directionsImageAlt),
    };
  }

  function normalizeRsvp(rsvp, fallback) {
    return {
      endpointUrl: asText(rsvp && rsvp.endpointUrl, fallback.endpointUrl),
      adminLabel: asText(rsvp && rsvp.adminLabel, fallback.adminLabel),
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

    if (normalizeMeridiem(ceremony.meridiem, "AM") === "AM") {
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
      rsvp: normalizeRsvp(base.rsvp, DEFAULT_INVITATION.rsvp),
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
