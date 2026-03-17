const PUBLISHED_CONTENT_PATH = "content.json";
const DEFAULT_COMMIT_MESSAGE = "모바일 청첩장 내용 업데이트";

export default {
  async fetch(request, env) {
    return handleRequest(request, env);
  },
};

function readBinding(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getAllowedOrigin(request, env) {
  const configuredOrigin = readBinding(env.ALLOWED_ORIGIN);
  const requestOrigin = readBinding(request.headers.get("Origin"));

  if (!configuredOrigin) {
    return requestOrigin || "*";
  }

  return requestOrigin === configuredOrigin ? configuredOrigin : "";
}

function buildCorsHeaders(request, env) {
  const origin = getAllowedOrigin(request, env);
  const headers = {
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    Vary: "Origin",
  };

  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

function buildJsonResponse(request, env, payload, status) {
  const headers = new Headers(buildCorsHeaders(request, env));
  headers.set("Cache-Control", "no-store");
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(JSON.stringify(payload, null, 2), {
    status: status || 200,
    headers,
  });
}

function ensureAllowedOrigin(request, env) {
  const configuredOrigin = readBinding(env.ALLOWED_ORIGIN);
  if (!configuredOrigin) {
    return true;
  }

  return readBinding(request.headers.get("Origin")) === configuredOrigin;
}

function getPublicSiteBaseUrl(env) {
  return readBinding(env.PUBLIC_SITE_BASE_URL).replace(/\/+$/u, "");
}

function getRequiredConfig(env) {
  return {
    githubOwner: readBinding(env.GITHUB_OWNER),
    githubRepo: readBinding(env.GITHUB_REPO),
    githubBranch: readBinding(env.GITHUB_BRANCH) || "main",
    githubToken: readBinding(env.GITHUB_TOKEN),
    publishPassword: readBinding(env.PUBLISH_PASSWORD),
    publicSiteBaseUrl: getPublicSiteBaseUrl(env),
  };
}

function assertConfig(config) {
  const missing = [];

  if (!config.githubOwner) {
    missing.push("GITHUB_OWNER");
  }
  if (!config.githubRepo) {
    missing.push("GITHUB_REPO");
  }
  if (!config.githubBranch) {
    missing.push("GITHUB_BRANCH");
  }
  if (!config.githubToken) {
    missing.push("GITHUB_TOKEN");
  }
  if (!config.publishPassword) {
    missing.push("PUBLISH_PASSWORD");
  }
  if (!config.publicSiteBaseUrl) {
    missing.push("PUBLIC_SITE_BASE_URL");
  }

  if (missing.length > 0) {
    throw new Error(`필수 서버 설정이 누락되었습니다: ${missing.join(", ")}`);
  }
}

function getBearerToken(request) {
  const authorization = request.headers.get("Authorization") || "";
  const matched = authorization.match(/^Bearer\s+(.+)$/iu);
  return matched ? matched[1].trim() : "";
}

function authorizeRequest(request, config) {
  const providedPassword = getBearerToken(request);
  return Boolean(providedPassword) && providedPassword === config.publishPassword;
}

function parseJsonBody(request) {
  return request.json().catch(() => {
    throw new Error("JSON 본문을 읽지 못했습니다.");
  });
}

function clone(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function sanitizeCommitMessage(value) {
  const trimmed = readBinding(value);
  return trimmed || DEFAULT_COMMIT_MESSAGE;
}

function getFileExtension(fileName, mimeType) {
  const matched = String(fileName || "").match(/\.([a-zA-Z0-9]+)$/u);
  if (matched) {
    return matched[1].toLowerCase();
  }

  switch (String(mimeType || "").toLowerCase()) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/heic":
      return "heic";
    case "image/heif":
      return "heif";
    default:
      return "jpg";
  }
}

function buildUploadPath(slot, fileName, mimeType) {
  const paddedSlot = String(slot).padStart(2, "0");
  return `uploads/gallery-${paddedSlot}.${getFileExtension(fileName, mimeType)}`;
}

function buildPublicAssetUrl(config, path, versionStamp) {
  return `${config.publicSiteBaseUrl}/${path}?v=${versionStamp}`;
}

function encodeTextAsBase64(text) {
  const bytes = new TextEncoder().encode(text);
  const chunkSize = 0x8000;
  let binary = "";

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

function encodeRepoPath(path) {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function buildGitHubHeaders(config) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${config.githubToken}`,
    "Content-Type": "application/json",
    "User-Agent": "mobile-wedding-invitation-site-publisher",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function parseGitHubError(response) {
  const clonedResponse = response.clone();
  const acceptedPermissions = response.headers.get("x-accepted-github-permissions");
  const requestId = response.headers.get("x-github-request-id");

  try {
    const payload = await response.json();
    const details = [];
    if (payload && payload.message) {
      details.push(payload.message);
    }
    if (acceptedPermissions) {
      details.push(`required permissions: ${acceptedPermissions}`);
    }
    if (requestId) {
      details.push(`request id: ${requestId}`);
    }
    if (details.length > 0) {
      return `${details.join(" / ")} (${response.status})`;
    }
  } catch (error) {
    const text = await clonedResponse.text().catch(() => "");
    const details = [];
    if (text) {
      details.push(text.slice(0, 300));
    }
    if (acceptedPermissions) {
      details.push(`required permissions: ${acceptedPermissions}`);
    }
    if (requestId) {
      details.push(`request id: ${requestId}`);
    }
    if (details.length > 0) {
      return `${details.join(" / ")} (${response.status})`;
    }
    return `GitHub API 요청에 실패했습니다. (${response.status})`;
  }

  const details = [];
  if (acceptedPermissions) {
    details.push(`required permissions: ${acceptedPermissions}`);
  }
  if (requestId) {
    details.push(`request id: ${requestId}`);
  }
  if (details.length > 0) {
    return `${details.join(" / ")} (${response.status})`;
  }
  return `GitHub API 요청에 실패했습니다. (${response.status})`;
}

async function getGitHubContentMeta(config, path) {
  const url =
    `https://api.github.com/repos/${encodeURIComponent(config.githubOwner)}` +
    `/${encodeURIComponent(config.githubRepo)}/contents/${encodeRepoPath(path)}` +
    `?ref=${encodeURIComponent(config.githubBranch)}`;

  const response = await fetch(url, {
    headers: buildGitHubHeaders(config),
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(await parseGitHubError(response));
  }

  return response.json();
}

async function upsertGitHubFile(config, path, contentBase64, message) {
  const existing = await getGitHubContentMeta(config, path);
  const url =
    `https://api.github.com/repos/${encodeURIComponent(config.githubOwner)}` +
    `/${encodeURIComponent(config.githubRepo)}/contents/${encodeRepoPath(path)}`;

  const body = {
    message,
    content: contentBase64,
    branch: config.githubBranch,
  };

  if (existing && existing.sha) {
    body.sha = existing.sha;
  }

  const response = await fetch(url, {
    method: "PUT",
    headers: buildGitHubHeaders(config),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await parseGitHubError(response));
  }

  return response.json();
}

function validatePublishPayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("발행 요청 본문이 비어 있습니다.");
  }

  if (!payload.content || typeof payload.content !== "object") {
    throw new Error("발행할 초대장 데이터가 없습니다.");
  }

  if (!Array.isArray(payload.images)) {
    throw new Error("업로드 이미지 배열 형식이 올바르지 않습니다.");
  }

  if (!Array.isArray(payload.content.gallery)) {
    throw new Error("초대장 갤러리 데이터 형식이 올바르지 않습니다.");
  }

  return {
    content: clone(payload.content),
    images: payload.images,
    commitMessage: sanitizeCommitMessage(payload.commitMessage),
  };
}

async function publishContent(config, payload) {
  const versionStamp = Date.now();
  const uploadedSlots = [];

  for (const image of payload.images) {
    const slot = Number(image && image.slot);
    const galleryIndex = Math.trunc(slot) - 1;

    if (!Number.isInteger(slot) || galleryIndex < 0 || galleryIndex >= payload.content.gallery.length) {
      throw new Error("업로드 이미지의 갤러리 순번이 올바르지 않습니다.");
    }

    if (!readBinding(image && image.contentBase64)) {
      throw new Error(`갤러리 ${slot}번 이미지 데이터가 비어 있습니다.`);
    }

    const path = buildUploadPath(slot, image.fileName, image.mimeType);
    await upsertGitHubFile(
      config,
      path,
      readBinding(image.contentBase64),
      `${payload.commitMessage} - 갤러리 ${slot}`,
    );

    payload.content.gallery[galleryIndex].image = buildPublicAssetUrl(config, path, versionStamp);
    if (!readBinding(payload.content.gallery[galleryIndex].alt)) {
      payload.content.gallery[galleryIndex].alt = `${readBinding(payload.content.gallery[galleryIndex].title) || `갤러리 ${slot}`} 이미지`;
    }
    uploadedSlots.push(slot);
  }

  const contentText = `${JSON.stringify(payload.content, null, 2)}\n`;
  const contentBase64 = encodeTextAsBase64(contentText);

  await upsertGitHubFile(config, PUBLISHED_CONTENT_PATH, contentBase64, payload.commitMessage);

  return {
    content: payload.content,
    uploadedSlots,
    publicSiteUrl: `${config.publicSiteBaseUrl}/`,
  };
}

async function handleRequest(request, env) {
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: ensureAllowedOrigin(request, env) ? 204 : 403,
      headers: buildCorsHeaders(request, env),
    });
  }

  if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/publish")) {
    return buildJsonResponse(
      request,
      env,
      {
        ok: true,
        service: "wedding-invitation-publisher",
        publicSiteUrl: `${getPublicSiteBaseUrl(env)}/`,
      },
      200,
    );
  }

  if (request.method !== "POST" || (url.pathname !== "/" && url.pathname !== "/publish")) {
    return buildJsonResponse(request, env, { ok: false, error: "지원하지 않는 경로입니다." }, 404);
  }

  if (!ensureAllowedOrigin(request, env)) {
    return buildJsonResponse(request, env, { ok: false, error: "허용되지 않은 Origin입니다." }, 403);
  }

  try {
    const config = getRequiredConfig(env);
    assertConfig(config);

    if (!authorizeRequest(request, config)) {
      return buildJsonResponse(request, env, { ok: false, error: "발행 비밀번호가 올바르지 않습니다." }, 401);
    }

    const payload = validatePublishPayload(await parseJsonBody(request));
    const result = await publishContent(config, payload);

    return buildJsonResponse(
      request,
      env,
      {
        ok: true,
        content: result.content,
        uploadedSlots: result.uploadedSlots,
        publicSiteUrl: result.publicSiteUrl,
      },
      200,
    );
  } catch (error) {
    return buildJsonResponse(
      request,
      env,
      {
        ok: false,
        error: error && error.message ? error.message : "발행 중 알 수 없는 오류가 발생했습니다.",
      },
      500,
    );
  }
}
