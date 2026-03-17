"use strict";

const store = window.WeddingInvitationStore;
const PUBLISH_PASSWORD_SESSION_KEY = "wedding-invitation-publish-password-v1";
const DEFAULT_PUBLISH_ENDPOINT_URL = "https://mobile-wedding-invitation-site.ksu1949.workers.dev/publish";
const DEFAULT_PUBLIC_SITE_URL = "https://seunguk-2.github.io/mobile-wedding-invitation-site/";

let invitation = store.createDefaultInvitation();
let toastTimer = 0;
const pendingGalleryFiles = [];

const elements = {
  basicFields: document.getElementById("basicFields"),
  groomFields: document.getElementById("groomFields"),
  brideFields: document.getElementById("brideFields"),
  ceremonyFields: document.getElementById("ceremonyFields"),
  venueFields: document.getElementById("venueFields"),
  transportEditor: document.getElementById("transportEditor"),
  noticeEditor: document.getElementById("noticeEditor"),
  galleryEditor: document.getElementById("galleryEditor"),
  timelineEditor: document.getElementById("timelineEditor"),
  accountEditor: document.getElementById("accountEditor"),
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

function getPendingGalleryFile(index) {
  return pendingGalleryFiles[index] || null;
}

function clearPendingGalleryFile(index) {
  const pending = getPendingGalleryFile(index);
  if (pending && pending.previewUrl) {
    URL.revokeObjectURL(pending.previewUrl);
  }
  pendingGalleryFiles[index] = null;
}

function clearAllPendingGalleryFiles() {
  pendingGalleryFiles.forEach((_, index) => {
    clearPendingGalleryFile(index);
  });
  pendingGalleryFiles.length = 0;
}

function countPendingGalleryFiles() {
  return pendingGalleryFiles.reduce((count, item) => {
    return item && item.file ? count + 1 : count;
  }, 0);
}

function getGalleryPreviewSource(item, index) {
  const pending = getPendingGalleryFile(index);
  if (pending && pending.previewUrl) {
    return pending.previewUrl;
  }
  return item.image || "";
}

function createGalleryPreviewCard(item, index) {
  const article = document.createElement("article");
  article.className = "gallery-card editor-preview-card";
  article.style.setProperty("--tone-a", item.tones[0]);
  article.style.setProperty("--tone-b", item.tones[1]);

  const imageSource = getGalleryPreviewSource(item, index);
  if (imageSource) {
    article.classList.add("has-image");
    const image = document.createElement("img");
    image.className = "gallery-image";
    image.src = imageSource;
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

function createSerializableInvitation(source) {
  const prepared = store.cloneInvitation(source);
  return {
    title: prepared.title,
    invitationMessage: prepared.invitationMessage,
    ui: {
      heroMessage: prepared.ui.heroMessage,
      heroArtLabel: prepared.ui.heroArtLabel,
      heroArtCaption: prepared.ui.heroArtCaption,
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
  };
}

function exportInvitationJson() {
  return `${JSON.stringify(createSerializableInvitation(invitation), null, 2)}\n`;
}

function trimText(value) {
  return String(value || "").trim();
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

function setPublishBusy(isBusy) {
  [
    elements.publishInvitationButton,
    elements.reloadPublishedButton,
    elements.saveInvitationButton,
    elements.resetInvitationButton,
    elements.exportInvitationButton,
    elements.importInvitationButton,
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

async function buildPublishRequestPayload() {
  const images = [];

  for (let index = 0; index < pendingGalleryFiles.length; index += 1) {
    const pending = getPendingGalleryFile(index);
    if (!pending || !pending.file) {
      continue;
    }

    images.push({
      slot: index + 1,
      fileName: pending.file.name,
      mimeType: pending.file.type || "application/octet-stream",
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
      label: "상단 아치 문구",
      value: invitation.ui.heroArtLabel,
      onChange(value) {
        invitation.ui.heroArtLabel = value;
      },
    }),
    createInputField({
      label: "상단 캡션 문구",
      value: invitation.ui.heroArtCaption,
      onChange(value) {
        invitation.ui.heroArtCaption = value;
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
      onChange(value) {
        person.phone = value;
      },
    }),
    createInputField({
      label: "혼주 연락처",
      value: person.parentPhone,
      type: "tel",
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

  clearPendingGalleryFile(index);
  pendingGalleryFiles[index] = {
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
      clearPendingGalleryFile(index);
      invitation.gallery.splice(index, 1);
      pendingGalleryFiles.splice(index, 1);
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
      createHelpText("선택한 새 파일은 이 탭에서 미리보기만 유지됩니다. 실제 업로드와 공유 반영은 발행 버튼을 눌렀을 때 진행됩니다."),
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

    const pending = getPendingGalleryFile(index);
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
          clearPendingGalleryFile(index);
          renderGalleryEditor();
        }),
      );
    }

    if (pending || item.image) {
      actions.appendChild(
        createMiniButton("이미지 비우기", () => {
          clearPendingGalleryFile(index);
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
      pendingGalleryFiles.push(null);
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

function renderAll() {
  document.title = `${invitation.title} 편집`;
  renderBasicFields();
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

  const pendingCount = countPendingGalleryFiles();
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
  clearAllPendingGalleryFiles();
  invitation = store.createDefaultInvitation();
  renderAll();
  updateStatus("기본 예시값으로 복원했습니다.");
  updatePublishStatus("공개 발행 전 상태입니다.");
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
      clearAllPendingGalleryFiles();
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

  const saved = store.saveInvitation(invitation);
  invitation = store.cloneInvitation(saved.invitation);
  renderAll();

  setPublishBusy(true);
  updatePublishStatus("보호된 서버리스 엔드포인트로 발행 요청을 보내는 중입니다.");

  try {
    const payload = await buildPublishRequestPayload();
    const response = await postPublishRequest(settings, payload);
    const publishedContent = response && response.content ? response.content : payload.content;

    store.clearPublishedCache();
    clearAllPendingGalleryFiles();

    const localSave = store.saveInvitation(publishedContent);
    invitation = store.cloneInvitation(localSave.invitation);
    renderAll();

    if (response && response.publicSiteUrl) {
      elements.publicSiteUrl.value = response.publicSiteUrl;
      persistPublishSettings();
    }

    updateStatus("초안과 공개본을 함께 갱신했습니다.");
    if (response && Array.isArray(response.uploadedSlots) && response.uploadedSlots.length > 0) {
      updatePublishStatus(
        `갤러리 이미지 ${response.uploadedSlots.length}개와 초대장 내용을 발행했습니다. GitHub Pages 반영까지 1~2분 정도 걸릴 수 있습니다.`,
      );
    } else {
      updatePublishStatus("초대장 내용을 발행했습니다. GitHub Pages 반영까지 1~2분 정도 걸릴 수 있습니다.");
    }

    showToast("공유 페이지 발행을 시작했습니다");
  } catch (error) {
    updatePublishStatus(`발행에 실패했습니다. ${error.message}`);
    showToast("공개 발행에 실패했습니다");
  } finally {
    setPublishBusy(false);
  }
}

async function reloadPublishedInvitation() {
  const confirmed = window.confirm("현재 편집 중인 내용을 덮어쓰고 공개된 초대장 내용을 다시 불러올까요?");
  if (!confirmed) {
    return;
  }

  setPublishBusy(true);
  updatePublishStatus("현재 공개본을 다시 불러오는 중입니다.");

  try {
    store.clearPublishedCache();
    const published = await store.fetchPublishedInvitation({ force: true });
    if (!published) {
      throw new Error("현재 공개된 content.json을 찾지 못했습니다.");
    }

    clearAllPendingGalleryFiles();
    invitation = store.cloneInvitation(published);
    store.saveInvitation(invitation);
    renderAll();
    updateStatus("현재 공개본 기준으로 편집 초안을 다시 맞췄습니다.");
    updatePublishStatus("현재 공개본을 다시 불러왔습니다.");
    showToast("공개본을 불러왔습니다");
  } catch (error) {
    updatePublishStatus(`공개본을 불러오지 못했습니다. ${error.message}`);
    showToast("공개본을 불러오지 못했습니다");
  } finally {
    setPublishBusy(false);
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
  invitation = await store.loadInvitation();
  renderAll();
  hydratePublishSettings();
  bindEvents();

  if (hasLocalDraft) {
    updateStatus("이 기기에 저장된 편집 초안을 불러왔습니다.");
  } else {
    updateStatus("현재 공개본 또는 기본 예시값을 불러왔습니다.");
  }
  updatePublishStatus("서버리스 발행 엔드포인트를 연결하면 공개 페이지를 갱신할 수 있습니다.");
}

init();
