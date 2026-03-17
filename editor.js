"use strict";

const store = window.WeddingInvitationStore;
const PUBLISH_PASSWORD_SESSION_KEY = "wedding-invitation-publish-password-v1";
const DEFAULT_PUBLISH_ENDPOINT_URL = "https://mobile-wedding-invitation-site.ksu1949.workers.dev/publish";
const DEFAULT_PUBLIC_SITE_URL = "https://seunguk-2.github.io/mobile-wedding-invitation-site/";

let invitation = store.createDefaultInvitation();
let toastTimer = 0;
let rsvpResponses = [];

const pendingFiles = {
  hero: null,
  directions: null,
  gallery: [],
};

const elements = {
  basicFields: document.getElementById("basicFields"),
  heroMediaEditor: document.getElementById("heroMediaEditor"),
  directionsMediaEditor: document.getElementById("directionsMediaEditor"),
  groomFields: document.getElementById("groomFields"),
  brideFields: document.getElementById("brideFields"),
  ceremonyFields: document.getElementById("ceremonyFields"),
  venueFields: document.getElementById("venueFields"),
  transportEditor: document.getElementById("transportEditor"),
  noticeEditor: document.getElementById("noticeEditor"),
  galleryEditor: document.getElementById("galleryEditor"),
  timelineEditor: document.getElementById("timelineEditor"),
  accountEditor: document.getElementById("accountEditor"),
  rsvpSettingsFields: document.getElementById("rsvpSettingsFields"),
  rsvpManagerList: document.getElementById("rsvpManagerList"),
  loadRsvpResponsesButton: document.getElementById("loadRsvpResponsesButton"),
  exportRsvpResponsesButton: document.getElementById("exportRsvpResponsesButton"),
  rsvpManagerStatus: document.getElementById("rsvpManagerStatus"),
  saveInvitationButton: document.getElementById("saveInvitationButton"),
  resetInvitationButton: document.getElementById("resetInvitationButton"),
  exportInvitationButton: document.getElementById("exportInvitationButton"),
  importInvitationButton: document.getElementById("importInvitationButton"),
  importFileInput: document.getElementById("importFileInput"),
  editorStatus: document.getElementById("editorStatus"),
  publishEndpointUrl: document.getElementById("publishEndpointUrl"),
  publishPassword: document.getElementById("publishPassword"),
  publicSiteUrl: document.getElementById("publicSiteUrl"),
  publishInvitationButton: document.getElementById("publishInvitationButton"),
  reloadPublishedButton: document.getElementById("reloadPublishedButton"),
  publishStatus: document.getElementById("publishStatus"),
  publishPreviewLink: document.getElementById("publishPreviewLink"),
  toast: document.getElementById("toast"),
};

function clearNode(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function trimText(value) {
  return String(value || "").trim();
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => {
    elements.toast.classList.remove("is-visible");
  }, 2200);
}

function updateStatus(message) {
  elements.editorStatus.textContent = message;
}

function updatePublishStatus(message) {
  elements.publishStatus.textContent = message;
}

function updateRsvpManagerStatus(message) {
  elements.rsvpManagerStatus.textContent = message;
}

function createFieldShell(labelText) {
  const wrapper = document.createElement("label");
  wrapper.className = "field";

  const label = document.createElement("span");
  label.textContent = labelText;
  wrapper.appendChild(label);

  return wrapper;
}

function createHelpText(text) {
  const note = document.createElement("p");
  note.className = "editor-help";
  note.textContent = text;
  return note;
}

function createInputField(spec) {
  const wrapper = createFieldShell(spec.label);
  const input = document.createElement("input");
  input.type = spec.type || "text";
  input.value = spec.value == null ? "" : String(spec.value);
  input.placeholder = spec.placeholder || "";

  if (spec.accept) {
    input.accept = spec.accept;
  }
  if (spec.min != null) {
    input.min = String(spec.min);
  }
  if (spec.max != null) {
    input.max = String(spec.max);
  }
  if (spec.step != null) {
    input.step = String(spec.step);
  }
  if (spec.autocomplete) {
    input.autocomplete = spec.autocomplete;
  }

  input.addEventListener("input", (event) => {
    spec.onChange(event.target.value);
  });

  wrapper.appendChild(input);
  if (spec.help) {
    wrapper.appendChild(createHelpText(spec.help));
  }
  return wrapper;
}

function createTextareaField(spec) {
  const wrapper = createFieldShell(spec.label);
  const input = document.createElement("textarea");
  input.rows = spec.rows || 4;
  input.placeholder = spec.placeholder || "";
  input.value = spec.value == null ? "" : String(spec.value);
  if (spec.readOnly) {
    input.readOnly = true;
  }
  input.addEventListener("input", (event) => {
    spec.onChange(event.target.value);
  });
  wrapper.appendChild(input);
  if (spec.help) {
    wrapper.appendChild(createHelpText(spec.help));
  }
  return wrapper;
}

function createSelectField(spec) {
  const wrapper = createFieldShell(spec.label);
  const select = document.createElement("select");

  spec.options.forEach((option) => {
    const element = document.createElement("option");
    element.value = option.value;
    element.textContent = option.label;
    if (option.value === spec.value) {
      element.selected = true;
    }
    select.appendChild(element);
  });

  select.addEventListener("change", (event) => {
    spec.onChange(event.target.value);
  });

  wrapper.appendChild(select);
  if (spec.help) {
    wrapper.appendChild(createHelpText(spec.help));
  }
  return wrapper;
}

function createColorField(spec) {
  const wrapper = createFieldShell(spec.label);
  const input = document.createElement("input");
  input.type = "color";
  input.value = spec.value;
  input.addEventListener("input", (event) => {
    spec.onChange(event.target.value);
  });
  wrapper.appendChild(input);
  return wrapper;
}

