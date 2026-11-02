/* ============================================================
   ENCORE PHOTO LIBRARY: backend for /team/photos
   ------------------------------------------------------------
   One function, several actions, all under /team/api/photos/.
   The Team Hub edge gate (netlify/edge-functions/team-gate.js)
   covers /team/*, and this file checks the same cookie again,
   so nothing here answers without the team password.

   Where things live:
     - The catalog (one row per photo, with its show, year and
       tags) is a Google Sheet, tab "Photos". Staff can read it
       like any sheet. Tab "Sources" lists the Drive folders and
       SmugMug accounts to scan.
     - Photos themselves stay where they are (Drive, SmugMug).
       Nothing is copied. Drive thumbnails are fetched through
       this function with the service account, so they never
       need to be shared publicly.

   Netlify environment variables (Site configuration > Env vars):
     GOOGLE_SERVICE_ACCOUNT_KEY  service account JSON (raw or base64)
     PHOTO_LIBRARY_SHEET_ID      the catalog sheet's ID (from its URL)
     SMUGMUG_API_KEY             optional, for SmugMug galleries
     PROTECTED_PAGE_PASSWORD     already used by the Team Hub gate

   Actions:
     GET  status     what is configured
     GET  catalog    every photo row plus the sources list
     POST sources    replace the sources list
     POST sync       scan sources a page at a time (client loops)
     POST tags       add/remove tags, set show or year, on many photos
     POST autotags   store the auto-tagger's suggestions
     GET  thumb      a Drive thumbnail (?id=FILE_ID&s=400)
   ============================================================ */

import { createSign, createHash } from "node:crypto";

export const config = { path: "/team/api/photos/:action" };

const PHOTO_HEADERS = ["id", "source", "fileId", "name", "folder", "show", "year", "date", "tags", "autoTags", "thumb", "link", "added", "autoTagged"];
const SOURCE_HEADERS = ["type", "ref", "label", "lastSynced"];
const SYNC_BUDGET_MS = 6500; // stay well inside Netlify's 10 second limit
const G = "https://www.googleapis.com";

/* ---------- small helpers ---------- */

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

