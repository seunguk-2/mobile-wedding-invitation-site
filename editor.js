"use strict";

const store = window.WeddingInvitationStore;
let invitation = store.cloneInvitation();
let toastTimer = 0;

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

function createFieldShell(labelText) {
  const wrapper = document.createElement("label");
  wrapper.className = "field";

  const label = document.createElement("span");
  label.textContent = labelText;
  wrapper.appendChild(label);

  return wrapper;
}

function createInputField(spec) {
  const wrapper = createFieldShell(spec.label);
  const input = document.createElement("input");
  input.type = spec.type || "text";
  input.value = spec.value == null ? "" : String(spec.value);
  input.placeholder = spec.placeholder || "";

  if (spec.min != null) {
    input.min = String(spec.min);
  }
  if (spec.max != null) {
    input.max = String(spec.max);
  }
  if (spec.step != null) {
    input.step = String(spec.step);
  }

  input.addEventListener("input", (event) => {
    spec.onChange(event.target.value);
  });

  wrapper.appendChild(input);
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

function renderGalleryEditor() {
  clearNode(elements.galleryEditor);

  const wrapper = document.createElement("div");
  wrapper.className = "editor-list";

  invitation.gallery.forEach((item, index) => {
    const article = createItemCard(`갤러리 카드 ${index + 1}`, () => {
      invitation.gallery.splice(index, 1);
      renderGalleryEditor();
    });

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
    ]);

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
      });
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

      head.append(title, createMiniButton("삭제", () => {
        group.entries.splice(entryIndex, 1);
        renderAccountsEditor();
      }));

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

  updateStatus("편집 내용을 저장했습니다. 초대장 페이지를 새로고침하면 반영됩니다.");
  showToast("편집 내용을 저장했습니다");
}

function resetInvitation() {
  const confirmed = window.confirm("저장된 편집값을 지우고 기본 예시값으로 되돌릴까요?");
  if (!confirmed) {
    return;
  }

  store.clearInvitation();
  invitation = store.createDefaultInvitation();
  renderAll();
  updateStatus("기본 예시값으로 복원했습니다.");
  showToast("기본값으로 복원했습니다");
}

function downloadJsonFile() {
  const json = store.exportInvitation(invitation);
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

function bindEvents() {
  elements.saveInvitationButton.addEventListener("click", saveInvitation);
  elements.resetInvitationButton.addEventListener("click", resetInvitation);
  elements.exportInvitationButton.addEventListener("click", downloadJsonFile);
  elements.importInvitationButton.addEventListener("click", () => {
    elements.importFileInput.click();
  });
  elements.importFileInput.addEventListener("change", importJsonFile);

  window.addEventListener("storage", (event) => {
    if (event.key === store.CONTENT_STORAGE_KEY) {
      invitation = store.cloneInvitation();
      renderAll();
      updateStatus("다른 탭에서 저장된 편집값을 다시 불러왔습니다.");
    }
  });
}

function init() {
  renderAll();
  bindEvents();

  if (store.hasSavedInvitation()) {
    updateStatus("저장된 편집값을 불러왔습니다.");
  } else {
    updateStatus("기본 예시값을 불러왔습니다.");
  }
}

init();