function createMiniButton(label, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "editor-mini-button";
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function createAddButton(label, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "editor-add-button";
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function createItemCard(title, onRemove) {
  const article = document.createElement("article");
  article.className = "editor-item";

  const head = document.createElement("div");
  head.className = "editor-item-head";

  const heading = document.createElement("h3");
  heading.className = "editor-item-title";
  heading.textContent = title;

  head.appendChild(heading);

  if (onRemove) {
    head.appendChild(createMiniButton("삭제", onRemove));
  }

  article.appendChild(head);
  return article;
}

function appendFields(container, fields) {
  fields.forEach((field) => {
    container.appendChild(field);
  });
}

function revokePendingFile(pending) {
  if (pending && pending.previewUrl) {
    URL.revokeObjectURL(pending.previewUrl);
  }
}

function getPendingFile(kind, index) {
  if (kind === "gallery") {
    return pendingFiles.gallery[index] || null;
  }
  return pendingFiles[kind] || null;
}

function clearPendingFile(kind, index) {
  if (kind === "gallery") {
    const pending = getPendingFile(kind, index);
    revokePendingFile(pending);
    pendingFiles.gallery[index] = null;
    return;
  }

  revokePendingFile(pendingFiles[kind]);
  pendingFiles[kind] = null;
}

function clearAllPendingFiles() {
  clearPendingFile("hero");
  clearPendingFile("directions");
  pendingFiles.gallery.forEach((_, index) => {
    clearPendingFile("gallery", index);
  });
  pendingFiles.gallery.length = 0;
}

function countPendingUploads() {
  return ["hero", "directions"].reduce((count, kind) => {
    return getPendingFile(kind) && getPendingFile(kind).file ? count + 1 : count;
  }, 0) + pendingFiles.gallery.reduce((count, item) => {
    return item && item.file ? count + 1 : count;
  }, 0);
}

function createGalleryPreviewCard(item, index) {
  const article = document.createElement("article");
  article.className = "gallery-card editor-preview-card";
  article.style.setProperty("--tone-a", item.tones[0]);
  article.style.setProperty("--tone-b", item.tones[1]);

  const previewSource = trimText((getPendingFile("gallery", index) || {}).previewUrl || item.image);
  if (previewSource) {
    article.classList.add("has-image");
    const image = document.createElement("img");
    image.className = "gallery-image";
    image.src = previewSource;
    image.alt = item.alt || item.title || `갤러리 ${index + 1} 이미지`;
    image.loading = "lazy";
    image.decoding = "async";
    image.draggable = false;
    article.appendChild(image);
  }

  const copy = document.createElement("span");
  copy.className = "gallery-copy";

  const title = document.createElement("strong");
  title.className = "gallery-title";
  title.textContent = item.title || `갤러리 ${index + 1}`;

  const caption = document.createElement("span");
  caption.className = "gallery-caption";
  caption.textContent = item.caption || "설명 문구를 입력하면 이곳에 표시됩니다.";

  copy.append(title, caption);
  article.appendChild(copy);

  return article;
}

function createMediaPreviewCard(options) {
  const wrapper = document.createElement("div");
  wrapper.className = "editor-media-preview";

  const card = document.createElement("div");
  card.className = `editor-media-card${options.wide ? " is-wide" : ""}`;

  if (options.src) {
    card.style.padding = "0";
    const image = document.createElement("img");
    image.className = "editor-media-image";
    image.src = options.src;
    image.alt = options.alt || options.emptyText;
    image.loading = "lazy";
    image.decoding = "async";
    image.draggable = false;
    card.appendChild(image);
  } else {
    card.classList.add("is-empty");
    card.textContent = options.emptyText;
  }

  wrapper.appendChild(card);
  return wrapper;
}

function createSerializableInvitation(source) {
  const prepared = store.cloneInvitation(source);
  return {
    title: prepared.title,
    invitationMessage: prepared.invitationMessage,
    ui: {
      heroMessage: prepared.ui.heroMessage,
      heroImage: prepared.ui.heroImage,
      heroImageAlt: prepared.ui.heroImageAlt,
      heroImageCaption: prepared.ui.heroImageCaption,
      galleryNote: prepared.ui.galleryNote,
      accountNote: prepared.ui.accountNote,
      rsvpNote: prepared.ui.rsvpNote,
      footerTitle: prepared.ui.footerTitle,
      footerCopy: prepared.ui.footerCopy,
    },
    groom: {
      fullName: prepared.groom.fullName,
      name: prepared.groom.name,
      father: prepared.groom.father,
      mother: prepared.groom.mother,
      relationship: prepared.groom.relationship,
      phone: prepared.groom.phone,
      parentPhone: prepared.groom.parentPhone,
    },
    bride: {
      fullName: prepared.bride.fullName,
      name: prepared.bride.name,
      father: prepared.bride.father,
      mother: prepared.bride.mother,
      relationship: prepared.bride.relationship,
      phone: prepared.bride.phone,
      parentPhone: prepared.bride.parentPhone,
    },
    ceremony: {
      year: prepared.ceremony.year,
      month: prepared.ceremony.month,
      day: prepared.ceremony.day,
      meridiem: prepared.ceremony.meridiem,
      hour: prepared.ceremony.hour,
      minute: prepared.ceremony.minute,
      description: prepared.ceremony.description,
    },
    venue: {
      name: prepared.venue.name,
      hall: prepared.venue.hall,
      address: prepared.venue.address,
      detail: prepared.venue.detail,
      latitude: prepared.venue.latitude,
      longitude: prepared.venue.longitude,
      tmapLink: prepared.venue.tmapLink,
      directionsImage: prepared.venue.directionsImage,
      directionsImageAlt: prepared.venue.directionsImageAlt,
    },
    transport: prepared.transport.map((item) => ({
      title: item.title,
      body: item.body,
    })),
    notices: prepared.notices.map((item) => ({
      title: item.title,
      body: item.body,
    })),
    gallery: prepared.gallery.map((item) => ({
      title: item.title,
      caption: item.caption,
      tones: [item.tones[0], item.tones[1]],
      image: item.image,
      alt: item.alt,
    })),
    timeline: prepared.timeline.map((item) => ({
      step: item.step,
      title: item.title,
      body: item.body,
    })),
    accounts: prepared.accounts.map((group) => ({
      label: group.label,
      entries: group.entries.map((entry) => ({
        role: entry.role,
        holder: entry.holder,
        bank: entry.bank,
        number: entry.number,
      })),
    })),
    rsvp: {
      endpointUrl: prepared.rsvp.endpointUrl,
      adminLabel: prepared.rsvp.adminLabel,
    },
  };
}

function exportInvitationJson() {
  return `${JSON.stringify(createSerializableInvitation(invitation), null, 2)}\n`;
}

function getStoredPublishPassword() {
  try {
    return window.sessionStorage.getItem(PUBLISH_PASSWORD_SESSION_KEY) || "";
  } catch (error) {
    return "";
  }
}

function storePublishPassword(password) {
  try {
    if (password) {
      window.sessionStorage.setItem(PUBLISH_PASSWORD_SESSION_KEY, password);
      return;
    }
    window.sessionStorage.removeItem(PUBLISH_PASSWORD_SESSION_KEY);
  } catch (error) {
    return;
  }
}

function guessPublicSiteUrlFromLocation() {
  const url = new URL(window.location.href);
  const segments = url.pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return `${url.origin}/`;
  }

  if (segments[0].endsWith(".html")) {
    return `${url.origin}/`;
  }

  return `${url.origin}/${segments[0]}/`;
}

function deriveRsvpEndpointFromPublish(endpointUrl) {
  const trimmed = trimText(endpointUrl);
  if (!trimmed) {
    return "";
  }

  if (/\/publish\/?$/u.test(trimmed)) {
    return trimmed.replace(/\/publish\/?$/u, "/rsvp");
  }

  return `${trimmed.replace(/\/+$/u, "")}/rsvp`;
}

function getPublishSettingsFromForm() {
  return {
    endpointUrl: trimText(elements.publishEndpointUrl.value),
    publishPassword: trimText(elements.publishPassword.value),
    publicSiteUrl: trimText(elements.publicSiteUrl.value),
  };
}

function persistPublishSettings() {
  const settings = getPublishSettingsFromForm();
  store.savePublishSettings({
    endpointUrl: settings.endpointUrl,
    publicSiteUrl: settings.publicSiteUrl,
  });
  storePublishPassword(settings.publishPassword);
  updatePublishPreviewLink();
  return settings;
}

function updatePublishPreviewLink() {
  const publicSiteUrl = trimText(elements.publicSiteUrl.value);
  if (!publicSiteUrl) {
    elements.publishPreviewLink.textContent = "공개 사이트 주소를 입력하면 이곳에 표시됩니다.";
    elements.publishPreviewLink.href = "./index.html";
    return;
  }

  elements.publishPreviewLink.textContent = publicSiteUrl;
  elements.publishPreviewLink.href = publicSiteUrl;
}

function hydratePublishSettings() {
  const saved = store.getPublishSettings() || {};
  elements.publishEndpointUrl.value = saved.endpointUrl || DEFAULT_PUBLISH_ENDPOINT_URL;
  elements.publicSiteUrl.value =
    saved.publicSiteUrl || DEFAULT_PUBLIC_SITE_URL || guessPublicSiteUrlFromLocation();
  elements.publishPassword.value = getStoredPublishPassword();
  updatePublishPreviewLink();
}

function setBusy(isBusy) {
  [
    elements.publishInvitationButton,
    elements.reloadPublishedButton,
    elements.saveInvitationButton,
    elements.resetInvitationButton,
    elements.exportInvitationButton,
    elements.importInvitationButton,
    elements.loadRsvpResponsesButton,
    elements.exportRsvpResponsesButton,
  ].forEach((button) => {
    button.disabled = isBusy;
  });
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => {
      reject(new Error("이미지 파일을 읽지 못했습니다."));
    };
    reader.onload = () => {
      const result = String(reader.result || "");
      const commaIndex = result.indexOf(",");
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };
    reader.readAsDataURL(file);
  });
}

