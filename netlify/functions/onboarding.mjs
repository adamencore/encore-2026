/*
  netlify/functions/onboarding.mjs
  Served at /onboarding/api/*, inside the onboarding gate.

  Stores contractor onboarding responses and child safety training results in a
  private Google Sheet. Same service account pattern as the Photo Library, so
  there is no third party form widget in the loop and nothing is stored in this
  public repo.

  Environment variables (Netlify > Site configuration > Environment variables):
    GOOGLE_SERVICE_ACCOUNT_KEY  service account JSON (raw or base64). Already set
                                for the Photo Library, reused here.
    ONBOARDING_SHEET_ID         the response sheet. Must be shared with the
                                service account's client_email as an Editor.
    ONBOARDING_PASSWORD         the portal access code. Falls back to
                                PROTECTED_PAGE_PASSWORD if unset.

  What this deliberately does NOT store: taxpayer IDs, Social Security numbers,
  and bank or routing numbers. Those belong in QuickBooks only, which is what the
  onboarding packet tells contractors. Free text fields are screened and a
  submission carrying something that looks like one is refused with an
  explanation rather than written to the sheet.
*/

import { createHash, createSign } from "node:crypto";

/* ---------- auth: recheck the onboarding cookie ourselves ---------- */

function cookieValue(req, name) {
  const raw = req.headers.get("cookie") || "";
  for (const part of raw.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

function signedIn(req) {
  const pw = process.env.ONBOARDING_PASSWORD || process.env.PROTECTED_PAGE_PASSWORD;
  if (!pw) return false;
  const expected = createHash("sha256").update("encore-onboarding::" + pw).digest("hex");
  return cookieValue(req, "onboarding_auth") === expected;
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
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    });
  const sig = createSign("RSA-SHA256").update(unsigned).sign(sa.private_key).toString("base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: unsigned + "." + sig,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error("Google sign-in failed: " + (data.error_description || data.error || res.status));
  }
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
    let msg = String(res.status);
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

/* ---------- sheet storage ---------- */

const SHEET = () => process.env.ONBOARDING_SHEET_ID;
const sheetUrl = (path) => `https://sheets.googleapis.com/v4/spreadsheets/${SHEET()}${path}`;

const ONBOARDING_TAB = "Onboarding";
const TRAINING_TAB = "Training";
const ONB_LAST_COL = "AF";

const ONBOARDING_HEADERS = [
  "Updated", "Status", "Path", "Legal name", "Preferred name", "Pronouns",
  "Email", "Phone", "Role", "Production",
  "Emergency contact", "Emergency relationship", "Emergency phone",
  "Allergies", "Dietary needs", "Accessibility needs", "Shirt size",
  "Availability conflicts", "Anything else", "Bio",
  "Mission read", "Ten Agreements agreed", "Photo release agreed",
  "QuickBooks and W-9", "Contract signed",
  "Background check", "Background check date",
  "Insurance required", "Insurance sent",
  "Training score", "Training passed", "Training completed",
];

const TRAINING_HEADERS = [
  "Completed", "Name", "Role", "Email", "Score", "Total", "Percent",
  "Passed", "Version", "Per question",
];

async function ensureTabs() {
  const meta = await (await gfetch(sheetUrl("?fields=sheets.properties.title"))).json();
  const have = new Set((meta.sheets || []).map((s) => s.properties.title));
  const add = [ONBOARDING_TAB, TRAINING_TAB]
    .filter((t) => !have.has(t))
    .map((title) => ({ addSheet: { properties: { title } } }));
  if (add.length) {
    await gfetch(sheetUrl(":batchUpdate"), { method: "POST", body: JSON.stringify({ requests: add }) });
    await gfetch(sheetUrl("/values:batchUpdate"), {
      method: "POST",
      body: JSON.stringify({
        valueInputOption: "RAW",
        data: [
          { range: `${ONBOARDING_TAB}!A1:${ONB_LAST_COL}1`, values: [ONBOARDING_HEADERS] },
          { range: `${TRAINING_TAB}!A1:J1`, values: [TRAINING_HEADERS] },
        ],
      }),
    });
  }
}

/* ---------- field handling ---------- */

const MAX_FIELD = 2000;

function clean(v) {
  if (v === undefined || v === null) return "";
  if (typeof v === "boolean") return v ? "Yes" : "";
  return String(v).replace(/\s+/g, " ").trim().slice(0, MAX_FIELD);
}

// Free text the contractor types. Screened below.
const FREE_TEXT = ["allergies", "dietary", "accessibility", "conflicts", "anything", "bio"];

const SSN_SHAPE = /\b\d{3}[-\s]\d{2}[-\s]\d{4}\b/;
const LONG_RUN = /\b\d{9,}\b/;
const NAMED = /\b(social security|ssn|taxpayer id|tax id|routing number|account number|bank account|card number)\b/i;

function sensitiveField(body) {
  for (const k of FREE_TEXT) {
    const v = String(body[k] || "");
    if (SSN_SHAPE.test(v) || LONG_RUN.test(v) || NAMED.test(v)) return k;
  }
  return null;
}

function toRow(b, existing) {
  const keep = (i, v) => (v !== "" ? v : existing ? existing[i] || "" : "");
  const r = [
    new Date().toISOString(),
    clean(b.status) || "In progress",
    clean(b.path) || "New",
    clean(b.legalName), clean(b.preferredName), clean(b.pronouns),
    clean(b.email).toLowerCase(), clean(b.phone), clean(b.role), clean(b.production),
    clean(b.emergencyName), clean(b.emergencyRelationship), clean(b.emergencyPhone),
    clean(b.allergies), clean(b.dietary), clean(b.accessibility), clean(b.shirt),
    clean(b.conflicts), clean(b.anything), clean(b.bio),
    clean(b.missionRead), clean(b.agreementsAgreed), clean(b.photoRelease),
    clean(b.quickbooks), clean(b.contract),
    clean(b.background), clean(b.backgroundDate),
    clean(b.insuranceRequired), clean(b.insuranceSent),
    clean(b.trainingScore), clean(b.trainingPassed), clean(b.trainingCompleted),
  ];
  // A later partial save must never blank a field an earlier save filled in.
  // Column 0 (Updated) always moves; columns 1 and 2 always carry a default.
  return r.map((v, i) => (i <= 2 ? v : keep(i, v)));
}

async function readOnboarding() {
  const res = await gfetch(
    sheetUrl(`/values/${encodeURIComponent(`${ONBOARDING_TAB}!A2:${ONB_LAST_COL}`)}?majorDimension=ROWS`)
  );
  return (await res.json()).values || [];
}

const EMAIL_COL = 6; // zero based, matches ONBOARDING_HEADERS

async function upsert(body) {
  await ensureTabs();
  const email = clean(body.email).toLowerCase();
  if (!email) throw Object.assign(new Error("An email address is required"), { status: 400 });

  const rows = await readOnboarding();
  const idx = rows.findIndex((r) => String(r[EMAIL_COL] || "").toLowerCase() === email);

  if (idx === -1) {
    await gfetch(
      sheetUrl(`/values/${encodeURIComponent(`${ONBOARDING_TAB}!A:${ONB_LAST_COL}`)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`),
      { method: "POST", body: JSON.stringify({ values: [toRow(body, null)] }) }
    );
    return { created: true };
  }
  const rowNumber = idx + 2; // header is row 1
  await gfetch(sheetUrl("/values:batchUpdate"), {
    method: "POST",
    body: JSON.stringify({
      valueInputOption: "RAW",
      data: [{
        range: `${ONBOARDING_TAB}!A${rowNumber}:${ONB_LAST_COL}${rowNumber}`,
        values: [toRow(body, rows[idx])],
      }],
    }),
  });
  return { created: false, row: rowNumber };
}

async function recordTraining(body) {
  await ensureTabs();
  const perQuestion = Array.isArray(body.answers)
    ? body.answers.map((a, i) => `${i + 1}:${a && a.correct ? "Y" : "N"}`).join(" ")
    : "";
  await gfetch(
    sheetUrl(`/values/${encodeURIComponent(`${TRAINING_TAB}!A:J`)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`),
    {
      method: "POST",
      body: JSON.stringify({
        values: [[
          clean(body.completedAt) || new Date().toISOString(),
          clean(body.name), clean(body.role), clean(body.email).toLowerCase(),
          clean(body.score), clean(body.total), clean(body.percent),
          body.passed ? "PASS" : "FAIL",
          clean(body.version), perQuestion,
        ]],
      }),
    }
  );
  // Mirror the result onto the contractor's onboarding row when we can match them.
  if (clean(body.email)) {
    try {
      await upsert({
        email: body.email,
        trainingScore: `${clean(body.score)}/${clean(body.total)}`,
        trainingPassed: body.passed ? "PASS" : "FAIL",
        trainingCompleted: clean(body.completedAt) || new Date().toISOString(),
      });
    } catch { /* the Training tab row is the record of truth, so this is best effort */ }
  }
  return { ok: true };
}

/* ---------- handler ---------- */

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

export default async (request) => {
  const url = new URL(request.url);
  const action = url.pathname.split("/").filter(Boolean).pop();

  if (!signedIn(request)) return json({ ok: false, error: "signed-out" }, 401);

  if (action === "ping") {
    return json({
      ok: true,
      sheetConfigured: Boolean(SHEET()),
      serviceAccountConfigured: Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
      separatePasswordSet: Boolean(process.env.ONBOARDING_PASSWORD),
    });
  }

  if (request.method !== "POST") return json({ ok: false, error: "method-not-allowed" }, 405);
  if (!SHEET()) return json({ ok: false, error: "ONBOARDING_SHEET_ID is not set in Netlify" }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "bad-json" }, 400);
  }

  try {
    if (action === "save") {
      const bad = sensitiveField(body);
      if (bad) {
        return json({
          ok: false,
          error: "sensitive",
          field: bad,
          message:
            "That looks like a Social Security number, taxpayer ID or bank account number. Encore does not collect those here. Enter them in QuickBooks instead, then clear that box and save again.",
        }, 422);
      }
      return json({ ok: true, ...(await upsert(body)) });
    }
    if (action === "training") {
      return json({ ok: true, ...(await recordTraining(body)) });
    }
    return json({ ok: false, error: "unknown-action" }, 404);
  } catch (e) {
    return json({ ok: false, error: e.message || "failed" }, e.status || 500);
  }
};

export const config = { path: "/onboarding/api/:action" };
