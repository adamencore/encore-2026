// netlify/edge-functions/directors-gate.js
// Optional password gate for the private "2027 Season for Prospective Directors" page.
//
// The page is unlisted, noindex and out of the sitemap whether or not this gate is on.
// To turn the password on, set DIRECTORS_PAGE_PASSWORD in Netlify
// (Site configuration > Environment variables) and redeploy. While that variable is
// unset the page is served as is (fail open), so a link Adam has already sent keeps working.
//
// Deliberately its own password, not PROTECTED_PAGE_PASSWORD: that one also unlocks the
// Young Artist photo library, which an outside candidate must never reach.

const COOKIE = "directors_auth";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

async function token(pw) {
  const data = new TextEncoder().encode("encore-directors::" + pw);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

const NOINDEX = { "x-robots-tag": "noindex, nofollow", "cache-control": "no-store" };

function loginPage(showError) {
  const err = showError ? `<p class="err">That password did not match. Please try again.</p>` : "";
  const html = `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>2027 Season · Encore Performing Arts</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500&family=Familjen+Grotesk:wght@400;600&display=swap">
<style>
  *{margin:0;box-sizing:border-box}
  body{min-height:100vh;display:grid;place-items:center;background:#000;font-family:'Familjen Grotesk',system-ui,sans-serif;color:#282420;padding:24px}
  .card{background:#fdfcfa;border-radius:20px;max-width:400px;width:100%;padding:38px 32px;text-align:center}
  .badge{font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#a8452a}
  h1{font-family:'Fraunces',serif;font-weight:500;font-size:28px;margin:8px 0 8px}
  p{color:#5a534c;font-size:15px;line-height:1.5}
  form{margin-top:22px;display:flex;flex-direction:column;gap:12px}
  input{font:inherit;padding:13px 15px;border:1px solid #cfc8bf;border-radius:12px;background:#fff;color:#282420}
  input:focus{outline:2px solid #10789c;border-color:transparent}
  button{font:inherit;font-weight:600;padding:13px;border:0;border-radius:12px;background:#10789c;color:#fff;cursor:pointer}
  .err{color:#a8452a;font-size:14px;margin-top:12px}
</style></head><body>
  <div class="card">
    <span class="badge">Encore Performing Arts</span>
    <h1>2027 Season</h1>
    <p>Enter the password from your invitation to view the season schedule.</p>
    <form method="POST" autocomplete="off">
      <input type="password" name="password" placeholder="Password" aria-label="Password" required autofocus>
      <button type="submit">View the season</button>
    </form>
    ${err}
  </div>
</body></html>`;
  return new Response(html, {
    status: showError ? 401 : 200,
    headers: { "content-type": "text/html; charset=utf-8", ...NOINDEX },
  });
}

export default async (request, context) => {
  const url = new URL(request.url);
  const PASSWORD = Netlify.env.get("DIRECTORS_PAGE_PASSWORD");

  // No password set: serve the page, still marked noindex.
  if (!PASSWORD) {
    const res = await context.next();
    const out = new Response(res.body, res);
    out.headers.set("x-robots-tag", "noindex, nofollow");
    return out;
  }

  const expected = await token(PASSWORD);

  if (context.cookies.get(COOKIE) === expected) {
    const res = await context.next();
    const out = new Response(res.body, res);
    out.headers.set("x-robots-tag", "noindex, nofollow");
    out.headers.set("cache-control", "no-store");
    return out;
  }

  if (request.method === "POST") {
    const form = await request.formData();
    if ((form.get("password") || "") === PASSWORD) {
      context.cookies.set({
        name: COOKIE, value: expected, path: "/", httpOnly: true, secure: true,
        sameSite: "Lax", maxAge: MAX_AGE,
      });
      return new Response("", { status: 303, headers: { Location: url.pathname, ...NOINDEX } });
    }
    return loginPage(true);
  }

  return loginPage(false);
};

export const config = { path: ["/directors-2027-season-x7k", "/directors-2027-season-x7k.html"] };