function createUploadDescriptor(kind, file, extra) {
  return {
    kind,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    ...extra,
  };
}

async function buildPublishRequestPayload() {
  const images = [];

  const heroPending = getPendingFile("hero");
  if (heroPending && heroPending.file) {
    images.push({
      ...createUploadDescriptor("hero", heroPending.file),
      contentBase64: await readFileAsBase64(heroPending.file),
    });
  }

  const directionsPending = getPendingFile("directions");
  if (directionsPending && directionsPending.file) {
    images.push({
      ...createUploadDescriptor("directions", directionsPending.file),
      contentBase64: await readFileAsBase64(directionsPending.file),
    });
  }

  for (let index = 0; index < pendingFiles.gallery.length; index += 1) {
    const pending = getPendingFile("gallery", index);
    if (!pending || !pending.file) {
      continue;
    }

    images.push({
      ...createUploadDescriptor("gallery", pending.file, { slot: index + 1 }),
      contentBase64: await readFileAsBase64(pending.file),
    });
  }

  return {
    content: createSerializableInvitation(invitation),
    images,
  };
}

async function parsePublishError(response) {
  try {
    const payload = await response.json();
    if (payload && payload.error) {
      return payload.error;
    }
  } catch (error) {
    return `발행 엔드포인트 호출에 실패했습니다. (${response.status})`;
  }

  return `발행 엔드포인트 호출에 실패했습니다. (${response.status})`;
}

async function postPublishRequest(settings, payload) {
  const response = await window.fetch(settings.endpointUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${settings.publishPassword}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parsePublishError(response));
  }

  return response.json();
}

function renderBasicFields() {
  clearNode(elements.basicFields);

  appendFields(elements.basicFields, [
    createInputField({
      label: "브라우저 제목",
      value: invitation.title,
      onChange(value) {
        invitation.title = value;
      },
    }),
    createTextareaField({
      label: "초대의 글",
      value: invitation.invitationMessage,
      rows: 5,
      onChange(value) {
        invitation.invitationMessage = value;
      },
    }),
    createTextareaField({
      label: "첫 화면 소개 문구",
      value: invitation.ui.heroMessage,
      rows: 3,
      onChange(value) {
        invitation.ui.heroMessage = value;
      },
    }),
    createInputField({
      label: "대표 이미지 캡션",
      value: invitation.ui.heroImageCaption,
      onChange(value) {
        invitation.ui.heroImageCaption = value;
      },
    }),
    createTextareaField({
      label: "갤러리 안내 문구",
      value: invitation.ui.galleryNote,
      rows: 3,
      onChange(value) {
        invitation.ui.galleryNote = value;
      },
    }),
    createTextareaField({
      label: "계좌 안내 문구",
      value: invitation.ui.accountNote,
      rows: 3,
      onChange(value) {
        invitation.ui.accountNote = value;
      },
    }),
    createTextareaField({
      label: "참석 의사 안내 문구",
      value: invitation.ui.rsvpNote,
      rows: 3,
      onChange(value) {
        invitation.ui.rsvpNote = value;
      },
    }),
    createInputField({
      label: "하단 감사 제목",
      value: invitation.ui.footerTitle,
      onChange(value) {
        invitation.ui.footerTitle = value;
      },
    }),
    createTextareaField({
      label: "하단 감사 문구",
      value: invitation.ui.footerCopy,
      rows: 3,
      onChange(value) {
        invitation.ui.footerCopy = value;
      },
    }),
  ]);
}

