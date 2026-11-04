// netlify/edge-functions/onboarding-gate.js
// Server-side password gate for the contractor onboarding portal (/onboarding/*).
//
// This is deliberately a SEPARATE gate from the Team Hub, with its own password
// and its own cookie.
//
// Why: a brand new contractor needs access on day one, before their background
// check has cleared. The Team Hub password also unlocks /team/photos, which is a
// searchable library of photographs of Young Artists. Handing that to someone who
// has not been screened yet is exactly what the onboarding packet exists to
// prevent, so onboarding gets its own key.
//
// Set ONBOARDING_PASSWORD in Netlify (Site configuration > Environment variables).
// Until that is set, this falls back to PROTECTED_PAGE_PASSWORD so the portal can
// be tested, and says so on the sign-in screen. Set the separate password before
// sending the link to anyone outside the team.

const COOKIE = "onboarding_auth";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 days: onboarding is done over several sittings

async function token(pw) {
  const data = new TextEncoder().encode("encore-onboarding::" + pw);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function loginPage(showError, usingFallback) {
  const err = showError
    ? `<p class="err">That code did not match. Try again, or ask Kristen for the current one.</p>`
    : "";
  const note = usingFallback
    ? `<p class="note">Admin note: ONBOARDING_PASSWORD is not set yet, so this is accepting the Team Hub password. Set a separate one in Netlify before sending this link to a new contractor.</p>`
    : "";
  const html = `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Encore Onboarding · Sign in</title>
<link rel="stylesheet" href="/fonts/mikado.css">
<style>
  :root{--guava:#1a404a;--guava-deep:#142f37;--berry:#338093;--cream:#faf7f2;--muted:#5a6b72;--line:rgba(26,64,74,.18);--coral:#c0564f}
  *{margin:0;box-sizing:border-box}
  body{min-height:100vh;display:grid;place-items:center;background:radial-gradient(120% 120% at 30% 0%,var(--guava),var(--guava-deep) 62%);font-family:'Mikado',system-ui,-apple-system,sans-serif;color:var(--guava);padding:24px}
  .card{background:var(--cream);border-radius:20px;max-width:430px;width:100%;padding:38px 32px;box-shadow:0 30px 70px -30px rgba(0,0,0,.6);text-align:center}
  .badge{font-family:'Mikado',sans-serif;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--berry)}
  h1{font-weight:500;font-size:28px;margin:8px 0 8px;color:var(--guava)}
  p{color:var(--muted);font-size:14.5px;line-height:1.55}
  form{margin-top:22px;display:flex;flex-direction:column;gap:12px}
  input{font:inherit;padding:13px 15px;border:1px solid var(--line);border-radius:12px;background:#fff;color:var(--guava)}
  input:focus{outline:2px solid var(--berry);border-color:transparent}
  button{font-family:'Mikado',sans-serif;font-weight:600;font-size:15px;padding:13px;border:0;border-radius:12px;background:var(--guava);color:#fff;cursor:pointer}
  button:hover{background:var(--berry)}
  .err{color:var(--coral);font-size:13.5px;margin-top:12px;font-weight:600}
  .note{margin-top:18px;padding:12px 14px;border:1px dashed var(--berry);border-radius:12px;font-size:12.5px;color:var(--guava);text-align:left;line-height:1.5}
</style></head><body>
  <div class="card">
    <span class="badge">Encore Performing Arts</span>
    <h1>Welcome aboard</h1>
    <p>This is the contractor onboarding portal. Enter the access code Kristen sent you to get started.</p>
    <form method="POST" autocomplete="off">
      <input type="password" name="password" placeholder="Access code" aria-label="Access code" required autofocus>
      <button type="submit">Start onboarding</button>
    </form>
    ${err}
    ${note}
  </div>
</body></html>`;
  return new Response(html, {
    status: showError ? 401 : 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

export default async (request, context) => {
  const url = new URL(request.url);
  const own = Netlify.env.get("ONBOARDING_PASSWORD");
  const PASSWORD = own || Netlify.env.get("PROTECTED_PAGE_PASSWORD");
  const usingFallback = !own;

  if (!PASSWORD) {
    return new Response(
      "Onboarding is not configured yet. An admin needs to set ONBOARDING_PASSWORD in Netlify (Site configuration > Environment variables).",
      { status: 503, headers: { "content-type": "text/plain; charset=utf-8" } }
    );
  }

  const expected = await token(PASSWORD);

  // Sign out: /onboarding/?logout=1
  if (url.searchParams.get("logout") === "1") {
    context.cookies.delete({ name: COOKIE, path: "/" });
    return new Response("", { status: 303, headers: { Location: url.pathname } });
  }

  // Already signed in, serve the page.
  if (context.cookies.get(COOKIE) === expected) {
    return context.next();
  }

  // API calls get a plain JSON 401, never the HTML sign-in page.
  if (url.pathname.startsWith("/onboarding/api/")) {
    return new Response(JSON.stringify({ ok: false, error: "signed-out" }), {
      status: 401,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  }

  if (request.method === "POST") {
    const form = await request.formData();
    const pw = form.get("password");
    if (typeof pw === "string" && (await token(pw)) === expected) {
      context.cookies.set({
        name: COOKIE, value: expected,
        httpOnly: true, secure: true, sameSite: "Strict", path: "/", maxAge: MAX_AGE,
      });
      return new Response("", { status: 303, headers: { Location: url.pathname + url.search } });
    }
    return loginPage(true, usingFallback);
  }

  return loginPage(false, usingFallback);
};

export const config = { path: ["/onboarding", "/onboarding/*"] };