const splitTags = (s) =>
  String(s || "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

const joinTags = (arr) => [...new Set(arr.map((t) => String(t).trim().toLowerCase()).filter(Boolean))].join(", ");

const yearFrom = (...vals) => {
  for (const v of vals) {
    const m = String(v || "").match(/\b(19[89]\d|20\d\d)\b/);
    if (m) return m[1];
  }
  return "";
};

function cookieValue(req, name) {
  const raw = req.headers.get("cookie") || "";
  for (const part of raw.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

async function signedIn(req) {
  const pw = process.env.PROTECTED_PAGE_PASSWORD;
  if (!pw) return false;
  const expected = createHash("sha256").update("encore-team::" + pw).digest("hex");
  return cookieValue(req, "team_auth") === expected;
}

/* ---------- Google auth (service account, no libraries) ---------- */

let tokenCache = { value: null, exp: 0 };

function serviceAccount() {
  let raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) return null;
  raw = raw.trim();
  if (!raw.startsWith("{")) raw = Buffer.from(raw, "base64").toString("utf8");
  const sa = JSON.parse(raw);
  sa.private_key = String(sa.private_key || "").replace(/\\n/g, "\n");
  return sa;
}

async function googleToken() {
  if (tokenCache.value && Date.now() < tokenCache.exp - 60000) return tokenCache.value;
  const sa = serviceAccount();
  if (!sa) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY is not set");
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned =
    b64({ alg: "RS256", typ: "JWT" }) +
    "." +
    b64({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/spreadsheets",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    });
  const sig = createSign("RSA-SHA256").update(unsigned).sign(sa.private_key).toString("base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: unsigned + "." + sig }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Google sign-in failed: " + (data.error_description || data.error || res.status));
  tokenCache = { value: data.access_token, exp: Date.now() + data.expires_in * 1000 };
  return tokenCache.value;
}

async function gfetch(url, opts = {}) {
  const token = await googleToken();
  const res = await fetch(url, {
    ...opts,
    headers: { authorization: "Bearer " + token, "content-type": "application/json", ...(opts.headers || {}) },
  });
  if (!res.ok) {
    let msg = res.status + "";
    try {
      const e = await res.json();
      msg = e.error?.message || msg;
    } catch {}
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return res;
}

/* ---------- Sheet storage ---------- */

const SHEET = () => process.env.PHOTO_LIBRARY_SHEET_ID;
const sheetUrl = (path) => `https://sheets.googleapis.com/v4/spreadsheets/${SHEET()}${path}`;

async function ensureTabs() {
  const meta = await (await gfetch(sheetUrl("?fields=sheets.properties.title"))).json();
  const have = new Set((meta.sheets || []).map((s) => s.properties.title));
  const add = ["Photos", "Sources"].filter((t) => !have.has(t));
  if (add.length) {
    await gfetch(sheetUrl(":batchUpdate"), {
      method: "POST",
      body: JSON.stringify({ requests: add.map((title) => ({ addSheet: { properties: { title } } })) }),
    });
  }
  // Header rows (rewritten every time, harmless and self-healing)
  await gfetch(sheetUrl("/values:batchUpdate"), {
    method: "POST",
    body: JSON.stringify({
      valueInputOption: "RAW",
      data: [
        { range: "Photos!A1:N1", values: [PHOTO_HEADERS] },
        { range: "Sources!A1:D1", values: [SOURCE_HEADERS] },
      ],
    }),
  });
}

async function readTab(name, lastCol) {
  const res = await gfetch(sheetUrl(`/values/${encodeURIComponent(name + "!A2:" + lastCol)}?majorDimension=ROWS`));
  return (await res.json()).values || [];
}

function rowToPhoto(r, i) {
  const o = { row: i + 2 };
  PHOTO_HEADERS.forEach((h, k) => (o[h] = r[k] ?? ""));
  return o;
}

const photoToRow = (p) => PHOTO_HEADERS.map((h) => (p[h] == null ? "" : String(p[h])));

async function loadPhotos() {
  return (await readTab("Photos", "N")).map(rowToPhoto).filter((p) => p.id);
}

async function loadSources() {
  return (await readTab("Sources", "D"))
    .map((r, i) => ({ row: i + 2, type: (r[0] || "").trim().toLowerCase(), ref: (r[1] || "").trim(), label: (r[2] || "").trim(), lastSynced: r[3] || "" }))
    .filter((s) => s.type && s.ref);
}

async function appendPhotos(list) {
  if (!list.length) return;
  await gfetch(sheetUrl(`/values/${encodeURIComponent("Photos!A:N")}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`), {
    method: "POST",
    body: JSON.stringify({ values: list.map(photoToRow) }),
  });
}

async function writeRows(list) {
  if (!list.length) return;
  await gfetch(sheetUrl("/values:batchUpdate"), {
    method: "POST",
    body: JSON.stringify({
      valueInputOption: "RAW",
      data: list.map((p) => ({ range: `Photos!A${p.row}:N${p.row}`, values: [photoToRow(p)] })),
    }),
  });
}

/* ---------- Source parsing ---------- */

// Accepts a bare folder ID or any Drive folder link.
function driveFolderId(ref) {
  const m = String(ref).match(/folders\/([\w-]{10,})/) || String(ref).match(/[?&]id=([\w-]{10,})/);
  if (m) return m[1];
  return /^[\w-]{10,}$/.test(ref) ? ref : null;
}

// Accepts a nickname or a nickname.smugmug.com link.
function smugNick(ref) {
  const m = String(ref).match(/^(?:https?:\/\/)?([\w-]+)\.smugmug\.com/i);
  return m ? m[1] : String(ref).trim().replace(/^@/, "");
}

/* ---------- Sync: Drive ---------- */

async function driveFolderName(id) {
  const res = await gfetch(`${G}/drive/v3/files/${id}?fields=name&supportsAllDrives=true`);
  return (await res.json()).name || "Drive folder";
}

async function syncDrivePage(item, known, out, queue) {
  const q = `'${item.folderId}' in parents and trashed=false and (mimeType contains 'image/' or mimeType='application/vnd.google-apps.folder')`;
  const params = new URLSearchParams({
    q,
    pageSize: "500",
    fields: "nextPageToken,files(id,name,mimeType,createdTime,imageMediaMetadata(time),webViewLink)",
    supportsAllDrives: "true",
    includeItemsFromAllDrives: "true",
    corpora: "allDrives",
  });
  if (item.pageToken) params.set("pageToken", item.pageToken);
  const data = await (await gfetch(`${G}/drive/v3/files?${params}`)).json();

  for (const f of data.files || []) {
    if (f.mimeType === "application/vnd.google-apps.folder") {
      queue.push({ kind: "drive", folderId: f.id, root: item.root, path: [...item.path, f.name], label: item.label });
      continue;
    }
    const id = "d:" + f.id;
    if (known.has(id)) continue;
    known.add(id);
    const folder = [item.root, ...item.path].join(" / ");
    out.push({
      id,
      source: "drive",
      fileId: f.id,
      name: f.name,
      folder,
      show: item.label || item.path[0] || item.root,
      year: yearFrom(folder, f.imageMediaMetadata?.time, f.createdTime),
      date: (f.imageMediaMetadata?.time || f.createdTime || "").replace(/^(\d{4}):(\d\d):(\d\d)/, "$1-$2-$3").slice(0, 10),
      tags: "",
      autoTags: "",
      thumb: "",
      link: f.webViewLink || `https://drive.google.com/file/d/${f.id}/view`,
      added: new Date().toISOString().slice(0, 10),
      autoTagged: "",
    });
  }
  if (data.nextPageToken) queue.push({ ...item, pageToken: data.nextPageToken });
}

/* ---------- Sync: SmugMug (public galleries, API key only) ---------- */

async function smug(path, start) {
  const key = process.env.SMUGMUG_API_KEY;
  if (!key) throw new Error("SMUGMUG_API_KEY is not set");
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`https://api.smugmug.com${path}${sep}APIKey=${encodeURIComponent(key)}&start=${start}&count=100`, {
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error("SmugMug said " + res.status + " for " + path.split("?")[0]);
  return (await res.json()).Response || {};
}

async function syncSmugPage(item, known, out, queue) {
  const start = item.start || 1;
  if (item.kind === "smug-user") {
    const r = await smug(`/api/v2/user/${encodeURIComponent(item.nick)}!albums`, start);
    for (const a of r.Album || []) {
      queue.push({ kind: "smug-album", albumKey: a.AlbumKey, name: a.Name || a.Title || a.UrlName || "SmugMug album", path: a.UrlPath || "", label: item.label, start: 1 });
    }
    if (r.Pages?.NextPage) queue.push({ ...item, start: start + 100 });
    return;
  }
  const r = await smug(`/api/v2/album/${encodeURIComponent(item.albumKey)}!images`, start);
  for (const im of r.AlbumImage || []) {
    if (im.IsVideo) continue;
    const id = "s:" + im.ImageKey;
    if (known.has(id)) continue;
    known.add(id);
    const kw = Array.isArray(im.KeywordArray) ? im.KeywordArray : splitTags(String(im.Keywords || "").replace(/;/g, ","));
    out.push({
      id,
      source: "smugmug",
      fileId: im.ImageKey,
      name: im.FileName || im.Title || im.ImageKey,
      folder: "SmugMug / " + item.name,
      show: item.label || item.name,
      year: yearFrom(item.name, item.path, im.DateTimeOriginal, im.Date),
      date: String(im.DateTimeOriginal || im.Date || "").slice(0, 10),
      tags: joinTags(kw),
      autoTags: "",
      thumb: im.ThumbnailUrl || "",
      link: im.WebUri || "",
      added: new Date().toISOString().slice(0, 10),
      autoTagged: "",
    });
  }
  if (r.Pages?.NextPage) queue.push({ ...item, start: start + 100 });
}

/* ---------- Actions ---------- */

async function actionSync(body) {
  const started = Date.now();
  const log = [];
  let state = body.state;

  if (!state) {
    const sources = await loadSources();
    if (!sources.length) return { ok: false, error: "No sources yet. Add a Drive folder or SmugMug account in Setup." };
    const queue = [];
    for (const s of sources) {
      if (s.type === "drive") {
        const id = driveFolderId(s.ref);
        if (!id) {
          log.push(`Skipped "${s.ref}": not a Drive folder link.`);
          continue;
        }
        try {
          queue.push({ kind: "drive", folderId: id, root: await driveFolderName(id), path: [], label: s.label });
        } catch (e) {
          log.push(`Can't open Drive folder ${id} (${e.message}). Share it with the service account.`);
        }
      } else if (s.type === "smugmug") {
        queue.push({ kind: "smug-user", nick: smugNick(s.ref), label: s.label, start: 1 });
      } else {
        log.push(`Skipped source type "${s.type}".`);
      }
    }
    state = { queue, scanned: 0 };
  }

  const known = new Set((await readTab("Photos", "A")).map((r) => r[0]).filter(Boolean));
  const added = [];
  while (state.queue.length && Date.now() - started < SYNC_BUDGET_MS) {
    const item = state.queue.shift();
    try {
      if (item.kind === "drive") await syncDrivePage(item, known, added, state.queue);
      else await syncSmugPage(item, known, added, state.queue);
      state.scanned++;
    } catch (e) {
      log.push(`Skipped ${item.kind === "drive" ? "a Drive folder" : "a SmugMug page"}: ${e.message}`);
    }
  }
  await appendPhotos(added);

  const done = state.queue.length === 0;
  if (done) {
    const sources = await loadSources();
    const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
    if (sources.length) {
      await gfetch(sheetUrl("/values:batchUpdate"), {
        method: "POST",
        body: JSON.stringify({ valueInputOption: "RAW", data: sources.map((s) => ({ range: `Sources!D${s.row}`, values: [[stamp]] })) }),
      });
    }
  }
  return { ok: true, added, log, done, state: done ? null : state, remaining: state.queue.length };
}

async function actionTags(body) {
  const ids = new Set(body.ids || []);
  if (!ids.size) return { ok: false, error: "No photos selected." };
  const add = splitTags((body.add || []).join(","));
  const remove = new Set(splitTags((body.remove || []).join(",")));
  const photos = await loadPhotos();
  const changed = [];
  for (const p of photos) {
    if (!ids.has(p.id)) continue;
    const tags = splitTags(p.tags).filter((t) => !remove.has(t)).concat(add);
    const auto = splitTags(p.autoTags).filter((t) => !remove.has(t));
    p.tags = joinTags(tags);
    p.autoTags = joinTags(auto.filter((t) => !tags.includes(t)));
    if (typeof body.show === "string") p.show = body.show.trim();
    if (typeof body.year === "string") p.year = body.year.trim();
    changed.push(p);
  }
  await writeRows(changed);
  return { ok: true, updated: changed };
}

async function actionAutotags(body) {
  const map = new Map((body.updates || []).map((u) => [u.id, u.tags || []]));
  const photos = await loadPhotos();
  const changed = [];
  for (const p of photos) {
    if (!map.has(p.id)) continue;
    const manual = splitTags(p.tags);
    p.autoTags = joinTags(splitTags(map.get(p.id).join(",")).filter((t) => !manual.includes(t)));
    p.autoTagged = "1";
    changed.push(p);
  }
  await writeRows(changed);
  return { ok: true, updated: changed };
}

async function actionSources(body) {
  const rows = (body.sources || [])
    .map((s) => [String(s.type || "").toLowerCase(), String(s.ref || "").trim(), String(s.label || "").trim(), String(s.lastSynced || "")])
    .filter((r) => (r[0] === "drive" || r[0] === "smugmug") && r[1]);
  await gfetch(sheetUrl(`/values/${encodeURIComponent("Sources!A2:D1000")}:clear`), { method: "POST", body: "{}" });
  if (rows.length) {
    await gfetch(sheetUrl(`/values/${encodeURIComponent("Sources!A2:D" + (rows.length + 1))}?valueInputOption=RAW`), {
      method: "PUT",
      body: JSON.stringify({ values: rows }),
    });
  }
  return { ok: true, sources: await loadSources() };
}

async function actionThumb(url) {
  const id = url.searchParams.get("id") || "";
  if (!/^[\w-]{10,}$/.test(id)) return new Response("bad id", { status: 400 });
  const size = Math.min(1600, Math.max(100, parseInt(url.searchParams.get("s") || "400", 10) || 400));
  const meta = await (await gfetch(`${G}/drive/v3/files/${id}?fields=thumbnailLink&supportsAllDrives=true`)).json();
  if (!meta.thumbnailLink) return new Response("no thumbnail yet", { status: 404 });
  const link = meta.thumbnailLink.replace(/=s\d+$/, "=s" + size);
  const token = await googleToken();
  let img = await fetch(link, { headers: { authorization: "Bearer " + token } });
  if (!img.ok) img = await fetch(link); // some thumbnail hosts reject the header
  if (!img.ok) return new Response("thumbnail failed", { status: 502 });
  return new Response(await img.arrayBuffer(), {
    status: 200,
    headers: {
      "content-type": img.headers.get("content-type") || "image/jpeg",
      "cache-control": "private, max-age=604800",
    },
  });
}

/* ---------- Entry point ---------- */

export default async (req, context) => {
  if (!process.env.PROTECTED_PAGE_PASSWORD) return json({ ok: false, error: "Team password is not configured." }, 503);
  if (!(await signedIn(req))) return json({ ok: false, error: "signed-out" }, 401);

  const url = new URL(req.url);
  const action = context?.params?.action || url.pathname.split("/").pop();

  const configured = {
    google: !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
    sheet: !!SHEET(),
    smugmug: !!process.env.SMUGMUG_API_KEY,
  };

  try {
    if (action === "status") {
      let serviceEmail = "";
      try {
        serviceEmail = serviceAccount()?.client_email || "";
      } catch {}
      return json({ ok: true, configured, serviceEmail, sheetUrl: SHEET() ? `https://docs.google.com/spreadsheets/d/${SHEET()}/edit` : "" });
    }
    if (!configured.google || !configured.sheet) {
      return json({ ok: false, error: "not-configured", configured }, 503);
    }
    if (action === "thumb" && req.method === "GET") return await actionThumb(url);

    if (action === "catalog" && req.method === "GET") {
      await ensureTabs();
      const [photos, sources] = await Promise.all([loadPhotos(), loadSources()]);
      return json({ ok: true, photos, sources });
    }

    if (req.method !== "POST") return json({ ok: false, error: "Use POST." }, 405);
    const body = await req.json().catch(() => ({}));
    if (action === "sync") return json(await actionSync(body));
    if (action === "tags") return json(await actionTags(body));
    if (action === "autotags") return json(await actionAutotags(body));
    if (action === "sources") {
      await ensureTabs();
      return json(await actionSources(body));
    }
    return json({ ok: false, error: "Unknown action." }, 404);
  } catch (e) {
    return json({ ok: false, error: e.message || String(e) }, e.status === 403 || e.status === 404 ? 502 : 500);
  }
};