function renderMediaEditor(kind, container, options) {
  clearNode(container);

  const previewSource = trimText(
    (getPendingFile(kind) || {}).previewUrl ||
      (kind === "hero" ? invitation.ui.heroImage : invitation.venue.directionsImage),
  );
  const previewAlt = kind === "hero" ? invitation.ui.heroImageAlt : invitation.venue.directionsImageAlt;
  const wrapper = document.createElement("div");
  wrapper.className = "editor-list";

  const article = document.createElement("article");
  article.className = "editor-item";

  article.appendChild(
    createMediaPreviewCard({
      src: previewSource,
      alt: previewAlt,
      emptyText: options.emptyText,
      wide: options.wide,
    }),
  );

  appendFields(article, [
    createInputField({
      label: options.altLabel,
      value: previewAlt,
      onChange(value) {
        if (kind === "hero") {
          invitation.ui.heroImageAlt = value;
          return;
        }
        invitation.venue.directionsImageAlt = value;
      },
    }),
  ]);

  const imageField = createFieldShell("사진 파일 선택");
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.addEventListener("change", (event) => {
    const [file] = event.target.files || [];
    if (!file) {
      return;
    }

    clearPendingFile(kind);
    pendingFiles[kind] = {
      file,
      previewUrl: URL.createObjectURL(file),
    };

    if (kind === "hero" && !trimText(invitation.ui.heroImageAlt)) {
      invitation.ui.heroImageAlt = "대표 이미지";
    }

    if (kind === "directions" && !trimText(invitation.venue.directionsImageAlt)) {
      invitation.venue.directionsImageAlt = "오시는 길 안내 이미지";
    }

    renderMediaEditor(kind, container, options);
    updateStatus(`${options.statusLabel}를 새로 선택했습니다. 공개 페이지에 반영하려면 발행해 주세요.`);
    showToast(`${options.statusLabel}를 선택했습니다`);
  });
  imageField.appendChild(fileInput);
  imageField.appendChild(
    createHelpText("선택한 새 파일은 이 탭에서만 미리보기로 유지됩니다. 실제 업로드와 공유 반영은 발행 버튼을 눌렀을 때 진행됩니다."),
  );
  article.appendChild(imageField);

  const meta = document.createElement("div");
  meta.className = "editor-image-meta";

  const pending = getPendingFile(kind);
  if (pending && pending.file) {
    meta.appendChild(
      createHelpText(`새로 선택한 파일: ${pending.file.name} · 아직 공개 페이지에는 반영되지 않았습니다.`),
    );
  } else if (previewSource) {
    meta.appendChild(createHelpText("현재 공개 이미지가 연결되어 있습니다."));
  } else {
    meta.appendChild(createHelpText("현재 연결된 이미지가 없습니다."));
  }

  const actions = document.createElement("div");
  actions.className = "editor-action-row";

  if (pending && pending.file) {
    actions.appendChild(
      createMiniButton("새 파일 선택 취소", () => {
        clearPendingFile(kind);
        renderMediaEditor(kind, container, options);
      }),
    );
  }

  if (pending || previewSource) {
    actions.appendChild(
      createMiniButton("이미지 비우기", () => {
        clearPendingFile(kind);
        if (kind === "hero") {
          invitation.ui.heroImage = "";
        } else {
          invitation.venue.directionsImage = "";
        }
        renderMediaEditor(kind, container, options);
      }),
    );
  }

  if (actions.childElementCount > 0) {
    meta.appendChild(actions);
  }

  article.appendChild(meta);
  wrapper.appendChild(article);
  container.appendChild(wrapper);
}

function renderPersonFields(container, person) {
  clearNode(container);

  appendFields(container, [
    createInputField({
      label: "성함",
      value: person.fullName,
      onChange(value) {
        person.fullName = value;
      },
    }),
    createInputField({
      label: "첫 화면 표시 이름",
      value: person.name,
      onChange(value) {
        person.name = value;
      },
    }),
    createInputField({
      label: "아버지 성함",
      value: person.father,
      onChange(value) {
        person.father = value;
      },
    }),
    createInputField({
      label: "어머니 성함",
      value: person.mother,
      onChange(value) {
        person.mother = value;
      },
    }),
    createInputField({
      label: "가족 관계 표기",
      value: person.relationship,
      placeholder: "예: 장남, 차녀",
      onChange(value) {
        person.relationship = value;
      },
    }),
    createInputField({
      label: "본인 연락처",
      value: person.phone,
      type: "tel",
      help: "공개 페이지에서는 번호 대신 전화/문자 아이콘만 노출됩니다.",
      onChange(value) {
        person.phone = value;
      },
    }),
    createInputField({
      label: "혼주 연락처",
      value: person.parentPhone,
      type: "tel",
      help: "공개 페이지에서는 번호 대신 전화/문자 아이콘만 노출됩니다.",
      onChange(value) {
        person.parentPhone = value;
      },
    }),
  ]);
}

function renderCeremonyFields() {
  clearNode(elements.ceremonyFields);

  const dateGrid = document.createElement("div");
  dateGrid.className = "editor-inline-grid";
  appendFields(dateGrid, [
    createInputField({
      label: "연도",
      value: invitation.ceremony.year,
      type: "number",
      min: 2000,
      onChange(value) {
        invitation.ceremony.year = value;
      },
    }),
    createInputField({
      label: "월",
      value: invitation.ceremony.month,
      type: "number",
      min: 1,
      max: 12,
      onChange(value) {
        invitation.ceremony.month = value;
      },
    }),
    createInputField({
      label: "일",
      value: invitation.ceremony.day,
      type: "number",
      min: 1,
      max: 31,
      onChange(value) {
        invitation.ceremony.day = value;
      },
    }),
    createSelectField({
      label: "오전/오후",
      value: invitation.ceremony.meridiem,
      options: [
        { value: "오전", label: "오전" },
        { value: "오후", label: "오후" },
      ],
      onChange(value) {
        invitation.ceremony.meridiem = value;
      },
    }),
    createInputField({
      label: "시",
      value: invitation.ceremony.hour,
      type: "number",
      min: 1,
      max: 12,
      onChange(value) {
        invitation.ceremony.hour = value;
      },
    }),
    createInputField({
      label: "분",
      value: invitation.ceremony.minute,
      type: "number",
      min: 0,
      max: 59,
      onChange(value) {
        invitation.ceremony.minute = value;
      },
    }),
  ]);

  const description = createTextareaField({
    label: "예식 설명 문구",
    value: invitation.ceremony.description,
    rows: 3,
    onChange(value) {
      invitation.ceremony.description = value;
    },
  });

  elements.ceremonyFields.append(dateGrid, description);
}

function renderVenueFields() {
  clearNode(elements.venueFields);

  appendFields(elements.venueFields, [
    createInputField({
      label: "예식장 이름",
      value: invitation.venue.name,
      onChange(value) {
        invitation.venue.name = value;
      },
    }),
    createInputField({
      label: "홀 또는 층 정보",
      value: invitation.venue.hall,
      onChange(value) {
        invitation.venue.hall = value;
      },
    }),
    createInputField({
      label: "주소",
      value: invitation.venue.address,
      onChange(value) {
        invitation.venue.address = value;
      },
    }),
    createTextareaField({
      label: "추가 길 안내",
      value: invitation.venue.detail,
      rows: 3,
      onChange(value) {
        invitation.venue.detail = value;
      },
    }),
    createInputField({
      label: "위도",
      value: invitation.venue.latitude,
      placeholder: "예: 37.5662952",
      help: "티맵 딥링크를 자동으로 만들 때 사용합니다.",
      onChange(value) {
        invitation.venue.latitude = value;
      },
    }),
    createInputField({
      label: "경도",
      value: invitation.venue.longitude,
      placeholder: "예: 126.9779451",
      help: "티맵 딥링크를 자동으로 만들 때 사용합니다.",
      onChange(value) {
        invitation.venue.longitude = value;
      },
    }),
    createInputField({
      label: "티맵 링크 직접 입력",
      value: invitation.venue.tmapLink,
      type: "url",
      placeholder: "예: tmap://route?... 또는 공유 링크",
      help: "입력하면 위도/경도보다 이 값을 우선 사용합니다.",
      onChange(value) {
        invitation.venue.tmapLink = value;
      },
    }),
  ]);
}

