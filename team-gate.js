// netlify/edge-functions/team-gate.js
// Server-side password gate for the internal Team Hub (everything under /team/).
// The password is read from the PROTECTED_PAGE_PASSWORD environment variable in Netlify
// (Site configuration > Environment variables) — it is never sent to the browser.
// This is a single shared password (not per-user). Sessions last 12 hours.

const COOKIE = "team_auth";
const MAX_AGE = 60 * 60 * 12; // 12 hours

async function token(pw) {
  const data = new TextEncoder().encode("encore-team::" + pw);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function loginPage(showError) {
  const err = showError
    ? `<p class="err">That password didn't match. Try again.</p>`
    : "";
  const html = `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Team Hub · Sign in</title>
<link rel="stylesheet" href="/fonts/mikado.css">
<style>
  :root{--purple:#322949;--purple2:#473a63;--cream:#f5f1ec;--paper:#fffdf9;--muted:#5d566f;--coral:#e8716b;--line:rgba(32,65,74,.16)}
  *{margin:0;box-sizing:border-box}
  body{min-height:100vh;display:grid;place-items:center;background:radial-gradient(120% 120% at 30% 0%,var(--purple2),var(--purple) 60%);font-family:'Mikado',system-ui,sans-serif;color:var(--purple);padding:24px}
  .card{background:var(--paper);border-radius:20px;max-width:400px;width:100%;padding:38px 32px;box-shadow:0 30px 70px -30px rgba(0,0,0,.6);text-align:center}
  .badge{font-family:'Mikado',sans-serif;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--coral)}
  h1{font-family:'Mikado',sans-serif;font-weight:500;font-size:28px;margin:8px 0 6px;color:var(--purple)}
  p{color:var(--muted);font-size:14.5px;line-height:1.5}
  form{margin-top:22px;display:flex;flex-direction:column;gap:12px}
  input{font:inherit;padding:13px 15px;border:1px solid var(--line);border-radius:12px;background:#fff;color:var(--purple)}
  input:focus{outline:2px solid var(--purple2);border-color:transparent}
  button{font-family:'Mikado',sans-serif;font-weight:600;font-size:15px;padding:13px;border:0;border-radius:12px;background:var(--purple);color:#fff;cursor:pointer}
  button:hover{background:var(--purple2)}
  .err{color:var(--coral);font-size:13.5px;margin-top:12px}
</style></head><body>
  <div class="card">
    <span class="badge">Encore · Team Hub</span>
    <h1>Team sign in</h1>
    <p>This area is for Encore team members. Enter the team password to continue.</p>
    <form method="POST" autocomplete="off">
      <input type="password" name="password" placeholder="Team password" aria-label="Team password" required autofocus>
      <button type="submit">Enter</button>
    </form>
    ${err}
  </div>
</body></html>`;
  return new Response(html, {
    status: showError ? 401 : 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

export default async (request, context) => {
  const url = new URL(request.url);
  const PASSWORD = Netlify.env.get("PROTECTED_PAGE_PASSWORD");

  // Fail closed if no password is configured yet.
  if (!PASSWORD) {
    return new Response(
      "Team Hub isn't configured yet. An admin needs to set PROTECTED_PAGE_PASSWORD in Netlify (Site configuration > Environment variables).",
      { status: 503, headers: { "content-type": "text/plain; charset=utf-8" } }
    );
  }

  const expected = await token(PASSWORD);

  // Logout: /team/?logout=1
  if (url.searchParams.get("logout") === "1") {
    context.cookies.delete({ name: COOKIE, path: "/" });
    return new Response("", { status: 303, headers: { Location: url.pathname } });
  }

  // Already signed in → serve the page.
  if (context.cookies.get(COOKIE) === expected) {
    return context.next();
  }

  // Handle a sign-in submission.
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
    return loginPage(true);
  }

  // Not signed in → show the password screen.
  return loginPage(false);
};

export const config = { path: ["/team", "/team/*"] };
