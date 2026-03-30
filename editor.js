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
  groomFields: document.getElementById("groomFields"),
  brideFields: document.getElementById("brideFields"),
  ceremonyFields: document.getElementById("ceremonyFields"),
  venueFields: document.getElementById("venueFields"),
  galleryEditor: document.getElementById("galleryEditor"),
  timelineEditor: document.getElementById("timelineEditor"),
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
  if (elements.rsvpManagerStatus) {
    elements.rsvpManagerStatus.textContent = message;
  }
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
    head.appendChild(createMiniButton("Remove", onRemove));
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
    image.alt = item.alt || item.title || `Gallery image ${index + 1}`;
    image.loading = "lazy";
    image.decoding = "async";
    image.draggable = false;
    article.appendChild(image);
  }

  const copy = document.createElement("span");
  copy.className = "gallery-copy";

  const title = document.createElement("strong");
  title.className = "gallery-title";
  title.textContent = item.title || `Gallery ${index + 1}`;

  const caption = document.createElement("span");
  caption.className = "gallery-caption";
  caption.textContent = item.caption || "Add a caption to show text here.";

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
    elements.publishPreviewLink.textContent = "Enter the public site URL to show it here.";
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
  ].filter(Boolean).forEach((button) => {
    button.disabled = isBusy;
  });
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => {
      reject(new Error("The image file could not be read."));
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
    return `The publish endpoint request failed. (${response.status})`;
  }

  return `The publish endpoint request failed. (${response.status})`;
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
      label: "Page Title",
      value: invitation.title,
      onChange(value) {
        invitation.title = value;
      },
    }),
    createTextareaField({
      label: "Invitation Message",
      value: invitation.invitationMessage,
      rows: 5,
      onChange(value) {
        invitation.invitationMessage = value;
      },
    }),
    createTextareaField({
      label: "Hero Note",
      value: invitation.ui.heroMessage,
      rows: 3,
      onChange(value) {
        invitation.ui.heroMessage = value;
      },
    }),
    createInputField({
      label: "Hero Image Caption",
      value: invitation.ui.heroImageCaption,
      onChange(value) {
        invitation.ui.heroImageCaption = value;
      },
    }),
    createTextareaField({
      label: "Gallery Note",
      value: invitation.ui.galleryNote,
      rows: 3,
      onChange(value) {
        invitation.ui.galleryNote = value;
      },
    }),
    createInputField({
      label: "Footer Title",
      value: invitation.ui.footerTitle,
      onChange(value) {
        invitation.ui.footerTitle = value;
      },
    }),
    createTextareaField({
      label: "Footer Copy",
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

  const imageField = createFieldShell("Choose Image File");
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
      invitation.ui.heroImageAlt = "Hero image";
    }

    if (kind === "directions" && !trimText(invitation.venue.directionsImageAlt)) {
      invitation.venue.directionsImageAlt = "Directions image";
    }

    renderMediaEditor(kind, container, options);
    updateStatus(`${options.statusLabel} selected. Publish the page to push it live.`);
    showToast(`${options.statusLabel} selected`);
  });
  imageField.appendChild(fileInput);
  imageField.appendChild(
    createHelpText("The new file stays as a local preview in this tab until you publish. Uploading to the shared site happens only when you publish."),
  );
  article.appendChild(imageField);

  const meta = document.createElement("div");
  meta.className = "editor-image-meta";

  const pending = getPendingFile(kind);
  if (pending && pending.file) {
    meta.appendChild(
      createHelpText(`Selected file: ${pending.file.name} · not yet published to the live page.`),
    );
  } else if (previewSource) {
    meta.appendChild(createHelpText("A published image is currently connected."));
  } else {
    meta.appendChild(createHelpText("No image is currently connected."));
  }

  const actions = document.createElement("div");
  actions.className = "editor-action-row";

  if (pending && pending.file) {
    actions.appendChild(
      createMiniButton("Undo New File", () => {
        clearPendingFile(kind);
        renderMediaEditor(kind, container, options);
      }),
    );
  }

  if (pending || previewSource) {
    actions.appendChild(
      createMiniButton("Clear Image", () => {
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
      label: "Full Name",
      value: person.fullName,
      onChange(value) {
        person.fullName = value;
      },
    }),
    createInputField({
      label: "Display Name",
      value: person.name,
      onChange(value) {
        person.name = value;
      },
    }),
    createInputField({
      label: "Father's Name",
      value: person.father,
      onChange(value) {
        person.father = value;
      },
    }),
    createInputField({
      label: "Mother's Name",
      value: person.mother,
      onChange(value) {
        person.mother = value;
      },
    }),
    createInputField({
      label: "Family Line Label",
      value: person.relationship,
      placeholder: "e.g. son, daughter",
      onChange(value) {
        person.relationship = value;
      },
    }),
    createInputField({
      label: "Personal Phone",
      value: person.phone,
      type: "tel",
      help: "The live page shows call and text icons instead of the raw phone number.",
      onChange(value) {
        person.phone = value;
      },
    }),
    createInputField({
      label: "Parents' Phone",
      value: person.parentPhone,
      type: "tel",
      help: "The live page shows call and text icons instead of the raw phone number.",
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
      label: "Year",
      value: invitation.ceremony.year,
      type: "number",
      min: 2000,
      onChange(value) {
        invitation.ceremony.year = value;
      },
    }),
    createInputField({
      label: "Month",
      value: invitation.ceremony.month,
      type: "number",
      min: 1,
      max: 12,
      onChange(value) {
        invitation.ceremony.month = value;
      },
    }),
    createInputField({
      label: "Day",
      value: invitation.ceremony.day,
      type: "number",
      min: 1,
      max: 31,
      onChange(value) {
        invitation.ceremony.day = value;
      },
    }),
    createSelectField({
      label: "AM / PM",
      value: invitation.ceremony.meridiem,
      options: [
        { value: "AM", label: "AM" },
        { value: "PM", label: "PM" },
      ],
      onChange(value) {
        invitation.ceremony.meridiem = value;
      },
    }),
    createInputField({
      label: "Hour",
      value: invitation.ceremony.hour,
      type: "number",
      min: 1,
      max: 12,
      onChange(value) {
        invitation.ceremony.hour = value;
      },
    }),
    createInputField({
      label: "Minute",
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
    label: "Ceremony Description",
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
      label: "Venue Name",
      value: invitation.venue.name,
      onChange(value) {
        invitation.venue.name = value;
      },
    }),
    createInputField({
      label: "Hall or Floor",
      value: invitation.venue.hall,
      onChange(value) {
        invitation.venue.hall = value;
      },
    }),
    createInputField({
      label: "Address",
      value: invitation.venue.address,
      onChange(value) {
        invitation.venue.address = value;
      },
    }),
    createTextareaField({
      label: "Venue Note",
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

  clearPendingFile("gallery", index);
  pendingFiles.gallery[index] = {
    file,
    previewUrl: URL.createObjectURL(file),
  };

  if (!trimText(invitation.gallery[index].alt)) {
    invitation.gallery[index].alt = `${trimText(invitation.gallery[index].title) || `Gallery ${index + 1}`} image`;
  }

  renderGalleryEditor();
  updateStatus("A new gallery image has been selected. Publish the page to push it live.");
  showToast("Gallery image selected");
}

function renderGalleryEditor() {
  clearNode(elements.galleryEditor);

  const wrapper = document.createElement("div");
  wrapper.className = "editor-list";

  invitation.gallery.forEach((item, index) => {
    const article = createItemCard(`Gallery Card ${index + 1}`, () => {
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
        label: "Card Title",
        value: item.title,
        onChange(value) {
          item.title = value;
        },
      }),
      createTextareaField({
        label: "Card Caption",
        value: item.caption,
        rows: 3,
        onChange(value) {
          item.caption = value;
        },
      }),
      createInputField({
        label: "Image Alt Text",
        value: item.alt,
        placeholder: "e.g. Wedding portrait by the window",
        onChange(value) {
          item.alt = value;
        },
      }),
    ]);

    const imageField = createFieldShell("Choose Image File");
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.addEventListener("change", (event) => {
      handleGalleryFileSelection(index, event);
    });
    imageField.appendChild(fileInput);
    imageField.appendChild(
      createHelpText("The live page shows these images in the carousel and full-screen swipe viewer."),
    );
    article.appendChild(imageField);

    const colors = document.createElement("div");
    colors.className = "editor-color-grid";
    appendFields(colors, [
      createColorField({
        label: "Background Color A",
        value: item.tones[0],
        onChange(value) {
          item.tones[0] = value;
        },
      }),
      createColorField({
        label: "Background Color B",
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
        createHelpText(`Selected file: ${pending.file.name} · not yet published to the live page.`),
      );
    } else if (item.image) {
      imageMeta.appendChild(createHelpText("A published image is currently connected."));
    } else {
      imageMeta.appendChild(createHelpText("No image is currently connected. The styled card treatment will be shown instead."));
    }

    const actions = document.createElement("div");
    actions.className = "editor-action-row";

    if (pending && pending.file) {
      actions.appendChild(
        createMiniButton("Undo New File", () => {
          clearPendingFile("gallery", index);
          renderGalleryEditor();
        }),
      );
    }

    if (pending || item.image) {
      actions.appendChild(
        createMiniButton("Clear Image", () => {
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
    createAddButton("Add Gallery Card", () => {
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
    const article = createItemCard(`Timeline ${index + 1}`, () => {
      invitation.timeline.splice(index, 1);
      renderTimelineEditor();
    });

    appendFields(article, [
      createInputField({
        label: "Step Label",
        value: item.step,
        onChange(value) {
          item.step = value;
        },
      }),
      createInputField({
        label: "Title",
        value: item.title,
        onChange(value) {
          item.title = value;
        },
      }),
      createTextareaField({
        label: "Description",
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
    createAddButton("Add Timeline Entry", () => {
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
  document.title = `${invitation.title} Editor`;
  renderBasicFields();
  renderMediaEditor("hero", elements.heroMediaEditor, {
    emptyText: "Add the main hero image here.",
    altLabel: "Hero Image Alt Text",
    statusLabel: "Hero image",
    wide: false,
  });
  renderPersonFields(elements.groomFields, invitation.groom);
  renderPersonFields(elements.brideFields, invitation.bride);
  renderCeremonyFields();
  renderVenueFields();
  renderGalleryEditor();
  renderTimelineEditor();
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
    updateStatus("Save failed. Please check whether this browser can access local storage.");
    showToast("Save failed");
    return;
  }

  const pendingCount = countPendingUploads();
  if (pendingCount > 0) {
    updateStatus(`Changes saved. ${pendingCount} new image file(s) remain local to this tab until you publish.`);
  } else {
    updateStatus("Changes saved. Refresh the invitation page to preview this browser draft.");
  }
  showToast("Changes saved");
}

function resetInvitation() {
  const confirmed = window.confirm("Clear the saved draft and return to the default sample content?");
  if (!confirmed) {
    return;
  }

  store.clearInvitation();
  clearAllPendingFiles();
  invitation = store.createDefaultInvitation();
  ensureDefaultRsvpEndpoint();
  rsvpResponses = [];
  renderAll();
  updateStatus("The default sample content has been restored.");
  updatePublishStatus("Ready to publish when you are.");
  updateRsvpManagerStatus("");
  showToast("Defaults restored");
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
  updateStatus("The current editor state has been exported as JSON.");
  showToast("JSON downloaded");
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
      updateStatus("The JSON file has been imported and saved.");
      showToast("JSON imported");
    } catch (error) {
      updateStatus("The JSON file could not be read. Make sure it is a valid exported invitation file.");
      showToast("Could not read the JSON file");
    }

    elements.importFileInput.value = "";
  };

  reader.readAsText(file, "utf-8");
}

async function publishInvitation() {
  const settings = persistPublishSettings();
  if (!settings.endpointUrl) {
    updatePublishStatus("Enter the publish endpoint URL.");
    showToast("Publish endpoint URL is required");
    return;
  }

  if (!settings.publishPassword) {
    updatePublishStatus("Enter the publish password.");
    showToast("Publish password is required");
    return;
  }

  ensureDefaultRsvpEndpoint();

  const saved = store.saveInvitation(invitation);
  invitation = store.cloneInvitation(saved.invitation);
  renderAll();

  setBusy(true);
  updatePublishStatus("Sending the publish request to the protected serverless endpoint.");

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

    updateStatus("Both the local draft and the published version have been updated.");
    updatePublishStatus(
      uploadedCount > 0
        ? `Published the invitation and ${uploadedCount} image file(s). GitHub Pages may take about 1 to 2 minutes to refresh.`
        : "Published the invitation content. GitHub Pages may take about 1 to 2 minutes to refresh.",
    );

    showToast("Live publish started");
  } catch (error) {
    updatePublishStatus(`Publish failed. ${error.message}`);
    showToast("Live publish failed");
  } finally {
    setBusy(false);
  }
}

async function reloadPublishedInvitation() {
  const confirmed = window.confirm("Replace the current draft with the latest published invitation?");
  if (!confirmed) {
    return;
  }

  setBusy(true);
  updatePublishStatus("Reloading the published invitation.");

  try {
    store.clearPublishedCache();
    const published = await store.fetchPublishedInvitation({ force: true });
    if (!published) {
      throw new Error("The published content.json file could not be found.");
    }

    clearAllPendingFiles();
    invitation = store.cloneInvitation(published);
    ensureDefaultRsvpEndpoint();
    store.saveInvitation(invitation);
    renderAll();
    updateStatus("The editor draft has been aligned to the published version.");
    updatePublishStatus("The published version has been reloaded.");
    showToast("Published version loaded");
  } catch (error) {
    updatePublishStatus(`Could not reload the published version. ${error.message}`);
    showToast("Could not reload the published version");
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
  if (elements.loadRsvpResponsesButton) {
    elements.loadRsvpResponsesButton.addEventListener("click", loadRsvpResponses);
  }
  if (elements.exportRsvpResponsesButton) {
    elements.exportRsvpResponsesButton.addEventListener("click", downloadRsvpCsv);
  }

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
      updateStatus("A saved draft from another tab has been reloaded.");
      return;
    }

    if (event.key === store.PUBLISH_SETTINGS_STORAGE_KEY) {
      hydratePublishSettings();
      updatePublishStatus("Publishing settings were updated in another tab.");
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
    updateStatus("A saved draft from this browser has been loaded.");
  } else {
    updateStatus("Loaded the published invitation or the default sample content.");
  }
  updatePublishStatus("Connect the serverless publish endpoint to update the live invitation.");
  updateRsvpManagerStatus("");
}

init();