function renderTextCardList(container, list, options) {
  clearNode(container);

  if (list.length === 0) {
    const empty = document.createElement("p");
    empty.className = "editor-empty";
    empty.textContent = "아직 등록된 항목이 없습니다.";
    container.appendChild(empty);
  }

  const wrapper = document.createElement("div");
  wrapper.className = "editor-list";

  list.forEach((item, index) => {
    const article = createItemCard(`${options.itemLabel} ${index + 1}`, () => {
      list.splice(index, 1);
      options.render();
    });

    appendFields(article, [
      createInputField({
        label: "제목",
        value: item.title,
        onChange(value) {
          item.title = value;
        },
      }),
      createTextareaField({
        label: "내용",
        value: item.body,
        rows: 3,
        onChange(value) {
          item.body = value;
        },
      }),
    ]);

    wrapper.appendChild(article);
  });

  container.appendChild(wrapper);

  const actions = document.createElement("div");
  actions.className = "editor-action-row";
  actions.appendChild(
    createAddButton(options.addLabel, () => {
      list.push({ title: "", body: "" });
      options.render();
    }),
  );
  container.appendChild(actions);
}

function handleGalleryFileSelection(index, event) {
  const [file] = event.target.files || [];
  if (!file) {
    return;
  }

  clearPendingFile("gallery", index);
  pendingFiles.gallery[index] = {
    file,
    previewUrl: URL.createObjectURL(file),
  };

  if (!trimText(invitation.gallery[index].alt)) {
    invitation.gallery[index].alt = `${trimText(invitation.gallery[index].title) || `갤러리 ${index + 1}`} 이미지`;
  }

  renderGalleryEditor();
  updateStatus("갤러리 새 이미지를 선택했습니다. 공개 페이지에 반영하려면 발행해 주세요.");
  showToast("갤러리 이미지를 선택했습니다");
}

function renderGalleryEditor() {
  clearNode(elements.galleryEditor);

  const wrapper = document.createElement("div");
  wrapper.className = "editor-list";

  invitation.gallery.forEach((item, index) => {
    const article = createItemCard(`갤러리 카드 ${index + 1}`, () => {
      clearPendingFile("gallery", index);
      invitation.gallery.splice(index, 1);
      pendingFiles.gallery.splice(index, 1);
      renderGalleryEditor();
    });

    const preview = document.createElement("div");
    preview.className = "editor-gallery-preview";
    preview.appendChild(createGalleryPreviewCard(item, index));
    article.appendChild(preview);

    appendFields(article, [
      createInputField({
        label: "카드 제목",
        value: item.title,
        onChange(value) {
          item.title = value;
        },
      }),
      createTextareaField({
        label: "카드 설명",
        value: item.caption,
        rows: 3,
        onChange(value) {
          item.caption = value;
        },
      }),
      createInputField({
        label: "이미지 대체 텍스트",
        value: item.alt,
        placeholder: "예: 웨딩 스냅 사진",
        onChange(value) {
          item.alt = value;
        },
      }),
    ]);

    const imageField = createFieldShell("사진 파일 선택");
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.addEventListener("change", (event) => {
      handleGalleryFileSelection(index, event);
    });
    imageField.appendChild(fileInput);
    imageField.appendChild(
      createHelpText("이제 공개 페이지에서는 캐러셀과 전체 화면 스와이프 갤러리로 표시됩니다."),
    );
    article.appendChild(imageField);

    const colors = document.createElement("div");
    colors.className = "editor-color-grid";
    appendFields(colors, [
      createColorField({
        label: "배경 색상 A",
        value: item.tones[0],
        onChange(value) {
          item.tones[0] = value;
        },
      }),
      createColorField({
        label: "배경 색상 B",
        value: item.tones[1],
        onChange(value) {
          item.tones[1] = value;
        },
      }),
    ]);
    article.appendChild(colors);

    const imageMeta = document.createElement("div");
    imageMeta.className = "editor-image-meta";

    const pending = getPendingFile("gallery", index);
    if (pending && pending.file) {
      imageMeta.appendChild(
        createHelpText(`새로 선택한 파일: ${pending.file.name} · 아직 공개 페이지에는 반영되지 않았습니다.`),
      );
    } else if (item.image) {
      imageMeta.appendChild(createHelpText("현재 공개 이미지가 연결되어 있습니다."));
    } else {
      imageMeta.appendChild(createHelpText("현재 연결된 이미지가 없습니다. 이미지가 없으면 배경 카드형 비주얼이 표시됩니다."));
    }

    const actions = document.createElement("div");
    actions.className = "editor-action-row";

    if (pending && pending.file) {
      actions.appendChild(
        createMiniButton("새 파일 선택 취소", () => {
          clearPendingFile("gallery", index);
          renderGalleryEditor();
        }),
      );
    }

    if (pending || item.image) {
      actions.appendChild(
        createMiniButton("이미지 비우기", () => {
          clearPendingFile("gallery", index);
          item.image = "";
          renderGalleryEditor();
        }),
      );
    }

    if (actions.childElementCount > 0) {
      imageMeta.appendChild(actions);
    }

    article.appendChild(imageMeta);
    wrapper.appendChild(article);
  });

  elements.galleryEditor.appendChild(wrapper);

  const actions = document.createElement("div");
  actions.className = "editor-action-row";
  actions.appendChild(
    createAddButton("갤러리 카드 추가", () => {
      invitation.gallery.push({
        title: "",
        caption: "",
        tones: ["#d9b7a5", "#b46e5a"],
        image: "",
        alt: "",
      });
      pendingFiles.gallery.push(null);
      renderGalleryEditor();
    }),
  );
  elements.galleryEditor.appendChild(actions);
}

function renderTimelineEditor() {
  clearNode(elements.timelineEditor);

  const wrapper = document.createElement("div");
  wrapper.className = "editor-list";

  invitation.timeline.forEach((item, index) => {
    const article = createItemCard(`타임라인 ${index + 1}`, () => {
      invitation.timeline.splice(index, 1);
      renderTimelineEditor();
    });

    appendFields(article, [
      createInputField({
        label: "단계 이름",
        value: item.step,
        onChange(value) {
          item.step = value;
        },
      }),
      createInputField({
        label: "제목",
        value: item.title,
        onChange(value) {
          item.title = value;
        },
      }),
      createTextareaField({
        label: "설명",
        value: item.body,
        rows: 3,
        onChange(value) {
          item.body = value;
        },
      }),
    ]);

    wrapper.appendChild(article);
  });

  elements.timelineEditor.appendChild(wrapper);

  const actions = document.createElement("div");
  actions.className = "editor-action-row";
  actions.appendChild(
    createAddButton("타임라인 추가", () => {
      invitation.timeline.push({ step: "", title: "", body: "" });
      renderTimelineEditor();
    }),
  );
  elements.timelineEditor.appendChild(actions);
}

function renderAccountsEditor() {
  clearNode(elements.accountEditor);

  const wrapper = document.createElement("div");
  wrapper.className = "editor-list";

  invitation.accounts.forEach((group, groupIndex) => {
    const article = createItemCard(`계좌 그룹 ${groupIndex + 1}`, () => {
      invitation.accounts.splice(groupIndex, 1);
      renderAccountsEditor();
    });

    article.appendChild(
      createInputField({
        label: "그룹 제목",
        value: group.label,
        onChange(value) {
          group.label = value;
        },
      }),
    );

    const entryList = document.createElement("div");
    entryList.className = "editor-entry-list";

    group.entries.forEach((entry, entryIndex) => {
      const entryCard = document.createElement("div");
      entryCard.className = "editor-entry";

      const head = document.createElement("div");
      head.className = "editor-entry-head";

      const title = document.createElement("h4");
      title.className = "editor-entry-title";
      title.textContent = `계좌 ${entryIndex + 1}`;

      head.append(
        title,
        createMiniButton("삭제", () => {
          group.entries.splice(entryIndex, 1);
          renderAccountsEditor();
        }),
      );

      const fields = document.createElement("div");
      fields.className = "editor-entry-grid";
      appendFields(fields, [
        createInputField({
          label: "역할",
          value: entry.role,
          onChange(value) {
            entry.role = value;
          },
        }),
        createInputField({
          label: "예금주",
          value: entry.holder,
          onChange(value) {
            entry.holder = value;
          },
        }),
        createInputField({
          label: "은행명",
          value: entry.bank,
          onChange(value) {
            entry.bank = value;
          },
        }),
        createInputField({
          label: "계좌번호",
          value: entry.number,
          onChange(value) {
            entry.number = value;
          },
        }),
      ]);

      entryCard.append(head, fields);
      entryList.appendChild(entryCard);
    });

    const addEntryRow = document.createElement("div");
    addEntryRow.className = "editor-action-row";
    addEntryRow.appendChild(
      createAddButton("계좌 추가", () => {
        group.entries.push({
          role: "",
          holder: "",
          bank: "",
          number: "",
        });
        renderAccountsEditor();
      }),
    );

    article.append(entryList, addEntryRow);
    wrapper.appendChild(article);
  });

  elements.accountEditor.appendChild(wrapper);

  const actions = document.createElement("div");
  actions.className = "editor-action-row";
  actions.appendChild(
    createAddButton("계좌 그룹 추가", () => {
      invitation.accounts.push({
        label: "",
        entries: [{ role: "", holder: "", bank: "", number: "" }],
      });
      renderAccountsEditor();
    }),
  );
  elements.accountEditor.appendChild(actions);
}

function renderRsvpSettingsFields() {
  clearNode(elements.rsvpSettingsFields);

  appendFields(elements.rsvpSettingsFields, [
    createInputField({
      label: "공개 페이지 RSVP 엔드포인트 URL",
      value: invitation.rsvp.endpointUrl,
      type: "url",
      placeholder: "예: https://...workers.dev/rsvp",
      help: "공개 초대장 페이지가 하객 응답을 저장할 주소입니다.",
      onChange(value) {
        invitation.rsvp.endpointUrl = value;
      },
    }),
    createTextareaField({
      label: "관리 메모 문구",
      value: invitation.rsvp.adminLabel,
      rows: 2,
      help: "편집기 쪽 참고용 문구입니다.",
      onChange(value) {
        invitation.rsvp.adminLabel = value;
      },
    }),
  ]);
}

function formatDateTime(value) {
  if (!trimText(value)) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat("ko-KR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch (error) {
    return value;
  }
}

function parseJsonResponse(response) {
  return response.json().catch(() => null);
}

function getRsvpAdminEndpoint() {
  return trimText(invitation.rsvp.endpointUrl) || deriveRsvpEndpointFromPublish(trimText(elements.publishEndpointUrl.value));
}

function getAuthorizationHeader() {
  return trimText(elements.publishPassword.value);
}

async function fetchRsvpResponses() {
  const endpointUrl = getRsvpAdminEndpoint();
  const password = getAuthorizationHeader();

  if (!endpointUrl) {
    throw new Error("먼저 RSVP 엔드포인트 URL을 입력해 주세요.");
  }

  if (!password) {
    throw new Error("응답 관리에는 발행 비밀번호가 필요합니다.");
  }

  const response = await window.fetch(endpointUrl, {
    headers: {
      Authorization: `Bearer ${password}`,
    },
  });
  const payload = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(payload && payload.error ? payload.error : `응답을 불러오지 못했습니다. (${response.status})`);
  }

  return Array.isArray(payload && payload.responses) ? payload.responses : [];
}

async function updateRsvpResponse(id, patch) {
  const endpointUrl = getRsvpAdminEndpoint();
  const password = getAuthorizationHeader();
  const response = await window.fetch(`${endpointUrl}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${password}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patch),
  });
  const payload = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(payload && payload.error ? payload.error : `응답 수정에 실패했습니다. (${response.status})`);
  }

  return payload && payload.response ? payload.response : null;
}

async function deleteRsvpResponse(id) {
  const endpointUrl = getRsvpAdminEndpoint();
  const password = getAuthorizationHeader();
  const response = await window.fetch(`${endpointUrl}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${password}`,
    },
  });
  const payload = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(payload && payload.error ? payload.error : `응답 삭제에 실패했습니다. (${response.status})`);
  }
}

function renderRsvpManagerList() {
  clearNode(elements.rsvpManagerList);

  if (trimText(invitation.rsvp.adminLabel)) {
    elements.rsvpManagerList.appendChild(createHelpText(invitation.rsvp.adminLabel));
  }

  if (rsvpResponses.length === 0) {
    const empty = document.createElement("p");
    empty.className = "editor-empty";
    empty.textContent = "아직 불러온 응답이 없습니다.";
    elements.rsvpManagerList.appendChild(empty);
    return;
  }

  const list = document.createElement("div");
  list.className = "editor-response-list";

  rsvpResponses.forEach((responseItem) => {
    const card = document.createElement("article");
    card.className = "editor-response-card";

    const head = document.createElement("div");
    head.className = "editor-response-head";

    const titleWrap = document.createElement("div");
    const name = document.createElement("h3");
    name.className = "editor-response-name";
    name.textContent = responseItem.guestName || "이름 없음";

    const submitted = document.createElement("p");
    submitted.className = "editor-help";
    submitted.textContent = `${formatDateTime(responseItem.submittedAt)} 접수`;
    titleWrap.append(name, submitted);

    head.append(titleWrap);

    const actions = document.createElement("div");
    actions.className = "editor-action-row";
    actions.appendChild(
      createMiniButton("삭제", async () => {
        const confirmed = window.confirm("이 RSVP 응답을 삭제할까요?");
        if (!confirmed) {
          return;
        }

        try {
          await deleteRsvpResponse(responseItem.id);
          rsvpResponses = rsvpResponses.filter((item) => item.id !== responseItem.id);
          renderRsvpManagerList();
          updateRsvpManagerStatus("응답을 삭제했습니다.");
          showToast("응답을 삭제했습니다");
        } catch (error) {
          updateRsvpManagerStatus(error.message);
          showToast("응답 삭제에 실패했습니다");
        }
      }),
    );
    head.appendChild(actions);

    const meta = document.createElement("div");
    meta.className = "editor-response-meta";
    [
      responseItem.attendance,
      `동행 ${responseItem.companions || "0"}명`,
      responseItem.meal,
      responseItem.adminStatus || "미확인",
    ]
      .filter(Boolean)
      .forEach((label) => {
        const pill = document.createElement("span");
        pill.className = "editor-response-pill";
        pill.textContent = label;
        meta.appendChild(pill);
      });

    const grid = document.createElement("div");
    grid.className = "editor-response-grid";

    const statusField = createSelectField({
      label: "관리 상태",
      value: responseItem.adminStatus || "미확인",
      options: [
        { value: "미확인", label: "미확인" },
        { value: "확인 완료", label: "확인 완료" },
        { value: "연락 필요", label: "연락 필요" },
      ],
      onChange(value) {
        responseItem.adminStatus = value;
      },
    });

    const memoField = createTextareaField({
      label: "관리 메모",
      value: responseItem.adminMemo || "",
      rows: 3,
      placeholder: "예: 좌석 요청 확인 필요",
      onChange(value) {
        responseItem.adminMemo = value;
      },
    });

    grid.append(
      statusField,
      createTextareaField({
        label: "하객 메시지",
        value: responseItem.message || "",
        rows: 3,
        placeholder: "남긴 메시지가 없습니다.",
        readOnly: true,
        onChange() {
          return;
        },
        help: "하객이 남긴 메시지는 읽기 전용으로 확인합니다.",
      }),
      memoField,
    );

    const saveRow = document.createElement("div");
    saveRow.className = "editor-action-row";
    saveRow.appendChild(
      createMiniButton("상태 저장", async () => {
        try {
          const updated = await updateRsvpResponse(responseItem.id, {
            adminStatus: responseItem.adminStatus || "미확인",
            adminMemo: responseItem.adminMemo || "",
          });
          rsvpResponses = rsvpResponses.map((item) => (
            item.id === responseItem.id ? (updated || responseItem) : item
          ));
          renderRsvpManagerList();
          updateRsvpManagerStatus("응답 상태를 저장했습니다.");
          showToast("응답 상태를 저장했습니다");
        } catch (error) {
          updateRsvpManagerStatus(error.message);
          showToast("응답 상태 저장에 실패했습니다");
        }
      }),
    );

    card.append(head, meta, grid, saveRow);
    list.appendChild(card);
  });

  elements.rsvpManagerList.appendChild(list);
}

function escapeCsv(value) {
  const text = String(value == null ? "" : value);
  if (/[",\n]/u.test(text)) {
    return `"${text.replace(/"/gu, '""')}"`;
  }
  return text;
}

function downloadRsvpCsv() {
  if (rsvpResponses.length === 0) {
    updateRsvpManagerStatus("내보낼 RSVP 응답이 없습니다.");
    showToast("먼저 RSVP 응답을 불러와 주세요");
    return;
  }

  const rows = [
    ["이름", "참석 여부", "동행 인원", "식사", "하객 메시지", "관리 상태", "관리 메모", "접수 시각"],
    ...rsvpResponses.map((item) => [
      item.guestName,
      item.attendance,
      item.companions,
      item.meal,
      item.message,
      item.adminStatus,
      item.adminMemo,
      item.submittedAt,
    ]),
  ];

  const csv = `${rows.map((row) => row.map(escapeCsv).join(",")).join("\n")}\n`;
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "wedding-rsvp-responses.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  updateRsvpManagerStatus("RSVP 응답을 CSV로 내보냈습니다.");
  showToast("CSV 파일을 다운로드했습니다");
}

function renderAll() {
  document.title = `${invitation.title} 편집`;
  renderBasicFields();
  renderMediaEditor("hero", elements.heroMediaEditor, {
    emptyText: "첫 화면 대표 이미지를 추가해 주세요.",
    altLabel: "대표 이미지 대체 텍스트",
    statusLabel: "대표 이미지",
    wide: false,
  });
  renderMediaEditor("directions", elements.directionsMediaEditor, {
    emptyText: "오시는 길 약도 이미지를 추가해 주세요.",
    altLabel: "약도 이미지 대체 텍스트",
    statusLabel: "약도 이미지",
    wide: true,
  });
  renderPersonFields(elements.groomFields, invitation.groom);
  renderPersonFields(elements.brideFields, invitation.bride);
  renderCeremonyFields();
  renderVenueFields();
  renderTextCardList(elements.transportEditor, invitation.transport, {
    itemLabel: "교통 안내",
    addLabel: "교통 안내 추가",
    render: renderAll,
  });
  renderTextCardList(elements.noticeEditor, invitation.notices, {
    itemLabel: "안내 카드",
    addLabel: "안내 카드 추가",
    render: renderAll,
  });
  renderGalleryEditor();
  renderTimelineEditor();
  renderAccountsEditor();
  renderRsvpSettingsFields();
  renderRsvpManagerList();
}

function ensureDefaultRsvpEndpoint() {
  if (trimText(invitation.rsvp.endpointUrl)) {
    return;
  }

  invitation.rsvp.endpointUrl = deriveRsvpEndpointFromPublish(trimText(elements.publishEndpointUrl.value)) ||
    DEFAULT_PUBLISH_ENDPOINT_URL.replace(/\/publish$/u, "/rsvp");
}

function saveInvitation() {
  const result = store.saveInvitation(invitation);
  invitation = store.cloneInvitation(result.invitation);
  renderAll();

  if (!result.success) {
    updateStatus("저장에 실패했습니다. 브라우저 저장소 접근 권한을 확인해 주세요.");
    showToast("저장에 실패했습니다");
    return;
  }

  const pendingCount = countPendingUploads();
  if (pendingCount > 0) {
    updateStatus(`편집 내용을 저장했습니다. 새 이미지 ${pendingCount}개는 이 탭에만 남아 있으며, 공개 반영은 발행 버튼을 눌러야 합니다.`);
  } else {
    updateStatus("편집 내용을 저장했습니다. 초대장 페이지를 새로고침하면 이 기기 초안이 반영됩니다.");
  }
  showToast("편집 내용을 저장했습니다");
}

function resetInvitation() {
  const confirmed = window.confirm("저장된 편집값을 지우고 기본 예시값으로 되돌릴까요?");
  if (!confirmed) {
    return;
  }

  store.clearInvitation();
  clearAllPendingFiles();
  invitation = store.createDefaultInvitation();
  ensureDefaultRsvpEndpoint();
  rsvpResponses = [];
  renderAll();
  updateStatus("기본 예시값으로 복원했습니다.");
  updatePublishStatus("공개 발행 전 상태입니다.");
  updateRsvpManagerStatus("응답 목록을 초기화했습니다.");
  showToast("기본값으로 복원했습니다");
}

function downloadJsonFile() {
  const json = exportInvitationJson();
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "wedding-invitation-content.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  updateStatus("현재 편집값을 JSON 파일로 내보냈습니다.");
  showToast("JSON 파일을 다운로드했습니다");
}

function importJsonFile(event) {
  const [file] = event.target.files || [];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const result = store.importInvitation(String(reader.result || ""));
      clearAllPendingFiles();
      invitation = store.cloneInvitation(result.invitation);
      renderAll();
      updateStatus("JSON 파일을 불러와 저장했습니다.");
      showToast("JSON 파일을 불러왔습니다");
    } catch (error) {
      updateStatus("JSON 형식을 읽지 못했습니다. 내보낸 파일인지 확인해 주세요.");
      showToast("JSON 파일을 읽지 못했습니다");
    }

    elements.importFileInput.value = "";
  };

  reader.readAsText(file, "utf-8");
}

async function publishInvitation() {
  const settings = persistPublishSettings();
  if (!settings.endpointUrl) {
    updatePublishStatus("발행 엔드포인트 URL을 입력해 주세요.");
    showToast("발행 엔드포인트 URL이 필요합니다");
    return;
  }

  if (!settings.publishPassword) {
    updatePublishStatus("발행 비밀번호를 입력해 주세요.");
    showToast("발행 비밀번호가 필요합니다");
    return;
  }

  ensureDefaultRsvpEndpoint();

  const saved = store.saveInvitation(invitation);
  invitation = store.cloneInvitation(saved.invitation);
  renderAll();

  setBusy(true);
  updatePublishStatus("보호된 서버리스 엔드포인트로 발행 요청을 보내는 중입니다.");

  try {
    const payload = await buildPublishRequestPayload();
    const response = await postPublishRequest(settings, payload);
    const publishedContent = response && response.content ? response.content : payload.content;

    store.clearPublishedCache();
    clearAllPendingFiles();

    const localSave = store.saveInvitation(publishedContent);
    invitation = store.cloneInvitation(localSave.invitation);
    renderAll();

    if (response && response.publicSiteUrl) {
      elements.publicSiteUrl.value = response.publicSiteUrl;
      persistPublishSettings();
    }

    const uploadedCount = Array.isArray(response && response.uploadedAssets)
      ? response.uploadedAssets.length
      : Array.isArray(response && response.uploadedSlots)
        ? response.uploadedSlots.length
        : 0;

    updateStatus("초안과 공개본을 함께 갱신했습니다.");
    updatePublishStatus(
      uploadedCount > 0
        ? `이미지 ${uploadedCount}개와 초대장 내용을 발행했습니다. GitHub Pages 반영까지 1~2분 정도 걸릴 수 있습니다.`
        : "초대장 내용을 발행했습니다. GitHub Pages 반영까지 1~2분 정도 걸릴 수 있습니다.",
    );

    showToast("공유 페이지 발행을 시작했습니다");
  } catch (error) {
    updatePublishStatus(`발행에 실패했습니다. ${error.message}`);
    showToast("공개 발행에 실패했습니다");
  } finally {
    setBusy(false);
  }
}

async function reloadPublishedInvitation() {
  const confirmed = window.confirm("현재 편집 중인 내용을 덮어쓰고 공개된 초대장 내용을 다시 불러올까요?");
  if (!confirmed) {
    return;
  }

  setBusy(true);
  updatePublishStatus("현재 공개본을 다시 불러오는 중입니다.");

  try {
    store.clearPublishedCache();
    const published = await store.fetchPublishedInvitation({ force: true });
    if (!published) {
      throw new Error("현재 공개된 content.json을 찾지 못했습니다.");
    }

    clearAllPendingFiles();
    invitation = store.cloneInvitation(published);
    ensureDefaultRsvpEndpoint();
    store.saveInvitation(invitation);
    renderAll();
    updateStatus("현재 공개본 기준으로 편집 초안을 다시 맞췄습니다.");
    updatePublishStatus("현재 공개본을 다시 불러왔습니다.");
    showToast("공개본을 불러왔습니다");
  } catch (error) {
    updatePublishStatus(`공개본을 불러오지 못했습니다. ${error.message}`);
    showToast("공개본을 불러오지 못했습니다");
  } finally {
    setBusy(false);
  }
}

async function loadRsvpResponses() {
  setBusy(true);
  updateRsvpManagerStatus("서버에 저장된 RSVP 응답을 불러오는 중입니다.");

  try {
    rsvpResponses = await fetchRsvpResponses();
    renderRsvpManagerList();
    updateRsvpManagerStatus(`응답 ${rsvpResponses.length}건을 불러왔습니다.`);
    showToast("RSVP 응답을 불러왔습니다");
  } catch (error) {
    updateRsvpManagerStatus(error.message);
    showToast("RSVP 응답을 불러오지 못했습니다");
  } finally {
    setBusy(false);
  }
}

function bindEvents() {
  elements.saveInvitationButton.addEventListener("click", saveInvitation);
  elements.resetInvitationButton.addEventListener("click", resetInvitation);
  elements.exportInvitationButton.addEventListener("click", downloadJsonFile);
  elements.importInvitationButton.addEventListener("click", () => {
    elements.importFileInput.click();
  });
  elements.importFileInput.addEventListener("change", importJsonFile);
  elements.publishInvitationButton.addEventListener("click", publishInvitation);
  elements.reloadPublishedButton.addEventListener("click", reloadPublishedInvitation);
  elements.loadRsvpResponsesButton.addEventListener("click", loadRsvpResponses);
  elements.exportRsvpResponsesButton.addEventListener("click", downloadRsvpCsv);

  [elements.publishEndpointUrl, elements.publicSiteUrl].forEach((input) => {
    input.addEventListener("input", () => {
      persistPublishSettings();
    });
  });

  elements.publishPassword.addEventListener("input", () => {
    storePublishPassword(trimText(elements.publishPassword.value));
  });

  window.addEventListener("storage", (event) => {
    if (event.key === store.CONTENT_STORAGE_KEY) {
      invitation = store.getInvitation();
      ensureDefaultRsvpEndpoint();
      renderAll();
      updateStatus("다른 탭에서 저장된 편집값을 다시 불러왔습니다.");
      return;
    }

    if (event.key === store.PUBLISH_SETTINGS_STORAGE_KEY) {
      hydratePublishSettings();
      updatePublishStatus("다른 탭에서 발행 설정이 업데이트되었습니다.");
    }
  });
}

async function init() {
  const hasLocalDraft = store.hasSavedInvitation();
  hydratePublishSettings();
  invitation = await store.loadInvitation();
  ensureDefaultRsvpEndpoint();
  renderAll();
  bindEvents();

  if (hasLocalDraft) {
    updateStatus("이 기기에 저장된 편집 초안을 불러왔습니다.");
  } else {
    updateStatus("현재 공개본 또는 기본 예시값을 불러왔습니다.");
  }
  updatePublishStatus("서버리스 발행 엔드포인트를 연결하면 공개 페이지를 갱신할 수 있습니다.");
  updateRsvpManagerStatus("응답을 불러오면 여기에서 관리할 수 있습니다.");
}

init();
